import { use } from 'react';
import { StudyShell } from '@/components/study/StudyShell';
import { PublicWorkbookDetail } from '@/components/study/PublicWorkbookDetail';

export default function PublicWorkbookPage({ params }: { params: Promise<{ publicationId: string }> }) {
  const { publicationId } = use(params);

  return (
    <StudyShell title="공개 문제집" description="공개된 문제집을 확인하고 라이브러리에 추가하세요.">
      <PublicWorkbookDetail publicationId={publicationId} />
    </StudyShell>
  );
}
