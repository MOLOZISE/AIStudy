'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';

export function WrongNotesList() {
  const { data, isLoading, error } = trpc.study.listWrongNotes.useQuery({ limit: 50 });

  if (isLoading) return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">오답노트를 불러오는 중입니다.</div>;
  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  if (!data?.items.length) return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">아직 오답노트가 없습니다.</div>;

  return (
    <div className="space-y-4">
      <Link
        href="/study/wrong-notes/session"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
      >
        틀린 문제 {data.items.length}개 다시 풀기
      </Link>

      <div className="space-y-3">
        {data.items.map((note) => (
          <Link key={note.id} href={`/study/questions/${note.questionId}`} className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300">
            <div className="flex items-start justify-between gap-3">
              <p className="line-clamp-3 text-sm font-semibold leading-6 text-slate-950">{note.prompt}</p>
              <span className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">{note.wrongCount}회</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{note.lastWrongAt ? new Date(note.lastWrongAt).toLocaleString('ko-KR') : ''}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
