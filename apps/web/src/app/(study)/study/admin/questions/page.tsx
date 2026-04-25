'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StudyShell } from '@/components/study/StudyShell';
import { trpc } from '@/lib/trpc';

export default function AdminQuestionsPage() {
  const [reviewStatus, setReviewStatus] = useState<string | undefined>();

  const questions = trpc.admin.listQuestionsForQc.useQuery({
    reviewStatus: reviewStatus as any,
    limit: 50,
  });

  const data = questions.data?.items || [];

  return (
    <StudyShell title="문제 QC 관리" description="문제 검수 상태를 관리합니다.">
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <select
            value={reviewStatus ?? ''}
            onChange={(e) => setReviewStatus(e.target.value || undefined)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">모든 상태</option>
            <option value="draft">검수 중</option>
            <option value="needs_fix">수정 필요</option>
            <option value="approved">승인됨</option>
            <option value="rejected">반려됨</option>
          </select>

          <Link
            href="/study/admin"
            className="ml-auto rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            ← 돌아가기
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          {questions.isLoading ? (
            <div className="p-6 text-center text-sm text-slate-500">문제 목록을 불러오는 중입니다...</div>
          ) : data.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">문제가 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">문제</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">상태</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">출처</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">생성일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 text-xs line-clamp-2">
                          {q.prompt?.substring(0, 60)}...
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                            q.reviewStatus === 'approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : q.reviewStatus === 'needs_fix'
                                ? 'bg-amber-100 text-amber-700'
                                : q.reviewStatus === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {q.reviewStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {q.createdAt
                          ? new Date(q.createdAt).toLocaleDateString('ko-KR')
                          : '-'}
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
            <strong>ℹ️ 정보:</strong> 총 {questions.data?.total ?? 0}건의 문제가 있습니다.
          </p>
        </div>
      </div>
    </StudyShell>
  );
}
