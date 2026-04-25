'use client';

import { trpc } from '@/lib/trpc';

export function AdminOverview() {
  const overview = trpc.admin.getAdminOverview.useQuery();

  if (overview.isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (overview.error || !overview.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {overview.error?.message ?? '대시보드 데이터를 불러올 수 없습니다.'}
      </div>
    );
  }

  const data = overview.data;

  const statCards = [
    {
      label: '열린 신고',
      value: data.reportsOpenCount,
      color: 'red',
      icon: '🔴',
    },
    {
      label: '검토 중',
      value: data.reportsReviewingCount,
      color: 'amber',
      icon: '🟡',
    },
    {
      label: '공개 문제집',
      value: data.publishedWorkbookCount,
      color: 'blue',
      icon: '📚',
    },
    {
      label: '신고된 문제집',
      value: data.reportedWorkbookCount,
      color: 'red',
      icon: '⚠️',
    },
    {
      label: '활성 퀘스트',
      value: data.activeQuestCount,
      color: 'emerald',
      icon: '🎯',
    },
    {
      label: 'AI 작업 실패',
      value: data.aiJobsFailedCount,
      color: 'red',
      icon: '❌',
    },
    {
      label: '검수 필요 문제',
      value: data.questionsNeedsReviewCount,
      color: 'amber',
      icon: '✏️',
    },
    {
      label: '신고된 댓글',
      value: data.commentsReportedCount,
      color: 'red',
      icon: '💬',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-lg border p-4 ${
            stat.color === 'red'
              ? 'border-red-200 bg-red-50'
              : stat.color === 'amber'
                ? 'border-amber-200 bg-amber-50'
                : stat.color === 'blue'
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-emerald-200 bg-emerald-50'
          }`}
        >
          <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          <p className={`mt-1 text-xs font-medium ${
            stat.color === 'red'
              ? 'text-red-700'
              : stat.color === 'amber'
                ? 'text-amber-700'
                : stat.color === 'blue'
                  ? 'text-blue-700'
                  : 'text-emerald-700'
          }`}>
            {stat.icon} {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
