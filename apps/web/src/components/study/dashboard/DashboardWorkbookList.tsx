import { SectionCard, StatusBadge, EmptyState } from '@/components/study/shared';
import type { WorkbookListItem } from '@/lib/study/study-types';
import Link from 'next/link';

export function DashboardWorkbookList({ workbooks }: { workbooks: WorkbookListItem[] }) {
  if (workbooks.length === 0) {
    return (
      <SectionCard>
        <EmptyState
          icon="📚"
          title="문제집이 없습니다"
          description="새로운 문제집을 만들어 학습을 시작하세요"
          action={
            <Link href="/study/generate">
              <button className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">
                문제집 만들기
              </button>
            </Link>
          }
        />
      </SectionCard>
    );
  }

  return (
    <div className="space-y-3">
      {workbooks.slice(0, 3).map((wb) => (
        <Link key={wb.id} href={`/study/workbooks/${wb.id}`}>
          <SectionCard className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">{wb.title}</h3>
                <div className="flex gap-2 mt-2">
                  <StatusBadge label={wb.subject} variant="info" />
                  <StatusBadge
                    label={wb.difficulty}
                    variant={
                      wb.difficulty === 'easy'
                        ? 'success'
                        : wb.difficulty === 'hard'
                          ? 'danger'
                          : 'warning'
                    }
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {wb.questionCount}개 문제 • 마지막: {wb.lastStudiedAt}
                </p>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">진행률</span>
                    <span className="text-xs font-semibold">{wb.progressRate}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${wb.progressRate}%` }}
                    />
                  </div>
                </div>
              </div>
              <button className="flex-shrink-0 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-blue-700 whitespace-nowrap">
                이어서 풀기
              </button>
            </div>
          </SectionCard>
        </Link>
      ))}
      {workbooks.length > 3 && (
        <Link href="/study/workbooks">
          <div className="text-center py-3 text-sm text-blue-600 hover:underline font-medium cursor-pointer">
            전체 보기 →
          </div>
        </Link>
      )}
    </div>
  );
}
