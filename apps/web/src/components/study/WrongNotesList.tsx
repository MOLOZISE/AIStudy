'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';

type StatusFilter = 'all' | 'open' | 'reviewing' | 'mastered' | 'ignored';

const STATUS_TABS = [
  { value: 'all' as const, label: '전체' },
  { value: 'open' as const, label: '미해결' },
  { value: 'reviewing' as const, label: '복습중' },
  { value: 'mastered' as const, label: '정복' },
  { value: 'ignored' as const, label: '무시' },
];

function getTypeLabel(type: string): string {
  switch (type) {
    case 'multiple_choice_single':
      return '객관식';
    case 'true_false':
      return 'OX';
    case 'short_answer':
      return '단답형';
    case 'essay_self_review':
      return '주관식';
    default:
      return type;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'open':
      return 'bg-red-50 text-red-700';
    case 'reviewing':
      return 'bg-amber-50 text-amber-700';
    case 'mastered':
    case 'resolved':
      return 'bg-emerald-50 text-emerald-700';
    case 'ignored':
      return 'bg-slate-100 text-slate-600';
    default:
      return 'bg-slate-50 text-slate-600';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'open':
      return '미해결';
    case 'reviewing':
      return '복습중';
    case 'mastered':
    case 'resolved':
      return '정복';
    case 'ignored':
      return '무시';
    default:
      return status;
  }
}

export function WrongNotesList() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { data, isLoading, error, refetch } = trpc.study.listWrongNotes.useQuery(
    { limit: 100, status: statusFilter }
  );
  const updateStatus = trpc.study.updateWrongNoteStatus.useMutation({
    onSuccess: () => refetch(),
  });

  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">오답노트를 불러오는 중입니다.</div>;
  }

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  }

  const items = data?.items || [];
  const resolvableItems = items.filter((item) => item.status === 'open' || item.status === 'reviewing');

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="grid grid-cols-5 gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
              statusFilter === tab.value
                ? 'bg-blue-600 text-white'
                : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Re-solve Button */}
      {resolvableItems.length > 0 && (
        <Link
          href="/study/wrong-notes/session"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
        >
          {resolvableItems.length}개 문제 다시 풀기
        </Link>
      )}

      {/* Wrong Notes List */}
      {items.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-sm text-slate-500">
          {statusFilter === 'all' ? '아직 오답노트가 없습니다.' : '필터에 해당하는 오답노트가 없습니다.'}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((note) => (
            <div key={note.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {/* Type Badge */}
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {getTypeLabel(note.questionType)}
                    </span>
                    {/* Status Badge */}
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${getStatusColor(note.status)}`}>
                      {getStatusLabel(note.status)}
                    </span>
                    {/* Wrong Count Badge */}
                    <span className="shrink-0 rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                      {note.wrongCount}회 틀림
                    </span>
                  </div>
                  <Link
                    href={`/study/questions/${note.questionId}`}
                    className="mt-2 block line-clamp-3 text-sm font-semibold leading-6 text-slate-950 hover:text-blue-600"
                  >
                    {note.prompt}
                  </Link>
                </div>

                {/* Action Buttons */}
                <div className="flex shrink-0 flex-col gap-1.5">
                  {note.status !== 'mastered' && note.status !== 'resolved' && note.status !== 'ignored' && (
                    <button
                      onClick={() => updateStatus.mutate({ noteId: note.id, status: 'mastered' })}
                      disabled={updateStatus.isLoading}
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 disabled:opacity-50 hover:bg-emerald-100"
                    >
                      정복
                    </button>
                  )}
                  {note.status !== 'ignored' && (
                    <button
                      onClick={() => updateStatus.mutate({ noteId: note.id, status: 'ignored' })}
                      disabled={updateStatus.isLoading}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                    >
                      무시
                    </button>
                  )}
                  {note.status === 'mastered' && (
                    <button
                      onClick={() => updateStatus.mutate({ noteId: note.id, status: 'open' })}
                      disabled={updateStatus.isLoading}
                      className="rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 disabled:opacity-50 hover:bg-blue-100"
                    >
                      다시열기
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
