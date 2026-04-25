import { StudyShell } from '@/components/study/StudyShell';
import { DiscoverPage } from '@/components/study/DiscoverPage';

export default function StudyDiscoverPage() {
  return (
    <StudyShell title="공개 문제집 탐색" description="다른 사용자가 공개한 문제집을 검색하고 당신의 라이브러리에 추가하세요.">
      <DiscoverPage />
    </StudyShell>
  );
}
