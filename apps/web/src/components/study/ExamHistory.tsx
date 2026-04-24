'use client';

import { trpc } from '@/lib/trpc';

export function ExamHistory({ setId }: { setId: string }) {
  const { data, isLoading } = trpc.study.listExamHistory.useQuery({ setId, limit: 10 });

  if (isLoading || !data?.history.length) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-700">응시 기록</p>
      <div className="mt-3 space-y-2">
        {data.history.map((h) => (
          <div key={h.date} className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">{h.date}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600">{h.correct}/{h.total}문항</span>
              <span className={`text-xs font-semibold ${h.accuracy >= 70 ? 'text-emerald-600' : h.accuracy >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                {h.accuracy}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
