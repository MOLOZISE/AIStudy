import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db, studyAiGenerationJobs } from '@repo/db';
import { eq } from 'drizzle-orm';
import { extractPdfText, generateWorkbookDraft, updateJobStatus } from '@/lib/study/aiGeneration';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout

const STORAGE_BUCKET = 'study-ai-pdfs';

function badRequest(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

async function requireUser(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authHeader = req.headers.get('authorization');

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 환경 변수가 설정되어 있지 않습니다.');
  }

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const {
    data: { user },
  } = await supabase.auth.getUser(authHeader.slice(7));

  return user;
}

function storageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되어 있지 않습니다.');
  }

  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    if (!user) return badRequest('로그인이 필요합니다.', 401);

    const body = await req.json() as { jobId: string; storagePath: string };
    const { jobId, storagePath } = body;

    if (!jobId || !storagePath) {
      return badRequest('jobId와 storagePath가 필요합니다.');
    }

    // Verify job ownership
    const job = await db.query.studyAiGenerationJobs.findFirst({
      where: eq(studyAiGenerationJobs.id, jobId),
    });

    if (!job || job.userId !== user.id) {
      return badRequest('AI generation job을 찾을 수 없습니다.', 404);
    }

    // Update status to extracting
    await updateJobStatus(jobId, 'extracting', 10);

    // Download PDF from storage
    const supabase = storageClient();
    const { data, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(storagePath);

    if (downloadError || !data) {
      await updateJobStatus(jobId, 'failed', 0, undefined, {
        error: 'PDF 다운로드 실패',
        message: downloadError?.message,
      });
      return NextResponse.json({
        ok: false,
        message: 'PDF 다운로드 실패',
      });
    }

    // Extract text from PDF
    const buffer = await data.arrayBuffer();
    let extractedText: string;

    try {
      extractedText = await extractPdfText(Buffer.from(buffer));
      await updateJobStatus(jobId, 'extracting', 30, undefined, undefined);
    } catch (extractError: any) {
      await updateJobStatus(jobId, 'failed', 30, undefined, {
        error: '텍스트 추출 실패',
        message: extractError.message,
      });
      return NextResponse.json({
        ok: false,
        message: extractError.message || '텍스트 추출 실패',
      });
    }

    // Generate draft using AI
    await updateJobStatus(jobId, 'generating', 50);

    try {
      const draft = await generateWorkbookDraft(jobId, user.id, extractedText);

      // Update job with draft
      await updateJobStatus(jobId, 'ready', 100, {
        draft,
      });

      return NextResponse.json({
        ok: true,
        jobId,
        draft,
      });
    } catch (generateError: any) {
      await updateJobStatus(jobId, 'failed', 50, undefined, {
        error: 'AI 생성 실패',
        message: generateError.message,
      });
      return NextResponse.json({
        ok: false,
        message: generateError.message || 'AI 생성 실패',
      });
    }
  } catch (error) {
    console.error('AI generation process error:', error);
    return badRequest('AI 생성 처리 중 오류가 발생했습니다.', 500);
  }
}
