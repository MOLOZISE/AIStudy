'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { QuestCard } from './QuestCard';

export function QuestsCard() {
  const { data, refetch } = trpc.study.getQuestSummary.useQuery();

  if (!data) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        퀘스트를 불러오는 중입니다.
      </div>
    );
  }

  if (data.quests.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-sm text-slate-500">
        <p className="font-semibold">오늘의 퀘스트가 없습니다</p>
        <p className="mt-1 text-xs">곧 새로운 퀨스트가 준비될 예정입니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">오늘의 퀘스트</h3>
        <Link href="/study/quests" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          모두 보기 →
        </Link>
      </div>

      {/* Quest summary */}
      <div className="flex gap-2 text-xs">
        <div className="rounded-md bg-slate-50 px-2 py-1">
          <span className="text-slate-600">진행: </span>
          <span className="font-semibold text-slate-900">{data.completedQuests}</span>
          <span className="text-slate-600">/{data.totalQuests}</span>
        </div>
        <div className="rounded-md bg-emerald-50 px-2 py-1">
          <span className="text-emerald-600">완료: </span>
          <span className="font-semibold text-emerald-700">{data.claimedQuests}</span>
        </div>
      </div>

      {/* Quests list */}
      <div className="space-y-2">
        {data.quests.slice(0, 3).map((quest) => (
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
            onClaimSuccess={() => refetch()}
          />
        ))}
      </div>
    </div>
  );
}
