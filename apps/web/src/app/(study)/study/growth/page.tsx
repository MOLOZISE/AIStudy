import { StudyShell } from '@/components/study/StudyShell';
import { GrowthDashboard } from '@/components/study/GrowthDashboard';

export default function GrowthPage() {
  return (
    <StudyShell title="성장 현황" description="레벨, XP, 스트릭 및 최근 활동을 확인하세요.">
      <GrowthDashboard />
    </StudyShell>
  );
}
