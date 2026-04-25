import { createHash, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STORAGE_BUCKET = 'study-ai-pdfs';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) return badRequest('PDF 파일을 선택해 주세요.');

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'pdf') return badRequest('PDF 파일만 업로드할 수 있습니다.');

    if (file.size > MAX_FILE_SIZE) return badRequest(`파일 크기는 ${MAX_FILE_SIZE / 1024 / 1024}MB 이하여야 합니다.`);

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileHash = createHash('sha256').update(buffer).digest('hex');
    const jobId = randomUUID();
    const storagePath = `${user.id}/${jobId}/${fileHash.substring(0, 8)}.pdf`;

    const supabase = storageClient();

    // Create bucket if it doesn't exist
    try {
      await supabase.storage.createBucket(STORAGE_BUCKET, { public: false });
    } catch {
      // Bucket might already exist, continue
    }

    const upload = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, { cacheControl: '3600', upsert: false });

    if (upload.error) {
      return badRequest(`업로드 실패: ${upload.error.message}`);
    }

    return NextResponse.json({
      ok: true,
      jobId,
      fileName: file.name,
      fileSize: file.size,
      fileHash,
      storagePath,
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    return badRequest('PDF 업로드 중 오류가 발생했습니다.', 500);
  }
}
