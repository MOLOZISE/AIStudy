import { use } from 'react';
import { StudyShell } from '@/components/study/StudyShell';
import { ConceptList } from '@/components/study/ConceptList';

export default function WorkbookConceptsPage({ params }: { params: Promise<{ workbookId: string }> }) {
  const { workbookId } = use(params);
  return (
    <StudyShell title="개념 탐색" description="01_개념마스터 시트의 개념 목록입니다. 클릭하면 관련 문항을 볼 수 있어요.">
      <ConceptList workbookId={workbookId} />
    </StudyShell>
  );
}
