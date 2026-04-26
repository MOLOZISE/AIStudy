'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { SectionCard, MetricCard } from '@/components/study/shared';
import { mockUserProgress } from '@/lib/study/mock-data';
import Link from 'next/link';

export default function MypagePage() {
  return (
    <StudyShell
      title="마이페이지"
      description="당신의 학습 프로필과 성장 현황을 확인하세요"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard label="현재 레벨" value={mockUserProgress.level} />
        <MetricCard label="총 경험치" value={mockUserProgress.totalXp} />
        <MetricCard label="포인트" value={mockUserProgress.points} />
        <MetricCard label="연속 학습 일수" value={mockUserProgress.streakDays} unit="일" />
      </div>

      {/* Main Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
        <Link href="/study/mypage/points">
          <SectionCard className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">포인트 & 경험치</h3>
                <p className="text-sm text-gray-600 mt-1">현재 보유한 포인트와 경험치 상세보기</p>
              </div>
              <span className="text-3xl">⭐</span>
            </div>
          </SectionCard>
        </Link>

        <Link href="/study/mypage/badges">
          <SectionCard className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">배지 & 레벨</h3>
                <p className="text-sm text-gray-600 mt-1">획득한 배지와 다음 레벨까지의 진행 상황</p>
              </div>
              <span className="text-3xl">🏆</span>
            </div>
          </SectionCard>
        </Link>

        <Link href="/study/mypage/stats">
          <SectionCard className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">학습 통계</h3>
                <p className="text-sm text-gray-600 mt-1">주제별 정답률과 학습 시간 분석</p>
              </div>
              <span className="text-3xl">📊</span>
            </div>
          </SectionCard>
        </Link>

        <Link href="/study/mypage/ranking">
          <SectionCard className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">랭킹</h3>
                <p className="text-sm text-gray-600 mt-1">전체 학습자 중 당신의 순위 확인</p>
              </div>
              <span className="text-3xl">🏅</span>
            </div>
          </SectionCard>
        </Link>
      </div>

      {/* Recent Activity */}
      <SectionCard>
        <h3 className="text-lg font-semibold mb-4">최근 활동</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div>
              <p className="text-sm font-medium">고등수학 확률과 통계 완료</p>
              <p className="text-xs text-gray-500">2024-04-24 • 정답률 78%</p>
            </div>
            <span className="text-sm font-semibold text-blue-600">+150 XP</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div>
              <p className="text-sm font-medium">오늘의 퀘스트 3개 완료</p>
              <p className="text-xs text-gray-500">2024-04-24</p>
            </div>
            <span className="text-sm font-semibold text-blue-600">+300 XP</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">7일 연속 학습 배지 획득</p>
              <p className="text-xs text-gray-500">2024-04-20</p>
            </div>
            <span className="text-lg">🔥</span>
          </div>
        </div>
        <Link
          href="/study/mypage/history"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          전체 이력 보기 →
        </Link>
      </SectionCard>
    </StudyShell>
  );
}
