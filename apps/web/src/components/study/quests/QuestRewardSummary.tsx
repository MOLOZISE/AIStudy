import { SectionCard, MetricCard } from '@/components/study/shared';

export function QuestRewardSummary({
  totalXp,
  totalPoints,
  weeklyAchievement,
}: {
  totalXp: number;
  totalPoints: number;
  weeklyAchievement: number;
}) {
  return (
    <div className="space-y-4">
      {/* Today's Rewards */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="오늘의 보상 XP" value={totalXp} />
        <MetricCard label="오늘의 보상 포인트" value={totalPoints} />
      </div>

      {/* Weekly Achievement */}
      <SectionCard>
        <h3 className="font-semibold text-gray-900 mb-3">이번 주 달성률</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">월요일 ~ 일요일</span>
            <span className="text-sm font-semibold text-gray-900">{weeklyAchievement}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-green-600"
              style={{ width: `${weeklyAchievement}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            주당 평균 {Math.round(weeklyAchievement / 7)}개 퀘스트 달성 중입니다.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
