'use client';

import { trpc } from '@/lib/trpc';
import { GrowthCard } from './GrowthCard';
import { RewardEventsList } from './RewardEventsList';

export function GrowthDashboard() {
  const { data } = trpc.study.getMyProgress.useQuery();
  const { data: recentEvents } = trpc.study.listRecentRewardEvents.useQuery({ limit: 20 });

  if (!data) {
    return <div className="text-center text-sm text-slate-500">성장 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Main growth card */}
      <GrowthCard />

      {/* Detailed stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* XP Details */}
        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">XP 상세</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">누적 XP</span>
              <span className="font-semibold text-slate-900">{data.totalXp}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">다음 레벨까지</span>
              <span className="font-semibold text-blue-600">{data.nextLevelXp} XP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">레벨별 진행도</span>
              <span className="font-semibold text-slate-900">{data.progress}%</span>
            </div>
          </div>
        </div>

        {/* Points and Level */}
        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">포인트 및 레벨</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">누적 포인트</span>
              <span className="font-semibold text-slate-900">{data.totalPoints}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">현재 레벨</span>
              <span className="text-2xl font-bold text-blue-600">{data.currentLevel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">다음 레벨</span>
              <span className="font-semibold text-slate-900">{data.nextLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Streak info */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 mb-4">연속 학습 현황</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md bg-amber-50 p-4">
            <p className="text-xs text-amber-600 font-medium">🔥 현재 스트릭</p>
            <p className="mt-2 text-3xl font-bold text-amber-700">{data.currentStreak}</p>
            <p className="mt-1 text-xs text-amber-600">연속 학습 일수</p>
          </div>
          <div className="rounded-md bg-orange-50 p-4">
            <p className="text-xs text-orange-600 font-medium">⭐ 최장 스트릭</p>
            <p className="mt-2 text-3xl font-bold text-orange-700">{data.longestStreak}</p>
            <p className="mt-1 text-xs text-orange-600">역대 최고 기록</p>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      {recentEvents && recentEvents.events && recentEvents.events.length > 0 && (
        <RewardEventsList events={recentEvents.events} />
      )}
    </div>
  );
}
