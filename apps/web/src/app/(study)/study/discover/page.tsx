'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { SectionCard, EmptyState } from '@/components/study/shared';
import { WorkbookSearchFilters } from '@/components/study/discover/WorkbookSearchFilters';
import { PublicWorkbookListItem } from '@/components/study/discover/PublicWorkbookListItem';
import { useState } from 'react';
import { mockPublicWorkbooks } from '@/lib/study/mock-data';

export default function StudyDiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWorkbooks = mockPublicWorkbooks.filter((wb) =>
    wb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wb.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wb.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wb.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <StudyShell
      title="문제집 검색"
      description="다른 학습자들이 만든 문제집을 검색하고 저장하세요"
    >
      <div className="space-y-6">
        {/* Search & Filters */}
        <SectionCard>
          <WorkbookSearchFilters onSearch={setSearchQuery} />
        </SectionCard>

        {/* Results */}
        {filteredWorkbooks.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              검색 결과: <span className="font-semibold">{filteredWorkbooks.length}개</span>
            </p>
            {filteredWorkbooks.map((workbook) => (
              <PublicWorkbookListItem key={workbook.id} workbook={workbook} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🔍"
            title="검색 결과가 없습니다"
            description={
              searchQuery ? `"${searchQuery}"에 대한 문제집을 찾을 수 없습니다` : '검색어를 입력하여 문제집을 찾아보세요'
            }
          />
        )}
      </div>
    </StudyShell>
  );
}
