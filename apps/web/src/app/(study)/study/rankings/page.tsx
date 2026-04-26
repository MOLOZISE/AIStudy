'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { SectionCard, FilterBar } from '@/components/study/shared';
import { WorkbookRankingRow } from '@/components/study/rankings/WorkbookRankingRow';
import { useState } from 'react';
import { mockPublicWorkbooks } from '@/lib/study/mock-data';

export default function Page() {
  const [sortBy, setSortBy] = useState('score');
  const [period, setPeriod] = useState('week');

  // Score calculation for ranking
  const ranked = mockPublicWorkbooks
    .map((wb, index) => ({
      ...wb,
      score: Math.floor((5 - index * 0.5) * 100),
    }))
    .sort((a, b) => {
      if (sortBy === 'solve') return b.solveCount - a.solveCount;
      if (sortBy === 'save') return b.saveCount - a.saveCount;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.score - a.score;
    });

  const sortOptions = [
    { id: 'score', label: '점수순' },
    { id: 'solve', label: '풀이 많은 순' },
    { id: 'save', label: '저장 많은 순' },
    { id: 'rating', label: '평점순' },
  ];

  const periodOptions = [
    { id: 'week', label: '이번주' },
    { id: 'month', label: '이번달' },
    { id: 'all', label: '전체' },
  ];

  return (
    <StudyShell
      title="문제집 랭킹"
      description="인기 있는 문제집 순위를 확인하세요"
    >
      <div className="space-y-6">
        {/* Filters */}
        <SectionCard>
          <FilterBar>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {periodOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              {sortOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === opt.id
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </FilterBar>
        </SectionCard>

        {/* Rankings List */}
        <div className="space-y-3">
          {ranked.map((workbook, index) => (
            <WorkbookRankingRow
              key={workbook.id}
              rank={index + 1}
              title={workbook.title}
              rating={workbook.rating}
              solveCount={workbook.solveCount}
              saveCount={workbook.saveCount}
              score={workbook.score}
              workbookId={workbook.id}
            />
          ))}
        </div>
      </div>
    </StudyShell>
  );
}
