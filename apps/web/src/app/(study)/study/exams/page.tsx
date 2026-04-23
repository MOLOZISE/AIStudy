import { ExamSetList } from '@/components/study/ExamSetList';
import { StudyShell } from '@/components/study/StudyShell';

export default function StudyExamSetsPage() {
  return (
    <StudyShell title="모의고사 세트" description="07_모의고사_세트매핑으로 구성된 세트를 골라 한 번에 풀 수 있습니다.">
      <ExamSetList />
    </StudyShell>
  );
}
