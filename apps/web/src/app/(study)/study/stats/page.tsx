import { StudyShell } from '@/components/study/StudyShell';
import { StudyStatsCards } from '@/components/study/StudyStatsCards';

export default function StudyStatsPage() {
  return (
    <StudyShell title="학습 통계" description="attempt와 wrong_notes를 기반으로 집계 카드를 표시할 화면입니다.">
      <StudyStatsCards />
    </StudyShell>
  );
}
