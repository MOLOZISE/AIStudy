'use client';

import { trpc } from '@/lib/trpc';

export function WrongNoteStats() {
  const { data } = trpc.study.getWrongNoteStats.useQuery();

  if (!data) return null;

  return (
    <div className="grid grid-cols-4 gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="rounded-md bg-red-50 p-3 text-center">
        <p className="text-xs text-red-600">미해결</p>
        <p className="mt-1 text-lg font-bold text-red-700">{data.openCount}</p>
      </div>
      <div className="rounded-md bg-amber-50 p-3 text-center">
        <p className="text-xs text-amber-600">복습중</p>
        <p className="mt-1 text-lg font-bold text-amber-700">{data.reviewingCount}</p>
      </div>
      <div className="rounded-md bg-emerald-50 p-3 text-center">
        <p className="text-xs text-emerald-600">정복</p>
        <p className="mt-1 text-lg font-bold text-emerald-700">{data.masteredCount}</p>
      </div>
      <div className="rounded-md bg-blue-50 p-3 text-center">
        <p className="text-xs text-blue-600">최근 7일</p>
        <p className="mt-1 text-lg font-bold text-blue-700">{data.recentCount}</p>
      </div>
    </div>
  );
}
