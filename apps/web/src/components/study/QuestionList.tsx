'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';

export function QuestionList({ workbookId }: { workbookId: string }) {
  const { data, isLoading, error } = trpc.study.listQuestions.useQuery({ workbookId, limit: 100, offset: 0 });

  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">문항을 불러오는 중입니다.</div>;
  }

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  }

  if (!data?.items.length) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">활성 문항이 없습니다.</div>;
  }

  return (
    <div className="space-y-3">
      {data.items.map((question, index) => (
        <Link key={question.id} href={`/study/questions/${question.id}`} className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-sm font-bold text-blue-700">
              {question.questionNo ?? index + 1}
            </span>
            <div className="min-w-0">
              <p className="line-clamp-3 text-sm font-semibold leading-6 text-slate-950">{question.prompt}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>{question.type}</span>
                {question.difficulty ? <span>{question.difficulty}</span> : null}
                <span>{question.choices?.length ?? 0}개 선택지</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
