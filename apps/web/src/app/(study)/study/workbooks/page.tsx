'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { SectionCard, SearchInput, FilterBar, StatusBadge, EmptyState, SegmentTabs } from '@/components/study/shared';
import { mockWorkbookListItems } from '@/lib/study/mock-data';
import Link from 'next/link';
import { useState } from 'react';

export default function WorkbooksPage() {
  const [filterTab, setFilterTab] = useState('all');

  const filterTabs = [
    { value: 'all', label: '전체' },
    { value: 'created', label: '만든 것' },
    { value: 'shared', label: '공유받은 것' },
    { value: 'saved', label: '저장한 것' },
  ];

  const filteredWorkbooks = mockWorkbookListItems.filter((wb) => {
    if (filterTab === 'all') return true;
    return wb.ownership === filterTab;
  });

  return (
    <StudyShell
      title="내 문제집"
      description="당신이 만들거나 저장한 문제집들을 관리하세요"
      action={
        <Link href="/study/generate">
          <button className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">
            새 문제집 만들기
          </button>
        </Link>
      }
    >
      {/* Search & Filter */}
      <div className="mb-6 space-y-3">
        <SearchInput placeholder="문제집 검색..." />
        <FilterBar>
          <label className="text-xs text-gray-600">주제:</label>
          <select className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>모두</option>
            <option>수학</option>
            <option>영어</option>
            <option>과학</option>
          </select>
          <label className="text-xs text-gray-600 ml-4">난이도:</label>
          <select className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>모두</option>
            <option>쉬움</option>
            <option>중간</option>
            <option>어려움</option>
          </select>
        </FilterBar>
      </div>

      {/* Tab Filter */}
      <div className="mb-6">
        <SegmentTabs items={filterTabs} value={filterTab} onChange={setFilterTab} />
      </div>

      {/* Workbook List */}
      {filteredWorkbooks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredWorkbooks.map((wb) => (
            <Link key={wb.id} href={`/study/workbooks/${wb.id}`}>
              <SectionCard className="cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{wb.title}</h3>
                      <StatusBadge label={wb.subject} variant="info" />
                      <StatusBadge
                        label={wb.difficulty}
                        variant={
                          wb.difficulty === 'easy'
                            ? 'success'
                            : wb.difficulty === 'hard'
                              ? 'danger'
                              : 'warning'
                        }
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {wb.questionCount}개 문제 • 마지막: {wb.lastStudiedAt}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">진행률</span>
                        <span className="text-xs font-semibold">{wb.progressRate}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${wb.progressRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <button className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">
                    이어서 풀기
                  </button>
                </div>
              </SectionCard>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📚"
          title="문제집이 없습니다"
          description="새로운 문제집을 만들어 학습을 시작하세요"
          action={
            <Link href="/study/generate">
              <button className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">
                문제집 생성하기
              </button>
            </Link>
          }
        />
      )}
    </StudyShell>
  );
}
