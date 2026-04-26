'use client';

import { trpc } from '@/lib/trpc';
import { GrowthCard } from './GrowthCard';
import { RewardEventsList } from './RewardEventsList';

export function GrowthDashboard() {
  const { data } = trpc.study.getMyProgress.useQuery();
  const { data: recentEvents } = trpc.study.listRecentRewardEvents.useQuery({ limit: 20 });
  const { data: myBadges } = trpc.study.getMyBadges.useQuery();
  const { data: allBadges } = trpc.study.getBadgeCollection.useQuery();

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

      {/* Badges section */}
      {myBadges && allBadges && (
        <div className="space-y-4">
          {/* Recent badges */}
          {myBadges.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 mb-4">최근 획득 뱃지</p>
              <div className="grid gap-3 grid-cols-4 sm:grid-cols-6">
                {myBadges.slice(0, 6).map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 border border-amber-200 p-3 hover:shadow-md transition-shadow"
                    title={badge.title}
                  >
                    <div className="text-2xl mb-1">{badge.icon || '🎖️'}</div>
                    <p className="text-xs text-center font-medium text-slate-700 line-clamp-1 leading-tight">
                      {badge.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended badges */}
          {allBadges.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 mb-4">다음으로 노릴 뱃지</p>
              <div className="grid gap-3 grid-cols-3 sm:grid-cols-4">
                {allBadges
                  .filter((b) => !b.earned)
                  .slice(0, 4)
                  .map((badge) => (
                    <div key={badge.id} className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                      <div className="text-2xl mb-1 text-center opacity-60">{badge.icon || '🎖️'}</div>
                      <p className="text-xs text-center font-medium text-slate-700 line-clamp-1 leading-tight">
                        {badge.title}
                      </p>
                      <p className="text-xs text-slate-500 text-center mt-1">
                        {badge.conditionValue} {badge.conditionType}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
