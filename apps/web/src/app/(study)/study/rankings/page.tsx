import { StudyShell } from '@/components/study/StudyShell';
import { RankingsPage } from '@/components/study/RankingsPage';

export const metadata = { title: 'Rankings - AIStudy' };

export default function Page() {
  return (
    <StudyShell title="랭킹" description="문제집과 사용자 랭킹">
      <RankingsPage />
    </StudyShell>
  );
}
