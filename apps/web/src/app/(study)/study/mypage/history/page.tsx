'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { WorkbookHistoryList } from '@/components/study/mypage/WorkbookHistoryList';
import { mockWorkbookHistory } from '@/lib/study/mock-data';

export default function MypageHistoryPage() {
  return (
    <StudyShell title="학습 이력" description="당신의 학습 활동 기록을 확인하세요">
      <WorkbookHistoryList events={mockWorkbookHistory} />
    </StudyShell>
  );
}
