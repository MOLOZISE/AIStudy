'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExamSetList } from '@/components/study/ExamSetList';
import { WorkbookPublishSection } from '@/components/study/WorkbookPublishSection';
import { trpc } from '@/lib/trpc';

export function WorkbookDetail({ workbookId }: { workbookId: string }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const workbook = trpc.study.getWorkbook.useQuery({ workbookId });
  const importJobs = trpc.study.listImportJobs.useQuery({ workbookId, limit: 5 });
  const concepts = trpc.study.listConcepts.useQuery({ workbookId });
  const forkInfo = trpc.study.getWorkbookForkInfo.useQuery({ workbookId });
  const deleteWorkbook = trpc.study.deleteWorkbook.useMutation({
    onSuccess: () => router.push('/study/library'),
  });

  if (workbook.isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">문제집 정보를 불러오는 중입니다.</div>;
  }

  if (workbook.error || !workbook.data) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{workbook.error?.message ?? '문제집을 찾을 수 없습니다.'}</div>;
  }

  const latestJob = importJobs.data?.items[0];
  const summary = workbook.data.metadata?.summary as
    | { concepts?: number; seeds?: number; questions?: number; examSets?: number; examSetItems?: number }
    | undefined;
  const hasConceptData = (concepts.data?.concepts.length ?? 0) > 0;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-slate-950">{workbook.data.originalFilename}</p>
            {workbook.data.subjectName && (
              <p className="mt-1 text-xs font-medium text-blue-600">{workbook.data.subjectName}</p>
            )}
          </div>
          <span className={`rounded-md px-2 py-1 text-xs font-semibold ${workbook.data.status === 'imported' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
            {workbook.data.status}
          </span>
        </div>
      </section>

      {forkInfo.data && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs text-amber-700 mb-1">출처</p>
          <Link href={`/study/discover/${forkInfo.data.sourcePublicationId}`} className="text-sm font-semibold text-amber-900 hover:text-amber-700">
            {forkInfo.data.sourceTitle}
          </Link>
          {(forkInfo.data.sourceCategory || forkInfo.data.sourceDifficulty) && (
            <div className="mt-2 flex gap-2 text-xs">
              {forkInfo.data.sourceCategory && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                  {forkInfo.data.sourceCategory}
                </span>
              )}
              {forkInfo.data.sourceDifficulty && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                  {forkInfo.data.sourceDifficulty}
                </span>
              )}
            </div>
          )}
        </section>
      )}

      <section className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
          <p className="text-xs text-slate-500">문항</p>
          <p className="mt-2 text-xl font-bold">{summary?.questions ?? 0}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
          <p className="text-xs text-slate-500">개념</p>
          <p className="mt-2 text-xl font-bold">{summary?.concepts ?? 0}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
          <p className="text-xs text-slate-500">세트</p>
          <p className="mt-2 text-xl font-bold">{(summary?.examSets ?? 0)}</p>
        </div>
      </section>

      {/* 주요 액션 */}
      <div className="grid grid-cols-2 gap-2">
        <Link href={`/study/workbooks/${workbookId}/questions`}
          className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700">
          전체 문제 보기
        </Link>
        <Link href={`/study/practice?workbookId=${workbookId}`}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
          랜덤 연습
        </Link>
      </div>

      {/* 편집 액션 */}
      <div>
        <Link href={`/study/workbooks/${workbookId}/editor`}
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-700 hover:bg-amber-100">
          문제 편집
        </Link>
      </div>

      {hasConceptData && (
        <Link href={`/study/workbooks/${workbookId}/concepts`}
          className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 hover:bg-blue-100">
          <div>
            <p className="text-sm font-semibold text-blue-900">개념 탐색</p>
            <p className="text-xs text-blue-600">{summary?.concepts ?? 0}개 개념 · 클릭하면 관련 문항 확인 가능</p>
          </div>
          <span className="text-blue-500">→</span>
        </Link>
      )}

      {/* 모의고사 세트 */}
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">이 문제집의 모의고사</h2>
        <div className="mt-3">
          <ExamSetList workbookId={workbookId} />
        </div>
      </section>

      {/* import 기록 */}
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">최근 import</h2>
        {latestJob ? (
          <div className="mt-3 space-y-1 text-sm leading-6 text-slate-600">
            <div className="flex justify-between">
              <span>상태</span>
              <span className={`font-medium ${latestJob.status === 'completed' ? 'text-emerald-600' : latestJob.status === 'failed' ? 'text-red-600' : 'text-slate-700'}`}>{latestJob.status}</span>
            </div>
            <div className="flex justify-between"><span>성공 row</span><span>{latestJob.importedRows ?? 0}</span></div>
            <div className="flex justify-between"><span>실패 row</span><span className={latestJob.failedRows ? 'text-red-600 font-medium' : ''}>{latestJob.failedRows ?? 0}</span></div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">아직 import 기록이 없습니다.</p>
        )}
      </section>

      {/* 공개 설정 */}
      <WorkbookPublishSection workbookId={workbookId} />

      {/* 삭제 */}
      <section className="rounded-lg border border-red-100 bg-white p-4">
        <h2 className="text-sm font-semibold text-red-700">위험 구역</h2>
        {!confirmDelete ? (
          <button type="button" onClick={() => setConfirmDelete(true)}
            className="mt-3 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            문제집 삭제
          </button>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-red-700">삭제하면 모든 문항, 오답노트, 응시 기록이 함께 삭제됩니다. 정말 삭제하시겠어요?</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => deleteWorkbook.mutate({ workbookId })}
                disabled={deleteWorkbook.isLoading}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300 hover:bg-red-700">
                {deleteWorkbook.isLoading ? '삭제 중...' : '확인, 삭제'}
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                취소
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
