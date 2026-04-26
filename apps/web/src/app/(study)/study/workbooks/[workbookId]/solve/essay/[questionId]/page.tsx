'use client';

import { use, useState } from 'react';
import { StudyShell } from '@/components/study/StudyShell';
import { SolveProgressStepper } from '@/components/study/solving/SolveProgressStepper';
import { EssayQuestion } from '@/components/study/solving/EssayQuestion';
import { mockSolveQuestions } from '@/lib/study/mock-data';
import { useRouter } from 'next/navigation';

export default function EssayPage({ params }: { params: Promise<{ workbookId: string; questionId: string }> }) {
  const { workbookId, questionId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining] = useState(1800); // 30 minutes

  const question = mockSolveQuestions.find((q) => q.id === questionId);
  const essayQuestions = mockSolveQuestions.filter((q) => q.type === 'essay' || q.type === 'short_answer');
  const currentIndex = essayQuestions.findIndex((q) => q.id === questionId);
  const totalQuestions = mockSolveQuestions.length;

  if (!question || (question.type !== 'essay' && question.type !== 'short_answer')) {
    return (
      <StudyShell title="오류" description="문제를 찾을 수 없습니다">
        <div className="text-center py-12">
          <p className="text-gray-600">요청한 문제를 찾을 수 없습니다.</p>
        </div>
      </StudyShell>
    );
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    // Mock submission
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Navigate to results
    router.push(`/study/workbooks/${workbookId}/results/attempt_${Date.now()}`);
  };

  return (
    <StudyShell title="주관식 풀이" description="">
      <div className="space-y-6">
        <SolveProgressStepper
          currentQuestion={currentIndex + 1}
          totalQuestions={totalQuestions}
          timeRemainingSeconds={timeRemaining}
          answeredCount={currentIndex}
        />

        <div className="max-w-3xl mx-auto">
          <EssayQuestion
            question={question}
            workbookId={workbookId}
            onSubmit={() => handleSubmit()}
            isLoading={isLoading}
          />
        </div>
      </div>
    </StudyShell>
  );
}
