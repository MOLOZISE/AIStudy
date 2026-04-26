'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { LeaderboardTable } from '@/components/study/mypage/LeaderboardTable';
import { mockLeaderboardEntries } from '@/lib/study/mock-data';

export default function MypageRankingPage() {
  return (
    <StudyShell title="학습 랭킹" description="전체 학습자 중 당신의 순위를 확인하세요">
      <LeaderboardTable entries={mockLeaderboardEntries} />
    </StudyShell>
  );
}
