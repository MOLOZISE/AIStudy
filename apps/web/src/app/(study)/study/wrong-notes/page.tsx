import { StudyShell } from '@/components/study/StudyShell';
import { WrongNotesList } from '@/components/study/WrongNotesList';

export default function StudyWrongNotesPage() {
  return (
    <StudyShell title="오답노트" description="틀린 문항을 사용자별로 모아 재풀이할 수 있게 하는 화면입니다.">
      <WrongNotesList />
    </StudyShell>
  );
}
