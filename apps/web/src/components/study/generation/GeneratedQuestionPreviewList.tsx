import { SectionCard, StatusBadge, SkeletonList, EmptyState } from '@/components/study/shared';
import type { GeneratedQuestion } from '@/lib/study/study-types';
import Link from 'next/link';

export function GeneratedQuestionPreviewList({
  questions,
  isLoading,
}: {
  questions: GeneratedQuestion[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-lg font-semibold text-gray-900 mb-4">생성된 문제 미리보기</div>
        <SkeletonList count={5} />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <EmptyState
        icon="🎯"
        title="생성된 문제가 없습니다"
        description="아직 AI가 문제를 생성하지 않았습니다"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">생성된 문제 미리보기</h3>
        <span className="text-sm font-semibold text-gray-600">총 {questions.length}개</span>
      </div>

      <div className="space-y-3">
        {questions.map((question) => (
          <SectionCard key={question.id}>
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-600">#{question.order}</span>
                    <StatusBadge label="AI 생성" variant="info" />
                  </div>
                  <h4 className="text-base font-medium text-gray-900 truncate">{question.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{question.body}</p>
                </div>
                <div className="flex-shrink-0 text-right text-xs">
                  <div className="font-semibold text-gray-900">{question.type}</div>
                  <div className="text-gray-600 mt-1">{question.difficulty}</div>
                </div>
              </div>

              {question.choices && question.choices.length > 0 && (
                <div className="mt-2 pl-3 border-l-2 border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">선택지:</p>
                  <ol className="text-xs text-gray-600 space-y-0.5">
                    {question.choices.slice(0, 3).map((choice, i) => (
                      <li key={i}>
                        {i + 1}. {choice}
                      </li>
                    ))}
                    {question.choices.length > 3 && <li>...</li>}
                  </ol>
                </div>
              )}

              <div className="flex gap-2 text-xs text-gray-500">
                {question.subject && <span>과목: {question.subject}</span>}
              </div>
            </div>
          </SectionCard>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex gap-3 mt-6">
        <button className="flex-1 rounded-lg bg-blue-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-blue-700">
          📥 엑셀 다운로드
        </button>
        <Link href="/study/workbooks" className="flex-1">
          <button className="w-full rounded-lg bg-green-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-green-700">
            ✅ 문제집 저장
          </button>
        </Link>
        <button className="flex-1 rounded-lg border border-gray-300 bg-white text-gray-700 px-4 py-2.5 text-sm font-medium hover:bg-gray-50">
          ✏️ 웹 에디터
        </button>
      </div>
    </div>
  );
}
