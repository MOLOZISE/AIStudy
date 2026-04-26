import { SectionCard, MetricCard } from '@/components/study/shared';

interface XpSummaryCardProps {
  totalXp: number;
  points: number;
  monthlyXpGain: number;
  monthlyPointsGain: number;
}

export function XpSummaryCard({
  totalXp,
  points,
  monthlyXpGain,
  monthlyPointsGain,
}: XpSummaryCardProps) {
  return (
    <SectionCard>
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">포인트 & 경험치</h3>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="보유 XP" value={totalXp} />
          <MetricCard label="보유 포인트" value={points} />
          <MetricCard label="이번 달 XP" value={`+${monthlyXpGain}`} />
          <MetricCard label="이번 달 포인트" value={`+${monthlyPointsGain}`} />
        </div>
      </div>
    </SectionCard>
  );
}
