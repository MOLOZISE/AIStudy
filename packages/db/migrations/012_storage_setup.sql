-- Storage 버킷 생성 + RLS 정책
-- Supabase SQL Editor에서 1회 실행 (이미 버킷이 있으면 무시됨)
-- 또는 Supabase 대시보드 > Storage > New bucket 으로 대체 가능

INSERT INTO storage.buckets (id, name, public)
VALUES ('study-workbooks', 'study-workbooks', false)
ON CONFLICT (id) DO NOTHING;

-- 인증된 사용자는 자신의 폴더(workbooks/{uid}/...)에만 업로드 가능
CREATE POLICY "auth users can upload workbooks"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'study-workbooks'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- 본인이 업로드한 파일만 조회 가능
CREATE POLICY "users can read own workbooks"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'study-workbooks'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
