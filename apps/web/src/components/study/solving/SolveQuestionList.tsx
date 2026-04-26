import type { SolveQuestion } from '@/lib/study/study-types';
import Link from 'next/link';

interface SolveQuestionListProps {
  questions: SolveQuestion[];
  workbookId: string;
  answeredIds?: string[];
}

const typeLabel: Record<string, string> = {
  multiple_choice: '객관식',
  essay: '주관식',
  short_answer: '단답형',
};

export function SolveQuestionList({
  questions,
  workbookId,
  answeredIds = [],
}: SolveQuestionListProps) {
  const mcqs = questions.filter((q) => q.type === 'multiple_choice');
  const essays = questions.filter((q) => q.type === 'essay' || q.type === 'short_answer');

  const renderQuestions = (qs: SolveQuestion[]) =>
    qs.map((q) => (
      <Link
        key={q.id}
        href={
          q.type === 'multiple_choice'
            ? `/study/workbooks/${workbookId}/solve/mcq/${q.id}`
            : `/study/workbooks/${workbookId}/solve/essay/${q.id}`
        }
      >
        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer bg-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
                  {q.order}
                </span>
                {answeredIds.includes(q.id) && (
                  <span className="text-xs font-medium text-green-600">✓ 풀음</span>
                )}
              </div>
              <h3 className="font-medium text-gray-900 line-clamp-2">{q.body}</h3>
              <p className="text-xs text-gray-500 mt-1">{typeLabel[q.type]}</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-medium whitespace-nowrap transition-colors">
              풀이
            </button>
          </div>
        </div>
      </Link>
    ));

  return (
    <div className="space-y-6">
      {/* MCQ */}
      {mcqs.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">객관식 ({mcqs.length}개)</h3>
          <div className="space-y-2">
            {renderQuestions(mcqs)}
          </div>
        </div>
      )}

      {/* Essays */}
      {essays.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">주관식 ({essays.length}개)</h3>
          <div className="space-y-2">
            {renderQuestions(essays)}
          </div>
        </div>
      )}
    </div>
  );
}
