import { use } from 'react';
import { ExamSession } from '@/components/study/ExamSession';
import { ExamHistory } from '@/components/study/ExamHistory';
import { StudyShell } from '@/components/study/StudyShell';

export default function StudyExamSetPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = use(params);

  return (
    <StudyShell title="모의고사 풀이" description="세트에 포함된 문항을 차례대로 풀고, 제출 후 오답만 다시 볼 수 있습니다.">
      <ExamHistory setId={setId} />
      <ExamSession setId={setId} />
    </StudyShell>
  );
}
