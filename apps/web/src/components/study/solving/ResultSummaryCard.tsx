import type { AttemptResult } from '@/lib/study/study-types';
import { SectionCard, MetricCard } from '@/components/study/shared';

interface ResultSummaryCardProps {
  result: AttemptResult;
}

export function ResultSummaryCard({ result }: ResultSummaryCardProps) {
  const minutes = Math.floor(result.durationSeconds / 60);
  const seconds = result.durationSeconds % 60;

  return (
    <SectionCard>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">풀이 결과 요약</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="총점"
            value={`${result.score}점`}
          />
          <MetricCard
            label="정답률"
            value={`${result.accuracyRate}%`}
          />
          <MetricCard
            label="정답 문항"
            value={`${result.correctCount}/${result.totalCount}`}
          />
          <MetricCard
            label="소요 시간"
            value={`${minutes}분 ${seconds}초`}
          />
        </div>
      </div>
    </SectionCard>
  );
}
