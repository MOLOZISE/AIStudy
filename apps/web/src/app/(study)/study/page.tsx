'use client';

import Link from 'next/link';
import { StudyShell } from '@/components/study/StudyShell';
import { SectionCard } from '@/components/study/shared';
import { DashboardSummary } from '@/components/study/dashboard/DashboardSummary';
import { DashboardWorkbookList } from '@/components/study/dashboard/DashboardWorkbookList';
import { DashboardCommunityPanel } from '@/components/study/dashboard/DashboardCommunityPanel';
import { mockDashboardSummary, mockWorkbookListItems } from '@/lib/study/mock-data';

export default function StudyHomePage() {
  const summaryData = {
    ...mockDashboardSummary,
    recentWorkbooks: [],
  };

  return (
    <StudyShell
      title="대시보드"
      description="오늘의 학습 현황을 확인하고 이어서 풀기"
      action={
        <Link href="/study/generate">
          <button className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">
            새 문제집 만들기
          </button>
        </Link>
      }
    >
      {/* Study Summary */}
      <div className="mb-8">
        <DashboardSummary data={summaryData} />
      </div>

      {/* Today Quests */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">오늘의 퀘스트</h2>
          <Link href="/study/quests">
            <span className="text-sm text-blue-600 hover:underline font-medium">전체 보기 →</span>
          </Link>
        </div>
        <SectionCard>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '✏️', title: '문제 풀기', progress: '7/10', reward: '+100 XP' },
              { icon: '🎯', title: '문제 만들기', progress: '0/1', reward: '+200 XP' },
              { icon: '💬', title: '커뮤니티 참여', progress: '0/1', reward: '+50 XP' },
            ].map((quest, i) => (
              <div key={i} className="rounded-lg bg-gray-50 p-4 text-center">
                <div className="text-3xl mb-2">{quest.icon}</div>
                <p className="text-sm font-medium text-gray-900">{quest.title}</p>
                <p className="text-xs text-gray-600 mt-2">{quest.progress}</p>
                <p className="text-xs font-semibold text-blue-600 mt-1">{quest.reward}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* My Workbooks */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">내 문제집</h2>
          <Link href="/study/workbooks">
            <span className="text-sm text-blue-600 hover:underline font-medium">전체 보기 →</span>
          </Link>
        </div>
        <DashboardWorkbookList workbooks={mockWorkbookListItems} />
      </div>

      {/* Community */}
      <div className="mb-8">
        <DashboardCommunityPanel />
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">빠른 메뉴</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/study/wrong-notes">
            <SectionCard className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <span className="text-3xl">📝</span>
                <div>
                  <h3 className="font-semibold text-gray-900">오답노트</h3>
                  <p className="text-xs text-gray-600 mt-1">틀린 문제를 다시 풀어보세요</p>
                </div>
              </div>
            </SectionCard>
          </Link>
          <Link href="/study/stats">
            <SectionCard className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <span className="text-3xl">📊</span>
                <div>
                  <h3 className="font-semibold text-gray-900">학습 통계</h3>
                  <p className="text-xs text-gray-600 mt-1">당신의 진행 상황을 확인하세요</p>
                </div>
              </div>
            </SectionCard>
          </Link>
        </div>
      </div>
    </StudyShell>
  );
}
