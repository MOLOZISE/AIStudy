import { StudyShell } from '@/components/study/StudyShell';
import { StudyStatsCards } from '@/components/study/StudyStatsCards';
import { StudyStatsDetailed } from '@/components/study/StudyStatsDetailed';

export default function StudyStatsPage() {
  return (
    <StudyShell title="학습 통계" description="나의 풀이 현황과 문제집별 정답률을 확인하세요.">
      <StudyStatsCards />
      <StudyStatsDetailed />
    </StudyShell>
  );
}
