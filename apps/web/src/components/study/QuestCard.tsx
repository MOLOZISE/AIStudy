'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

interface QuestCardProps {
  id: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  rewardXp: number;
  rewardPoints: number;
  isCompleted: boolean;
  isClaimed: boolean;
  endsAt: Date;
  onClaimSuccess?: () => void;
}

export function QuestCard({
  id,
  title,
  description,
  targetValue,
  currentValue,
  rewardXp,
  rewardPoints,
  isCompleted,
  isClaimed,
  endsAt,
  onClaimSuccess,
}: QuestCardProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const claimReward = trpc.study.claimQuestReward.useMutation({
    onSuccess: () => {
      setIsClaiming(false);
      onClaimSuccess?.();
    },
    onError: () => {
      setIsClaiming(false);
    },
  });

  const progress = Math.min(100, Math.round((currentValue / targetValue) * 100));
  const hoursLeft = Math.max(0, Math.round((endsAt.getTime() - Date.now()) / (1000 * 60 * 60)));

  const handleClaim = () => {
    setIsClaiming(true);
    claimReward.mutate({ questId: id });
  };

  return (
    <div className={`rounded-lg border p-4 ${isClaimed ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white shadow-sm'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{title}</h3>
            {isClaimed && <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">완료</span>}
            {isCompleted && !isClaimed && (
              <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">달성</span>
            )}
          </div>
          {description && <p className="mt-1 text-xs text-slate-600">{description}</p>}

          {/* Progress bar */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">
                {currentValue} / {targetValue}
              </span>
              <span className="text-xs text-slate-500">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Reward info */}
          <div className="mt-2 flex gap-2">
            <span className="text-xs font-semibold text-blue-600">+{rewardXp} XP</span>
            <span className="text-xs font-semibold text-amber-600">+{rewardPoints} 포인트</span>
          </div>

          {/* Time left */}
          <p className="mt-2 text-xs text-slate-500">
            {hoursLeft > 0 ? `${hoursLeft}시간 남음` : '곧 종료'}
          </p>
        </div>

        {/* Claim button */}
        {isCompleted && !isClaimed && (
          <button
            onClick={handleClaim}
            disabled={isClaiming}
            className="shrink-0 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:bg-slate-300 hover:bg-blue-700"
          >
            {isClaiming ? '수령 중...' : '보상 수령'}
          </button>
        )}
        {isClaimed && (
          <div className="shrink-0 rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            ✓ 완료
          </div>
        )}
      </div>
    </div>
  );
}
