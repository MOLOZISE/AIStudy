'use client';

import { trpc } from '@/lib/trpc';

export function StudyStatsCards() {
  const { data, isLoading, error } = trpc.study.getStats.useQuery();

  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">통계를 불러오는 중입니다.</div>;
  }

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  }

  const stats = [
    { label: '풀이 수', value: String(data?.totalAttempts ?? 0) },
    { label: '정답률', value: `${data?.accuracy ?? 0}%` },
    { label: '오답', value: String(data?.openWrongNotes ?? 0) },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((item) => (
        <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm">
          <p className="text-xs font-medium text-slate-500">{item.label}</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
