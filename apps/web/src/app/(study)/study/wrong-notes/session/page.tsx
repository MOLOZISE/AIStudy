import { StudyShell } from '@/components/study/StudyShell';
import { WrongNoteSession } from '@/components/study/WrongNoteSession';

export default function WrongNoteSessionPage() {
  return (
    <StudyShell title="오답 다시 풀기" description="틀렸던 문제를 다시 풀고 해결해보세요.">
      <WrongNoteSession />
    </StudyShell>
  );
}
