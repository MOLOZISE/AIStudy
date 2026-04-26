'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { SectionCard, SegmentTabs } from '@/components/study/shared';
import { QuestCard } from '@/components/study/quests/QuestCard';
import { QuestRewardSummary } from '@/components/study/quests/QuestRewardSummary';
import { mockQuests } from '@/lib/study/mock-data';
import { useState } from 'react';

export default function StudyQuestsPage() {
  const [questType, setQuestType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const questTabs = [
    { value: 'daily', label: '오늘의 퀘스트' },
    { value: 'weekly', label: '주간 퀘스트' },
    { value: 'monthly', label: '월간 퀘스트' },
  ];

  const filteredQuests = mockQuests.filter((q) => q.type === questType);
  const totalXp = filteredQuests.filter((q) => q.completed).reduce((sum, q) => sum + q.reward.xp, 0);
  const totalPoints = filteredQuests.filter((q) => q.completed).reduce((sum, q) => sum + q.reward.points, 0);
  const completedCount = filteredQuests.filter((q) => q.completed).length;
  const weeklyAchievement = Math.round((completedCount / filteredQuests.length) * 100);

  return (
    <StudyShell
      title="퀘스트"
      description="매일, 매주, 매달 완료할 수 있는 퀘스트로 보상을 얻으세요"
    >
      {/* Quest Type Tabs */}
      <div className="mb-8">
        <SegmentTabs
          items={questTabs}
          value={questType}
          onChange={(value) => setQuestType(value as 'daily' | 'weekly' | 'monthly')}
        />
      </div>

      {/* Quest List */}
      <div className="mb-8 space-y-4">
        {filteredQuests.map((quest) => (
          <SectionCard key={quest.id}>
            <QuestCard quest={quest} />
          </SectionCard>
        ))}
      </div>

      {/* Reward Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">보상 요약</h2>
        <QuestRewardSummary totalXp={totalXp} totalPoints={totalPoints} weeklyAchievement={weeklyAchievement} />
      </div>
    </StudyShell>
  );
}
