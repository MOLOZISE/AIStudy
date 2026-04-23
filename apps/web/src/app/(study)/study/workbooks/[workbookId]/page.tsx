import { use } from 'react';
import { StudyShell } from '@/components/study/StudyShell';
import { WorkbookDetail } from '@/components/study/WorkbookDetail';

export default function StudyWorkbookPage({ params }: { params: Promise<{ workbookId: string }> }) {
  const { workbookId } = use(params);

  return (
    <StudyShell title="Workbook 상세" description="시트 import 현황과 학습 진입점을 보여주는 화면입니다.">
      <WorkbookDetail workbookId={workbookId} />
    </StudyShell>
  );
}
