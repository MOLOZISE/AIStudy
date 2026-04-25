'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StudyShell } from '@/components/study/StudyShell';
import { AdminGuard } from '@/components/study/admin/AdminGuard';
import { AdminNav } from '@/components/study/admin/AdminNav';
import { trpc } from '@/lib/trpc';

function AdminReportsPageContent() {
  const [status, setStatus] = useState<string | undefined>();
  const [targetType, setTargetType] = useState<string | undefined>();

  const reports = trpc.admin.listReportsForAdmin.useQuery({
    status: status as any,
    targetType,
    limit: 50,
  });

  const updateStatus = trpc.admin.updateReportStatus.useMutation({
    onSuccess: () => {
      reports.refetch();
    },
  });

  const data = reports.data?.items || [];

  return (
    <StudyShell title="신고 관리" description="사용자가 신고한 콘텐츠를 관리합니다.">
      <AdminNav />
      <div className="space-y-4 p-6">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={status ?? ''}
            onChange={(e) => setStatus(e.target.value || undefined)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">모든 상태</option>
            <option value="open">열림</option>
            <option value="reviewing">검토 중</option>
            <option value="resolved">해결됨</option>
            <option value="rejected">반려됨</option>
          </select>

          <select
            value={targetType ?? ''}
            onChange={(e) => setTargetType(e.target.value || undefined)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">모든 대상</option>
            <option value="question">문제</option>
            <option value="comment">댓글</option>
            <option value="publication">문제집</option>
            <option value="user">사용자</option>
          </select>

          <Link
            href="/study/admin"
            className="ml-auto rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            ← 돌아가기
          </Link>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          {reports.isLoading ? (
            <div className="p-6 text-center text-sm text-slate-500">신고 목록을 불러오는 중입니다...</div>
          ) : data.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">신고가 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">대상</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">사유</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">상태</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">신고일</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">조치</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {report.targetType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <p className="font-medium">{report.reason}</p>
                        {report.detail && (
                          <p className="text-xs text-slate-600 mt-1">{report.detail}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${
                            report.status === 'open'
                              ? 'bg-red-100 text-red-700'
                              : report.status === 'reviewing'
                                ? 'bg-amber-100 text-amber-700'
                                : report.status === 'resolved'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString('ko-KR')
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {report.status !== 'reviewing' && (
                            <button
                              onClick={() =>
                                updateStatus.mutate({
                                  reportId: report.id,
                                  status: 'reviewing',
                                })
                              }
                              disabled={updateStatus.isPending}
                              className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50"
                            >
                              검토
                            </button>
                          )}
                          {report.status !== 'resolved' && (
                            <button
                              onClick={() =>
                                updateStatus.mutate({
                                  reportId: report.id,
                                  status: 'resolved',
                                })
                              }
                              disabled={updateStatus.isPending}
                              className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
                            >
                              해결
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            <strong>ℹ️ 현황:</strong> 총 {reports.data?.total ?? 0}건의 신고가 있습니다.
          </p>
        </div>
      </div>
    </StudyShell>
  );
}

export default function AdminReportsPage() {
  return (
    <AdminGuard>
      <AdminReportsPageContent />
    </AdminGuard>
  );
}
