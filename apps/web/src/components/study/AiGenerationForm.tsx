'use client';

import { useRef, useState } from 'react';
import { trpc } from '@/lib/trpc';

interface AiGenerationFormProps {
  onJobCreated: (jobId: string) => void;
}

export function AiGenerationForm({ onJobCreated }: AiGenerationFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const createJob = trpc.study.createAiGenerationJob.useMutation();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('PDF 파일만 업로드할 수 있습니다.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError(`파일 크기는 10MB 이하여야 합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      return;
    }

    setFileName(file.name);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0]) {
      setError('PDF 파일을 선택해주세요.');
      return;
    }

    const file = fileInputRef.current.files[0];

    try {
      setIsLoading(true);
      setError(null);

      // 1. Upload PDF file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/study/ai-generate/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json() as { message: string };
        throw new Error(errorData.message || 'PDF 업로드 실패');
      }

      const uploadData = await uploadResponse.json() as {
        jobId: string;
        fileName: string;
        fileSize: number;
      };

      // 2. Create job in DB
      // Note: extraction happens asynchronously in the background
      // For now, we'll trigger it immediately but in production this should be a background job

      // For P13-A MVP, we'll do extraction synchronously
      // In production, this should be a background worker
      await createJob.mutateAsync({
        jobId: uploadData.jobId,
        fileName: uploadData.fileName,
        fileSize: uploadData.fileSize,
        extractedText: '', // Will be filled by process endpoint
      });

      // 3. Trigger processing in the background
      // For MVP, we'll call it synchronously to keep UI simple
      const processResponse = await fetch('/api/study/ai-generate/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          jobId: uploadData.jobId,
          storagePath: uploadData.fileName, // Placeholder - actual path from upload
        }),
      });

      if (!processResponse.ok) {
        console.warn('Processing request failed, job created but processing may not complete');
      }

      // Trigger job creation
      onJobCreated(uploadData.jobId);

      // Reset form
      fileInputRef.current.value = '';
      setFileName('');
    } catch (err: any) {
      setError(err.message || 'PDF 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="space-y-2">
          <p className="text-3xl">📄</p>
          <p className="text-sm font-semibold text-slate-900">
            {fileName ? `선택됨: ${fileName}` : 'PDF 파일을 드래그하거나 클릭하여 업로드'}
          </p>
          <p className="text-xs text-slate-500">최대 10MB</p>
        </div>
      </div>

      {/* Constraints */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
        <p className="text-xs font-semibold text-slate-700">제한 사항:</p>
        <ul className="text-xs text-slate-600 space-y-1">
          <li>✓ PDF 파일만 지원 (최대 10MB)</li>
          <li>✓ OCR 미지원 - 텍스트 기반 PDF만 가능</li>
          <li>✓ 생성 결과는 반드시 검수 필요</li>
          <li>✓ 저작권 있는 자료 확인 후 업로드</li>
        </ul>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !fileName}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
      >
        {isLoading ? '처리 중...' : '문제 생성 시작'}
      </button>

      <p className="text-xs text-slate-600 text-center">
        생성 결과는 5분 이내에 나타납니다. &quot;생성 목록&quot;에서 확인해주세요.
      </p>
    </form>
  );
}
