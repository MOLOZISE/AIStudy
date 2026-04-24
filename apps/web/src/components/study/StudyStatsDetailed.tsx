'use client';

import { trpc } from '@/lib/trpc';

function AccuracyBar({ accuracy }: { accuracy: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${accuracy >= 70 ? 'bg-emerald-500' : accuracy >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
          style={{ width: `${accuracy}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-semibold text-slate-700">{accuracy}%</span>
    </div>
  );
}

export function StudyStatsDetailed() {
  const { data, isLoading, error } = trpc.study.getStatsDetailed.useQuery();

  if (isLoading) return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">통계를 불러오는 중입니다.</div>;
  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  if (!data) return null;

  const { workbookStats, dailyStats } = data;

  // 최근 7일 날짜 채우기 (데이터 없는 날은 0으로)
  const today = new Date();
  const last7: Array<{ date: string; label: string; total: number; correct: number; accuracy: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const found = dailyStats.find((s) => s.date === dateStr);
    last7.push({
      date: dateStr,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      total: found?.total ?? 0,
      correct: found?.correct ?? 0,
      accuracy: found?.accuracy ?? 0,
    });
  }

  const maxTotal = Math.max(...last7.map((d) => d.total), 1);

  return (
    <div className="space-y-5">
      {/* 최근 7일 풀이 현황 */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700">최근 7일 풀이 현황</p>
        <div className="mt-4 flex items-end gap-1.5">
          {last7.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs text-slate-500">{day.total > 0 ? day.accuracy + '%' : ''}</span>
              <div className="w-full overflow-hidden rounded-t" style={{ height: 60 }}>
                <div
                  className="w-full rounded-t bg-blue-500 transition-all"
                  style={{ height: `${(day.total / maxTotal) * 60}px`, minHeight: day.total > 0 ? 4 : 0 }}
                />
              </div>
              <span className="text-xs text-slate-500">{day.label}</span>
              <span className="text-xs font-semibold text-slate-700">{day.total > 0 ? day.total : '-'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 문제집별 정답률 */}
      {workbookStats.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">문제집별 정답률</p>
          <div className="mt-3 space-y-3">
            {workbookStats.map((w) => (
              <div key={w.workbookId}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-slate-600">{w.workbookName.replace(/\.[^.]+$/, '')}</p>
                  <span className="shrink-0 text-xs text-slate-500">{w.correct}/{w.total}</span>
                </div>
                <AccuracyBar accuracy={w.accuracy} />
              </div>
            ))}
          </div>
        </section>
      )}

      {workbookStats.length === 0 && dailyStats.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          아직 풀이 기록이 없습니다.
        </div>
      )}
    </div>
  );
}
