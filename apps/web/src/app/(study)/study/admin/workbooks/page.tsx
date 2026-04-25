'use client';

import Link from 'next/link';
import { StudyShell } from '@/components/study/StudyShell';
import { AdminGuard } from '@/components/study/admin/AdminGuard';
import { AdminNav } from '@/components/study/admin/AdminNav';
import { trpc } from '@/lib/trpc';

function AdminWorkbooksPageContent() {
  const publications = trpc.study.listPublicWorkbooks.useQuery({
    limit: 100,
  });

  const hidePublication = trpc.admin.hidePublication.useMutation({
    onSuccess: () => publications.refetch(),
  });

  const data = publications.data?.items || [];

  return (
    <StudyShell title="문제집 관리" description="공개 문제집의 품질과 상태를 관리합니다.">
      <AdminNav />
      <div className="space-y-4 p-6">
        <Link
          href="/study/admin"
          className="inline-block rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          ← 돌아가기
        </Link>

        {/* Table */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          {publications.isLoading ? (
            <div className="p-6 text-center text-sm text-slate-500">문제집 목록을 불러오는 중입니다...</div>
          ) : data.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">문제집이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">제목</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">작성자</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">공개도</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">상태</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">생성일</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">조치</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.map((pub: any) => (
                    <tr key={pub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">{pub.title}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{pub.creatorDisplayName || '익명'}</td>
                      <td className="px-4 py-3 text-xs">
                        <span
                          className={`inline-block rounded px-2 py-1 font-semibold ${
                            pub.visibility === 'public'
                              ? 'bg-green-100 text-green-700'
                              : pub.visibility === 'unlisted'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {pub.visibility}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span
                          className={`inline-block rounded px-2 py-1 font-semibold ${
                            pub.status === 'published'
                              ? 'bg-emerald-100 text-emerald-700'
                              : pub.status === 'hidden'
                                ? 'bg-red-100 text-red-700'
                                : pub.status === 'reported'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {pub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {new Date(pub.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {pub.status === 'published' ? (
                          <button
                            onClick={() =>
                              hidePublication.mutate({ publicationId: pub.id })
                            }
                            disabled={hidePublication.isPending}
                            className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                          >
                            숨김
                          </button>
                        ) : pub.status === 'hidden' ? (
                          <span className="text-slate-500 text-xs">숨겨짐</span>
                        ) : (
                          <span className="text-slate-500 text-xs">{pub.status}</span>
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
            <strong>ℹ️ 정보:</strong> 총 {data.length}개의 공개 문제집이 있습니다.
          </p>
        </div>
      </div>
    </StudyShell>
  );
}

export default function AdminWorkbooksPage() {
  return (
    <AdminGuard>
      <AdminWorkbooksPageContent />
    </AdminGuard>
  );
}
