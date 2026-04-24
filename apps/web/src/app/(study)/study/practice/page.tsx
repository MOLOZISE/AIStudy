import { StudyShell } from '@/components/study/StudyShell';
import { PracticeSession } from '@/components/study/PracticeSession';

export default function StudyPracticePage({ searchParams }: { searchParams: Promise<{ workbookId?: string }> }) {
  return (
    <StudyShell title="랜덤 연습" description="문제집, 난이도, 문항 수를 설정하고 랜덤 문제를 풀어보세요.">
      <PracticeSessionWrapper searchParams={searchParams} />
    </StudyShell>
  );
}

async function PracticeSessionWrapper({ searchParams }: { searchParams: Promise<{ workbookId?: string }> }) {
  const { workbookId } = await searchParams;
  return <PracticeSession defaultWorkbookId={workbookId} />;
}
