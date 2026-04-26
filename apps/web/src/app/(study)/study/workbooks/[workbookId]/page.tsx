'use client';

import { use } from 'react';
import { StudyShell } from '@/components/study/StudyShell';
import { WorkbookDetailHeader } from '@/components/study/workbooks/WorkbookDetailHeader';
import { WorkbookInfoPanel } from '@/components/study/workbooks/WorkbookInfoPanel';
import { WorkbookRatingSummary } from '@/components/study/workbooks/WorkbookRatingSummary';
import { WorkbookCommentPreview } from '@/components/study/workbooks/WorkbookCommentPreview';
import { SectionCard } from '@/components/study/shared';
import { mockWorkbookDetail } from '@/lib/study/mock-data';

export default function StudyWorkbookPage({ params }: { params: Promise<{ workbookId: string }> }) {
  const { workbookId } = use(params);

  return (
    <StudyShell title={mockWorkbookDetail.title} description={mockWorkbookDetail.authorInfo.name}>
      <div className="space-y-6">
        {/* Header */}
        <WorkbookDetailHeader workbook={mockWorkbookDetail} />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <SectionCard>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">문제집 소개</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{mockWorkbookDetail.description}</p>
              </div>
            </SectionCard>

            {/* Rating & Reviews */}
            <WorkbookRatingSummary
              rating={mockWorkbookDetail.rating}
              liked={mockWorkbookDetail.liked}
              userRating={mockWorkbookDetail.userRating}
            />

            {/* Comments */}
            <WorkbookCommentPreview workbookId={workbookId} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <WorkbookInfoPanel workbook={mockWorkbookDetail} />
          </div>
        </div>
      </div>
    </StudyShell>
  );
}
