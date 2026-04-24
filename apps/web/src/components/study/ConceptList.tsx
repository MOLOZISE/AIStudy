'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';

interface ConceptItemProps {
  concept: {
    id: string;
    externalId: string;
    parentId: string | null;
    title: string;
    description: string | null;
    orderIndex: number | null;
    questionCount: number;
  };
  workbookId: string;
  depth: number;
}

function ConceptItem({ concept, depth }: ConceptItemProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = trpc.study.getConceptQuestions.useQuery(
    { conceptId: concept.id },
    { enabled: open },
  );

  return (
    <div className={depth > 0 ? 'ml-4 border-l border-slate-200 pl-3' : ''}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{concept.title}</p>
          {concept.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{concept.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {concept.questionCount > 0 && (
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
              {concept.questionCount}문항
            </span>
          )}
          {concept.questionCount > 0 && (
            <span className="text-xs text-slate-400">{open ? '▲' : '▼'}</span>
          )}
        </div>
      </button>

      {open && (
        <div className="ml-3 mb-2 space-y-1">
          {isLoading && <p className="px-3 py-2 text-xs text-slate-400">불러오는 중...</p>}
          {data?.questions.map((q, i) => (
            <Link
              key={q.id}
              href={`/study/questions/${q.id}`}
              className="flex items-start gap-2 rounded-md px-3 py-2 text-xs hover:bg-blue-50"
            >
              <span className="shrink-0 font-semibold text-slate-400">{i + 1}.</span>
              <span className="line-clamp-2 text-slate-700">{q.prompt}</span>
              {q.difficulty && (
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${
                  q.difficulty === '상' ? 'bg-red-50 text-red-600' :
                  q.difficulty === '중' ? 'bg-amber-50 text-amber-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>{q.difficulty}</span>
              )}
            </Link>
          ))}
          {data?.questions.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-400">연결된 문항이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function ConceptList({ workbookId }: { workbookId: string }) {
  const { data, isLoading, error } = trpc.study.listConcepts.useQuery({ workbookId });

  if (isLoading) return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">개념을 불러오는 중입니다.</div>;
  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  if (!data?.concepts.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        이 문제집에 개념 데이터가 없습니다. (01_개념마스터 시트를 확인하세요)
      </div>
    );
  }

  // 최상위(parentId=null)만 추려서 트리로 구성
  const roots = data.concepts.filter((c) => !c.parentId);
  const children = (parentId: string) => data.concepts.filter((c) => c.parentId === parentId);

  return (
    <div className="space-y-1">
      <p className="mb-3 text-xs text-slate-500">개념을 클릭하면 관련 문항을 볼 수 있어요.</p>
      {roots.map((root) => (
        <div key={root.id} className="rounded-lg border border-slate-200 bg-white">
          <ConceptItem concept={root} workbookId={workbookId} depth={0} />
          {children(root.id).map((child) => (
            <ConceptItem key={child.id} concept={child} workbookId={workbookId} depth={1} />
          ))}
        </div>
      ))}
    </div>
  );
}
