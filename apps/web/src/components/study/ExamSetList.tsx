'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';

export function ExamSetList({ workbookId }: { workbookId?: string }) {
  const { data, isLoading, error } = trpc.study.listExamSets.useQuery({ workbookId, limit: 50 });

  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">모의고사 세트를 불러오는 중입니다.</div>;
  }

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  }

  if (!data?.items.length) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">아직 구성된 모의고사 세트가 없습니다.</div>;
  }

  return (
    <div className="space-y-3">
      {data.items.map((set) => (
        <Link key={set.id} href={`/study/exams/${set.id}`} className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="line-clamp-2 text-base font-semibold leading-6 text-slate-950">{set.title}</p>
              <p className="mt-1 text-xs text-slate-500">{set.subjectName ?? set.workbookName}</p>
            </div>
            <span className="shrink-0 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{set.totalQuestions ?? 0}문항</span>
          </div>
          {set.description ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{set.description}</p> : null}
        </Link>
      ))}
    </div>
  );
}
