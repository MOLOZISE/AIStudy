import { StudyShell } from '@/components/study/StudyShell';
import { QuestsPage } from '@/components/study/QuestsPage';

export default function StudyQuestsPage() {
  return (
    <StudyShell title="퀘스트" description="매일, 매주, 매달 완료할 수 있는 퀘스트를 확인하세요.">
      <QuestsPage />
    </StudyShell>
  );
}
