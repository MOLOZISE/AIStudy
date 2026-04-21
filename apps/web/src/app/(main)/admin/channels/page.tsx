'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { relativeTime } from '@/lib/time';
import { toast } from '@/store/toast';

const STATUS_LABELS = {
  pending: '검토 중',
  approved: '승인됨',
  rejected: '반려됨',
} as const;

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-100',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  rejected: 'bg-slate-100 text-slate-600 ring-slate-200',
} as const;

type RequestStatus = keyof typeof STATUS_LABELS;

export default function AdminChannelsPage() {
  const [filter, setFilter] = useState<RequestStatus | undefined>('pending');
  const utils = trpc.useContext();

  const { data: requests, isLoading, error } = trpc.channels.getRequests.useQuery({ status: filter });
  const approve = trpc.channels.approveRequest.useMutation({
    onSuccess: () => {
      utils.channels.getRequests.invalidate();
      utils.channels.getList.invalidate();
      toast.success('채널 신청을 승인했습니다.');
    },
    onError: (err) => toast.error(err.message),
  });
  const reject = trpc.channels.rejectRequest.useMutation({
    onSuccess: () => {
      utils.channels.getRequests.invalidate();
      toast.success('채널 신청을 반려했습니다.');
    },
    onError: (err) => toast.error(err.message),
  });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-6 text-center">
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">관리자</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">채널 신청 관리</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              사용자가 신청한 게시판 채널을 검토하고 승인하면 즉시 채널이 생성됩니다.
            </p>
          </div>
          <div className="flex gap-1.5">
            {([undefined, 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={String(status)}
                onClick={() => setFilter(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === undefined ? '전체' : STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white py-10 text-center text-sm text-slate-400">
          신청 목록을 불러오는 중...
        </div>
      ) : requests?.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white py-10 text-center">
          <p className="font-semibold text-slate-900">표시할 신청이 없습니다</p>
          <p className="mt-1 text-sm text-slate-400">새 신청이 들어오면 이곳에서 검토할 수 있습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests?.map((request) => {
            const status = (request.status ?? 'pending') as RequestStatus;
            return (
              <article key={request.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${STATUS_COLORS[status]}`}>
                        {STATUS_LABELS[status]}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        /{request.slug}
                      </span>
                      {request.createdAt && (
                        <span className="text-xs text-slate-400">{relativeTime(request.createdAt)}</span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-slate-950">{request.name}</h2>
                    {request.description && (
                      <p className="mt-1 text-sm leading-6 text-slate-600">{request.description}</p>
                    )}
                    {request.reason && (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">신청 이유</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{request.reason}</p>
                      </div>
                    )}
                    <p className="mt-3 text-xs text-slate-400">
                      신청자: {request.requesterName ?? '알 수 없음'} · {request.requesterEmail ?? request.requestedBy}
                    </p>
                  </div>

                  {status === 'pending' && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => approve.mutate({ id: request.id })}
                        disabled={approve.isLoading || reject.isLoading}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => reject.mutate({ id: request.id })}
                        disabled={approve.isLoading || reject.isLoading}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                      >
                        반려
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
