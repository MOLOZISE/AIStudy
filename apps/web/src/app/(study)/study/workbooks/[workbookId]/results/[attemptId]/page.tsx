'use client';

import { use } from 'react';
import { StudyShell } from '@/components/study/StudyShell';
import { ResultSummaryCard } from '@/components/study/solving/ResultSummaryCard';
import { QuestionResultList } from '@/components/study/solving/QuestionResultList';
import { mockAttemptResult, mockSolveQuestions } from '@/lib/study/mock-data';
import Link from 'next/link';

export default function ResultsPage({ params }: { params: Promise<{ workbookId: string; attemptId: string }> }) {
  const { workbookId } = use(params);

  // Mock question results
  const questionResults = mockSolveQuestions.map((q, i) => ({
    order: q.order,
    title: q.body,
    isCorrect: i % 3 !== 0, // Mock: 2/3 correct
    userAnswer: q.type === 'multiple_choice' ? q.choices?.[i % (q.choices?.length || 4)] : 'Sample answer',
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
  }));

  return (
    <StudyShell
      title="풀이 결과"
      description="문제집 풀이가 완료되었습니다"
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Summary */}
        <ResultSummaryCard result={mockAttemptResult} />

        {/* Question Results */}
        <QuestionResultList results={questionResults} />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/study/wrong-notes" className="flex-1">
            <button className="w-full px-4 py-2.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium transition-colors">
              📝 오답노트 보기
            </button>
          </Link>
          <Link href={`/study/workbooks/${workbookId}/solve`} className="flex-1">
            <button className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
              🔄 다시 풀기
            </button>
          </Link>
          <Link href="/study" className="flex-1">
            <button className="w-full px-4 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium transition-colors">
              🏠 대시보드로 이동
            </button>
          </Link>
        </div>
      </div>
    </StudyShell>
  );
}
