'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { trpc } from '@/lib/trpc';

export default function AdminReportsPage() {
  const { data, isLoading, error } = trpc.study.listReportsForAdmin.useQuery({});

  if (error) {
    return (
      <StudyShell title="신고 관리" description="사용자가 신고한 콘텐츠 목록입니다.">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      </StudyShell>
    );
  }

  const reports = data?.items || [];

  return (
    <StudyShell title="신고 관리" description="사용자가 신고한 콘텐츠 목록입니다.">
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-slate-500">신고 목록을 불러오는 중입니다...</div>
        ) : reports.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">신고가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">신고 대상</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">대상 ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">사유</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">신고자</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">신고 일시</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {report.targetType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {report.targetId.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {report.reason}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {report.reporterDisplayName || '익명 사용자'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {report.createdAt
                        ? new Date(report.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                        {report.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Note */}
      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-900">
          <strong>📝 참고:</strong> 현재 신고 목록만 표시합니다. 신고 내용 검토 및 조치는 후속 개선사항으로 예정되어 있습니다.
        </p>
      </div>
    </StudyShell>
  );
}
