'use client';

import { use, useState } from 'react';
import { StudyShell } from '@/components/study/StudyShell';
import { SolveProgressStepper } from '@/components/study/solving/SolveProgressStepper';
import { MultipleChoiceQuestion } from '@/components/study/solving/MultipleChoiceQuestion';
import { mockSolveQuestions } from '@/lib/study/mock-data';
import { useRouter } from 'next/navigation';

export default function MCQPage({ params }: { params: Promise<{ workbookId: string; questionId: string }> }) {
  const { workbookId, questionId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining] = useState(1800); // 30 minutes

  const question = mockSolveQuestions.find((q) => q.id === questionId);
  const currentIndex = mockSolveQuestions.findIndex((q) => q.id === questionId);

  if (!question || question.type !== 'multiple_choice') {
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
    // Navigate to results or next question
    router.push(`/study/workbooks/${workbookId}/results/attempt_${Date.now()}`);
  };

  return (
    <StudyShell title="객관식 풀이" description="">
      <div className="space-y-6">
        <SolveProgressStepper
          currentQuestion={currentIndex + 1}
          totalQuestions={mockSolveQuestions.length}
          timeRemainingSeconds={timeRemaining}
          answeredCount={currentIndex}
        />

        <div className="max-w-3xl mx-auto">
          <MultipleChoiceQuestion
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
