'use client';

import Link from 'next/link';
import { StudyShell } from '@/components/study/StudyShell';
import { trpc } from '@/lib/trpc';

export default function AdminQuestsPage() {
  const quests = trpc.admin.listQuestsForAdmin.useQuery();
  const updateActive = trpc.admin.updateQuestActive.useMutation({
    onSuccess: () => quests.refetch(),
  });

  const data = quests.data || [];

  return (
    <StudyShell title="퀘스트 관리" description="일일/주간/월간 퀘스트를 관리합니다.">
      <div className="space-y-4">
        <Link
          href="/study/admin"
          className="inline-block rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          ← 돌아가기
        </Link>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          {quests.isLoading ? (
            <div className="p-6 text-center text-sm text-slate-500">퀘스트 목록을 불러오는 중입니다...</div>
          ) : data.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">활성 퀘스트가 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">제목</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">유형</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">목표</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">보상</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">상태</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">조치</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.map((quest) => (
                    <tr key={quest.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{quest.title}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                          quest.type === 'daily'
                            ? 'bg-blue-100 text-blue-700'
                            : quest.type === 'weekly'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-purple-100 text-purple-700'
                        }`}>
                          {quest.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {quest.metric} / {quest.targetValue}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p className="text-slate-900">{quest.rewardXp} XP</p>
                        <p className="text-slate-600">{quest.rewardPoints} pts</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                          quest.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {quest.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            updateActive.mutate({
                              questId: quest.id,
                              isActive: !quest.isActive,
                            })
                          }
                          disabled={updateActive.isPending}
                          className={`text-xs px-2 py-1 rounded ${
                            quest.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          } disabled:opacity-50`}
                        >
                          {quest.isActive ? '비활성화' : '활성화'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </StudyShell>
  );
}
