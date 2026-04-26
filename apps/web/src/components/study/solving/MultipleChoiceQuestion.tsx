'use client';

import { SectionCard } from '@/components/study/shared';
import type { SolveQuestion } from '@/lib/study/study-types';
import { useState } from 'react';
import Link from 'next/link';

interface MultipleChoiceQuestionProps {
  question: SolveQuestion;
  workbookId: string;
  onSubmit: (answer: string) => void;
  isLoading?: boolean;
}

export function MultipleChoiceQuestion({
  question,
  workbookId,
  onSubmit,
  isLoading = false,
}: MultipleChoiceQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedAnswer) {
      onSubmit(selectedAnswer);
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <SectionCard>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Q{question.order}. {question.body}</h2>
          </div>
        </div>
      </SectionCard>

      {/* Choices */}
      <SectionCard>
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-900 mb-4">정답을 선택하세요</p>
          <fieldset className="space-y-2">
            <legend className="sr-only">정답 선택</legend>
            {question.choices?.map((choice, index) => (
              <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="answer"
                  value={choice}
                  checked={selectedAnswer === choice}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className={`flex-1 text-sm ${selectedAnswer === choice ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  {String.fromCharCode(65 + index)}.  {choice}
                </span>
              </label>
            ))}
          </fieldset>
        </div>
      </SectionCard>

      {/* Action Buttons */}
      <div className="flex gap-3 sticky bottom-6">
        <Link href={`/study/workbooks/${workbookId}/solve`}>
          <button className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
            ← 돌아가기
          </button>
        </Link>
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer || isLoading}
          className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '제출 중...' : '정답 제출'}
        </button>
      </div>
    </div>
  );
}
