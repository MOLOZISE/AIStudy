import { use } from 'react';
import { StudyShell } from '@/components/study/StudyShell';
import { QuestionList } from '@/components/study/QuestionList';

export default function StudyWorkbookQuestionsPage({ params }: { params: Promise<{ workbookId: string }> }) {
  const { workbookId } = use(params);

  return (
    <StudyShell title="문제 리스트" description="05_정식문제은행 기준의 학습 노출 문항을 표시할 화면입니다.">
      <QuestionList workbookId={workbookId} />
    </StudyShell>
  );
}
