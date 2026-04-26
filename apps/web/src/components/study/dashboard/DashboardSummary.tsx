import { MetricCard } from '@/components/study/shared';
import type { DashboardSummary as DashboardSummaryType } from '@/lib/study/study-types';

export function DashboardSummary({ data }: { data: DashboardSummaryType }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <MetricCard label="오늘 학습 시간" value={data.studyTimeTodayMinutes} unit="분" />
      <MetricCard label="이번 주 정답률" value={data.weeklyAccuracyRate} unit="%" />
      <MetricCard label="연속 학습일" value={data.streakDays} unit="일" />
    </div>
  );
}
