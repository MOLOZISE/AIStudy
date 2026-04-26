'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { XpSummaryCard } from '@/components/study/mypage/XpSummaryCard';
import { LevelProgressCard } from '@/components/study/mypage/LevelProgressCard';
import { PointHistoryTable } from '@/components/study/mypage/PointHistoryTable';
import { mockUserProgress, mockPointHistory } from '@/lib/study/mock-data';

export default function MypagePointsPage() {
  return (
    <StudyShell
      title="포인트 & 경험치"
      description="현재 보유한 포인트와 경험치 상세 정보"
    >
      <div className="space-y-6">
        {/* XP Summary */}
        <XpSummaryCard
          totalXp={mockUserProgress.totalXp}
          points={mockUserProgress.points}
          monthlyXpGain={1200}
          monthlyPointsGain={450}
        />

        {/* Level Progress */}
        <LevelProgressCard
          currentLevel={mockUserProgress.level}
          currentXp={7850}
          xpForNextLevel={10000}
          totalXp={mockUserProgress.totalXp}
        />

        {/* Point History */}
        <PointHistoryTable transactions={mockPointHistory} />
      </div>
    </StudyShell>
  );
}
