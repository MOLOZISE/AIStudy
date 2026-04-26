'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { BadgeGrid } from '@/components/study/mypage/BadgeGrid';
import { LevelProgressCard } from '@/components/study/mypage/LevelProgressCard';
import { mockBadges, mockUserProgress } from '@/lib/study/mock-data';

export default function MyPageBadgesPage() {
  const earnedBadgeIds = mockBadges
    .filter((b) => b.earnedAt)
    .map((b) => b.id);

  return (
    <StudyShell
      title="배지 & 레벨"
      description="획득한 배지와 다음 레벨까지의 진행 상황을 확인하세요"
    >
      <div className="space-y-6">
        {/* Level Progress */}
        <LevelProgressCard
          currentLevel={mockUserProgress.level}
          currentXp={7850}
          xpForNextLevel={10000}
          totalXp={mockUserProgress.totalXp}
        />

        {/* Badge Grid */}
        <BadgeGrid
          badges={mockBadges}
          earnedBadgeIds={earnedBadgeIds}
          title="배지"
        />
      </div>
    </StudyShell>
  );
}
