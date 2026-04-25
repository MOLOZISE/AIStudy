'use client';

interface RewardEvent {
  id: string;
  eventType: string;
  xp: number;
  points: number;
  createdAt: string | null;
}

export function RewardEventsList({ events }: { events: RewardEvent[] }) {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-500 mb-4">최근 활동</p>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {events.map((event) => (
          <div key={event.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-md">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{getEventLabel(event.eventType)}</p>
              <p className="text-xs text-slate-500">
                {event.createdAt ? new Date(event.createdAt).toLocaleDateString('ko-KR') : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-blue-600">+{event.xp} XP</p>
              <p className="text-xs text-slate-500">+{event.points} pt</p>
            </div>
          </div>
        ))}
      </div>
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
    daily_quest_completed: '일일 퀘스트 완료',
    weekly_quest_completed: '주간 퀘스트 완료',
    monthly_quest_completed: '월간 퀘스트 완료',
  };
  return labels[eventType] || eventType;
}
