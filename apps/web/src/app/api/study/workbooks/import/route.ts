import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sql } from 'drizzle-orm';
import { db, studySubjects, studyWorkbooks } from '@repo/db';
import { importStudyWorkbook } from '@/lib/study/importWorkbook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STORAGE_BUCKET = 'study-workbooks';

function badRequest(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

function safeSlug(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'excel-study';
}

function safeFilename(value: string): string {
  return value.replace(/[^\w.가-힣-]+/g, '-').replace(/-+/g, '-');
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
    if (!(file instanceof File)) return badRequest('xlsx 파일을 선택해 주세요.');

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'xlsx') return badRequest('xlsx 파일만 업로드할 수 있습니다.');

    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) return badRequest('파일 크기는 20MB 이하여야 합니다.');

    const subjectName = String(formData.get('subjectName') || file.name.replace(/\.[^.]+$/, '') || 'Excel 학습');
    const subjectSlug = safeSlug(String(formData.get('subjectSlug') || subjectName));
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileHash = createHash('sha256').update(buffer).digest('hex');
    const storagePath = `workbooks/${user.id}/${fileHash}-${safeFilename(file.name)}`;

    const [subject] = await db
      .insert(studySubjects)
      .values({ slug: subjectSlug, name: subjectName, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: studySubjects.slug,
        set: { name: sql`excluded.name`, updatedAt: new Date() },
      })
      .returning({ id: studySubjects.id });

    const supabase = storageClient();
    const upload = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, buffer, {
      contentType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      upsert: true,
    });

    if (upload.error) {
      return badRequest(`Storage 업로드 실패: ${upload.error.message}`, 500);
    }

    const [workbook] = await db
      .insert(studyWorkbooks)
      .values({
        subjectId: subject.id,
        uploadedBy: user.id,
        originalFilename: file.name,
        storageBucket: STORAGE_BUCKET,
        storagePath,
        fileHash,
        status: 'importing',
        metadata: { size: file.size, contentType: file.type },
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: studyWorkbooks.storagePath,
        set: {
          subjectId: sql`excluded.subject_id`,
          uploadedBy: sql`excluded.uploaded_by`,
          originalFilename: sql`excluded.original_filename`,
          fileHash: sql`excluded.file_hash`,
          status: 'importing',
          metadata: sql`excluded.metadata`,
          updatedAt: new Date(),
        },
      })
      .returning({ id: studyWorkbooks.id });

    const result = await importStudyWorkbook({
      workbookId: workbook.id,
      subjectId: subject.id,
      requestedBy: user.id,
      sourceHash: fileHash,
      buffer,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'workbook import 중 오류가 발생했습니다.';
    return badRequest(message, 500);
  }
}
