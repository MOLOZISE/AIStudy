'use client';

import { trpc } from '@/lib/trpc';
import { QuestCard } from './QuestCard';

export function QuestsPage() {
  const { data: today, refetch: refetchToday } = trpc.study.getTodayQuests.useQuery();
  const { data: weekly, refetch: refetchWeekly } = trpc.study.getWeeklyQuests.useQuery();
  const { data: monthly } = trpc.study.getMonthlyQuests.useQuery();

  if (!today || !weekly || !monthly) {
    return <div className="text-center text-sm text-slate-500">퀘스트를 불러오는 중입니다...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Daily Quests */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">일일 퀘스트</h2>
        {today.quests.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            일일 퀘스트가 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {today.quests.map((quest) => (
              <QuestCard
                key={quest.id}
                id={quest.id}
                title={quest.title}
                description={quest.description ?? undefined}
                targetValue={quest.targetValue}
                currentValue={quest.currentValue}
                rewardXp={quest.rewardXp}
                rewardPoints={quest.rewardPoints}
                isCompleted={quest.isCompleted}
                isClaimed={quest.isClaimed}
                endsAt={new Date(quest.endsAt)}
                onClaimSuccess={() => refetchToday()}
              />
            ))}
          </div>
        )}
      </section>

      {/* Weekly Quests */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">주간 퀘스트</h2>
        {weekly.quests.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            주간 퀨스트가 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {weekly.quests.map((quest) => (
              <QuestCard
                key={quest.id}
                id={quest.id}
                title={quest.title}
                description={quest.description ?? undefined}
                targetValue={quest.targetValue}
                currentValue={quest.currentValue}
                rewardXp={quest.rewardXp}
                rewardPoints={quest.rewardPoints}
                isCompleted={quest.isCompleted}
                isClaimed={quest.isClaimed}
                endsAt={new Date(quest.endsAt)}
                onClaimSuccess={() => refetchWeekly()}
              />
            ))}
          </div>
        )}
      </section>

      {/* Monthly Quests */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">월간 퀘스트</h2>
        {monthly.quests.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            월간 퀘스트가 준비 중입니다.
          </div>
        ) : (
          <div className="space-y-2">
            {monthly.quests.map((quest) => (
              <QuestCard
                key={quest.id}
                id={quest.id}
                title={quest.title}
                description={quest.description ?? undefined}
                targetValue={quest.targetValue}
                currentValue={quest.currentValue}
                rewardXp={quest.rewardXp}
                rewardPoints={quest.rewardPoints}
                isCompleted={quest.isCompleted}
                isClaimed={quest.isClaimed}
                endsAt={new Date(quest.endsAt)}
                onClaimSuccess={() => {}}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
