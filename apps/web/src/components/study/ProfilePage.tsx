'use client';

import { useAuthStore } from '@/store/auth';
import { trpc } from '@/lib/trpc';

export function ProfilePage() {
  const { user } = useAuthStore();
  const { data: progress } = trpc.study.getMyProgress.useQuery();

  if (!user || !progress) {
    return <div className="text-center text-sm text-slate-500">프로필 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div className="space-y-6">
      {/* User info card */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 mb-4">기본 정보</p>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-500">이메일</p>
            <p className="text-sm font-medium text-slate-900">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">가입일</p>
            <p className="text-sm font-medium text-slate-900">
              {user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">마지막 로그인</p>
            <p className="text-sm font-medium text-slate-900">
              {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('ko-KR') : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Learning stats */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 mb-4">학습 통계</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-xs text-blue-600 font-medium">현재 레벨</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">{progress.currentLevel}</p>
          </div>
          <div className="rounded-md bg-purple-50 p-4">
            <p className="text-xs text-purple-600 font-medium">누적 XP</p>
            <p className="mt-2 text-3xl font-bold text-purple-700">{progress.totalXp}</p>
          </div>
          <div className="rounded-md bg-emerald-50 p-4">
            <p className="text-xs text-emerald-600 font-medium">누적 포인트</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">{progress.totalPoints}</p>
          </div>
          <div className="rounded-md bg-amber-50 p-4">
            <p className="text-xs text-amber-600 font-medium">최장 스트릭</p>
            <p className="mt-2 text-3xl font-bold text-amber-700">{progress.longestStreak}일</p>
          </div>
        </div>
      </div>

      {/* Streak info */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 mb-4">연속 학습</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">현재 스트릭</p>
            <p className="mt-2 text-4xl font-bold text-amber-600">🔥 {progress.currentStreak}</p>
            <p className="mt-1 text-xs text-slate-500">연속 학습 일수</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">진행도</p>
            <p className="mt-2 text-4xl font-bold text-blue-600">{progress.progress}%</p>
            <p className="mt-1 text-xs text-slate-500">다음 레벨까지</p>
          </div>
        </div>
      </div>

      {/* Level progress */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 mb-4">레벨 진행도</p>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                Level {progress.currentLevel} → {progress.nextLevel}
              </span>
              <span className="text-xs font-semibold text-slate-600">{progress.progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
                style={{ width: `${Math.min(progress.progress, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{progress.currentXp} / {progress.nextLevelXp} XP</span>
            <span>{progress.nextLevelXp - progress.currentXp} XP 남음</span>
          </div>
        </div>
      </div>
    </div>
  );
}
