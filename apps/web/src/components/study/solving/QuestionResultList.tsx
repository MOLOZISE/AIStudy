import { SectionCard } from '@/components/study/shared';

interface QuestionResult {
  order: number;
  title: string;
  isCorrect: boolean;
  userAnswer?: string;
  correctAnswer?: string;
  explanation?: string;
}

interface QuestionResultListProps {
  results: QuestionResult[];
}

export function QuestionResultList({ results }: QuestionResultListProps) {
  return (
    <SectionCard>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">문항별 채점 결과</h3>

        <div className="space-y-2">
          {results.map((result) => (
            <div key={result.order} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold text-white"
                          style={{ backgroundColor: result.isCorrect ? '#10b981' : '#ef4444' }}>
                      {result.isCorrect ? '✓' : '✕'}
                    </span>
                    <h4 className="font-medium text-gray-900 line-clamp-1">Q{result.order}. {result.title}</h4>
                  </div>
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap px-2 py-1 rounded ${
                  result.isCorrect
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {result.isCorrect ? '정답' : '오답'}
                </span>
              </div>

              {!result.isCorrect && (
                <div className="mt-2 space-y-1 text-xs">
                  {result.userAnswer && (
                    <p className="text-gray-600">
                      <span className="font-medium">내 답:</span> {result.userAnswer}
                    </p>
                  )}
                  {result.correctAnswer && (
                    <p className="text-green-600">
                      <span className="font-medium">정답:</span> {result.correctAnswer}
                    </p>
                  )}
                  {result.explanation && (
                    <details className="mt-2 cursor-pointer">
                      <summary className="font-medium text-gray-700 hover:text-gray-900">
                        해설 보기
                      </summary>
                      <p className="mt-1 text-gray-600 ml-3">{result.explanation}</p>
                    </details>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
