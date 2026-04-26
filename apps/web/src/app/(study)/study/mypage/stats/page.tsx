'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { SectionCard } from '@/components/study/shared';
import { StatsMetricGrid } from '@/components/study/mypage/StatsMetricGrid';
import { SubjectAchievementTable } from '@/components/study/mypage/SubjectAchievementTable';
import { mockLearningStats } from '@/lib/study/mock-data';

export default function MypageStatsPage() {
  return (
    <StudyShell title="학습 통계" description="주제별 학습 현황과 통계를 확인하세요">
      <div className="space-y-6">
        {/* Key Metrics */}
        <StatsMetricGrid
          totalStudyTimeMinutes={mockLearningStats.totalStudyTime}
          overallAccuracyRate={mockLearningStats.overallAccuracyRate}
          totalQuestionsStudied={mockLearningStats.totalQuestionsStudied}
          streakDays={mockLearningStats.streakDays}
        />

        {/* Subject Achievement Table */}
        <SubjectAchievementTable
          data={mockLearningStats.subjectAchievements}
        />

        {/* Recent Study */}
        <SectionCard>
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">최근 학습 기록</h3>
            <div className="space-y-3">
              {mockLearningStats.recentStudyHistory.map((record, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{record.date}</p>
                    <p className="text-xs text-gray-500">{record.questionsStudied}개 문제</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{record.duration}분</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </StudyShell>
  );
}
