'use client';

import Link from 'next/link';
import { ExamSetList } from '@/components/study/ExamSetList';
import { trpc } from '@/lib/trpc';

export function WorkbookDetail({ workbookId }: { workbookId: string }) {
  const workbook = trpc.study.getWorkbook.useQuery({ workbookId });
  const importJobs = trpc.study.listImportJobs.useQuery({ workbookId, limit: 5 });
  const questions = trpc.study.listQuestions.useQuery({ workbookId, limit: 1, offset: 0 });

  if (workbook.isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">문제집 정보를 불러오는 중입니다.</div>;
  }

  if (workbook.error || !workbook.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {workbook.error?.message ?? '문제집을 찾을 수 없습니다.'}
      </div>
    );
  }

  const latestJob = importJobs.data?.items[0];
  const summary = workbook.data.metadata?.summary as
    | { concepts?: number; seeds?: number; questions?: number; examSets?: number; examSetItems?: number }
    | undefined;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-slate-950">{workbook.data.originalFilename}</p>
            <p className="mt-2 break-all text-xs text-slate-500">{workbook.data.storagePath}</p>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{workbook.data.status}</span>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
          <p className="text-xs text-slate-500">문항</p>
          <p className="mt-2 text-xl font-bold">{summary?.questions ?? (questions.data?.items.length ? '1+' : 0)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
          <p className="text-xs text-slate-500">개념</p>
          <p className="mt-2 text-xl font-bold">{summary?.concepts ?? 0}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
          <p className="text-xs text-slate-500">세트</p>
          <p className="mt-2 text-xl font-bold">{summary?.examSets ?? 0}</p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/study/workbooks/${workbookId}/questions`}
          className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white"
        >
          문제 풀기
        </Link>
        <Link
          href="/study/exams"
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700"
        >
          세트 보기
        </Link>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">이 문제집의 모의고사</h2>
        <div className="mt-3">
          <ExamSetList workbookId={workbookId} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">최근 import</h2>
        {latestJob ? (
          <div className="mt-3 text-sm leading-6 text-slate-600">
            <p>상태: {latestJob.status}</p>
            <p>성공 row: {latestJob.importedRows ?? 0}</p>
            <p>실패 row: {latestJob.failedRows ?? 0}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">아직 import 기록이 없습니다.</p>
        )}
      </section>
    </div>
  );
}
