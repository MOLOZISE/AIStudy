import { StudyShell } from '@/components/study/StudyShell';
import { SearchQuestions } from '@/components/study/SearchQuestions';

export default function StudySearchPage() {
  return (
    <StudyShell title="문제 검색" description="문제 본문이나 해설에서 키워드를 검색하세요.">
      <SearchQuestions />
    </StudyShell>
  );
}
