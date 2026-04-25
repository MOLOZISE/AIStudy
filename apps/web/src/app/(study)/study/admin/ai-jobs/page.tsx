'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StudyShell } from '@/components/study/StudyShell';
import { trpc } from '@/lib/trpc';

export default function AdminAiJobsPage() {
  const [status, setStatus] = useState<string | undefined>();

  const jobs = trpc.admin.listAiJobsForAdmin.useQuery({
    status: status as any,
    limit: 50,
  });

  const data = jobs.data?.items || [];

  return (
    <StudyShell title="AI 작업 모니터링" description="AI 생성 작업의 상태를 모니터링합니다.">
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <select
            value={status ?? ''}
            onChange={(e) => setStatus(e.target.value || undefined)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">모든 상태</option>
            <option value="pending">대기</option>
            <option value="extracting">추출 중</option>
            <option value="generating">생성 중</option>
            <option value="ready">완료</option>
            <option value="failed">실패</option>
          </select>

          <Link
            href="/study/admin"
            className="ml-auto rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            ← 돌아가기
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          {jobs.isLoading ? (
            <div className="p-6 text-center text-sm text-slate-500">작업 목록을 불러오는 중입니다...</div>
          ) : data.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">작업이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">파일명</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">사용자</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">상태</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">진행도</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">생성일</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">오류</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 text-xs">
                        {job.sourceFileName ? job.sourceFileName.substring(0, 30) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {job.userDisplayName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                            job.status === 'ready'
                              ? 'bg-emerald-100 text-emerald-700'
                              : job.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {job.progress ?? 0}%
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {job.createdAt
                          ? new Date(job.createdAt).toLocaleDateString('ko-KR')
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {job.status === 'failed' && job.errorPayload ? (
                          <details className="cursor-pointer">
                            <summary className="text-red-700 font-semibold">
                              오류 보기
                            </summary>
                            <pre className="mt-2 text-xs bg-red-50 p-2 rounded whitespace-pre-wrap break-words">
                              {JSON.stringify(job.errorPayload, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            <strong>ℹ️ 정보:</strong> 총 {jobs.data?.total ?? 0}건의 작업이 있습니다.
          </p>
        </div>
      </div>
    </StudyShell>
  );
}
