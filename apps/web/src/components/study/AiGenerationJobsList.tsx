'use client';

import { useEffect } from 'react';
import { trpc } from '@/lib/trpc';

interface AiGenerationJobsListProps {
  onJobSelect: (jobId: string) => void;
  selectedJobId: string | null;
}

function getStatusLabel(status: string | null): string {
  if (!status) return '알 수 없음';
  const labels: Record<string, string> = {
    pending: '대기 중',
    extracting: '텍스트 추출 중',
    generating: 'AI 생성 중',
    ready: '완료',
    failed: '실패',
    cancelled: '취소됨',
  };
  return labels[status] || status;
}

function getStatusColor(status: string | null): string {
  if (!status) return 'bg-slate-100 text-slate-700';
  const colors: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-700',
    extracting: 'bg-blue-100 text-blue-700',
    generating: 'bg-amber-100 text-amber-700',
    ready: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-700',
  };
  return colors[status] || 'bg-slate-100 text-slate-700';
}

export function AiGenerationJobsList({ onJobSelect, selectedJobId }: AiGenerationJobsListProps) {
  const { data, isLoading, refetch } = trpc.study.listMyAiGenerationJobs.useQuery({
    limit: 20,
    offset: 0,
  });

  // Auto-refresh while jobs are processing
  useEffect(() => {
    const activeJobs = data?.items.filter(j =>
      j.status === 'pending' || j.status === 'extracting' || j.status === 'generating'
    ) ?? [];

    if (activeJobs.length > 0) {
      const interval = setInterval(() => {
        refetch();
      }, 2000); // Refresh every 2 seconds

      return () => clearInterval(interval);
    }

    return undefined;
  }, [data?.items, refetch]);

  const jobs = data?.items ?? [];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">최근 생성 작업</h3>

      {isLoading ? (
        <div className="text-center text-sm text-slate-500 py-4">생성 목록을 불러오는 중입니다...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center text-sm text-slate-500 py-4">생성 작업이 없습니다.</div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => onJobSelect(job.id)}
              className={`w-full rounded-lg border p-4 text-left transition-all ${
                selectedJobId === job.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-slate-200 bg-white hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 truncate">
                    {job.sourceFileName || 'Untitled'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {job.createdAt
                      ? new Date(job.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </p>
                </div>
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${getStatusColor(job.status)}`}>
                  {getStatusLabel(job.status)}
                </span>
              </div>

              {/* Progress Bar */}
              {(job.status === 'pending' || job.status === 'extracting' || job.status === 'generating') && (
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              )}

              {/* File Size */}
              {job.sourceFileSize && (
                <p className="text-xs text-slate-600 mt-2">
                  📄 {(job.sourceFileSize / 1024 / 1024).toFixed(1)}MB
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
