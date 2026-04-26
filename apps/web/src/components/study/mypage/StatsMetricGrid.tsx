import { SectionCard, MetricCard } from '@/components/study/shared';

interface StatsMetricGridProps {
  totalStudyTimeMinutes: number;
  overallAccuracyRate: number;
  totalQuestionsStudied: number;
  streakDays: number;
}

export function StatsMetricGrid({
  totalStudyTimeMinutes,
  overallAccuracyRate,
  totalQuestionsStudied,
  streakDays,
}: StatsMetricGridProps) {
  const hours = Math.floor(totalStudyTimeMinutes / 60);
  const minutes = totalStudyTimeMinutes % 60;

  return (
    <SectionCard>
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">학습 통계</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="총 학습 시간"
            value={hours}
            unit={`시간 ${minutes}분`}
          />
          <MetricCard label="정답률" value={`${overallAccuracyRate}%`} />
          <MetricCard label="학습한 문제" value={totalQuestionsStudied} />
          <MetricCard label="연속 학습일" value={streakDays} unit="일" />
        </div>
      </div>
    </SectionCard>
  );
}
