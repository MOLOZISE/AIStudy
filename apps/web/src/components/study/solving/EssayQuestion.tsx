'use client';

import { SectionCard } from '@/components/study/shared';
import type { SolveQuestion } from '@/lib/study/study-types';
import { useState } from 'react';
import Link from 'next/link';

interface EssayQuestionProps {
  question: SolveQuestion;
  workbookId: string;
  onSubmit: (answer: string) => void;
  isLoading?: boolean;
}

export function EssayQuestion({
  question,
  workbookId,
  onSubmit,
  isLoading = false,
}: EssayQuestionProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer);
    }
  };

  const wordCount = answer.trim().split(/\s+/).filter(w => w.length > 0).length;

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

      {/* Answer Box */}
      <SectionCard>
        <div className="space-y-4">
          <div>
            <label htmlFor="essay-answer" className="block text-sm font-medium text-gray-900 mb-2">
              답안 작성
            </label>
            <textarea
              id="essay-answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="여기에 답안을 작성하세요. 자동 저장됩니다."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-2 text-xs text-gray-500">
              글자 수: {wordCount}개 단어
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Help Text */}
      <SectionCard>
        <p className="text-sm text-gray-600">
          <strong>팁:</strong> 명확하고 구체적인 답변을 작성하세요. 제출 후 모범 답안과 비교할 수 있습니다.
        </p>
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
          disabled={!answer.trim() || isLoading}
          className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '제출 중...' : '답안 제출'}
        </button>
      </div>
    </div>
  );
}
