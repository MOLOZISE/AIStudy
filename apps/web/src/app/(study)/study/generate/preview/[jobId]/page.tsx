'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { SectionCard } from '@/components/study/shared';
import { GeneratedQuestionPreviewList } from '@/components/study/generation/GeneratedQuestionPreviewList';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { mockGeneratedQuestions } from '@/lib/study/mock-data';

export default function GenerationPreviewPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [isLoading] = useState(false);

  return (
    <StudyShell
      title="생성 결과 미리보기"
      description={`생성 작업 ID: ${jobId} — 다음 버튼을 클릭하여 문제집을 저장하거나 웹 에디터에서 수정하세요`}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <SectionCard>
          <GeneratedQuestionPreviewList
            questions={mockGeneratedQuestions}
            isLoading={isLoading}
          />
        </SectionCard>

        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">
            ← 뒤로 가기
          </button>
          <button className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium">
            다음 → 문제집 저장
          </button>
        </div>
      </div>
    </StudyShell>
  );
}
