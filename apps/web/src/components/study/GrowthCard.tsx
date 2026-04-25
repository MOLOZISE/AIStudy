'use client';

import { trpc } from '@/lib/trpc';

export function GrowthCard() {
  const { data } = trpc.study.getGrowthSummary.useQuery();

  if (!data) return null;

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      {/* Level and XP */}
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">레벨</p>
            <p className="text-3xl font-bold text-blue-600">{data.level}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">{data.totalXp} XP</p>
            <p className="text-xs text-slate-500">{data.totalPoints} 포인트</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-600">다음 레벨까지</p>
            <p className="text-xs font-semibold text-slate-600">{data.nextLevelProgress}%</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${Math.min(data.nextLevelProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <div className="rounded-md bg-amber-50 p-3">
          <p className="text-xs text-amber-600">현재 스트릭</p>
          <p className="mt-1 text-lg font-bold text-amber-700">{data.currentStreak}일</p>
        </div>
        <div className="rounded-md bg-orange-50 p-3">
          <p className="text-xs text-orange-600">최장 스트릭</p>
          <p className="mt-1 text-lg font-bold text-orange-700">{data.longestStreak}일</p>
        </div>
      </div>

      {/* Recent rewards */}
      {data.recentEvents.length > 0 && (
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-700 mb-2">최근 활동</p>
          <div className="space-y-1.5 text-xs">
            {data.recentEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center justify-between">
                <span className="text-slate-600">{getEventLabel(event.eventType)}</span>
                <span className="font-semibold text-blue-600">+{event.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getEventLabel(eventType: string): string {
  const labels: Record<string, string> = {
    question_attempt: '문제 풀이',
    question_correct_bonus: '정답 보너스',
    wrong_note_review_success: '오답 복습 성공',
    wrong_note_marked_mastered: '오답 정복',
    exam_completed: '모의고사 완료',
    workbook_created: '문제집 생성',
    workbook_published: '문제집 공개',
    comment_created: '댓글 작성',
    review_created: '리뷰 작성',
  };
  return labels[eventType] || eventType;
}
