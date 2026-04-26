'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { PdfUploadPanel } from '@/components/study/generation/PdfUploadPanel';
import Link from 'next/link';

export default function PdfUploadPage() {
  return (
    <StudyShell
      title="PDF 업로드"
      description="학습 자료를 PDF로 업로드하여 AI가 자동으로 문제를 생성합니다"
    >
      <div className="max-w-4xl mx-auto space-y-6">

        <PdfUploadPanel />

        <div className="flex gap-3">
          <Link
            href="/study/generate"
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
          >
            ← 뒤로 가기
          </Link>
        </div>
      </div>
    </StudyShell>
  );
}
