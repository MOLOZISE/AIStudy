'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';

export function WorkbookList() {
  const { data, isLoading, error } = trpc.study.listWorkbooks.useQuery({ limit: 20 });

  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">문제집을 불러오는 중입니다.</div>;
  }

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  }

  if (!data?.items.length) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">아직 업로드된 문제집이 없습니다.</div>;
  }

  return (
    <div className="space-y-3">
      {data.items.map((workbook) => (
        <Link key={workbook.id} href={`/study/workbooks/${workbook.id}`} className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-950">{workbook.originalFilename}</p>
              <p className="mt-1 text-xs text-slate-500">{workbook.subjectName ?? '과목 미지정'}</p>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{workbook.status}</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">{workbook.uploadedAt ? new Date(workbook.uploadedAt).toLocaleString('ko-KR') : ''}</p>
        </Link>
      ))}
    </div>
  );
}
