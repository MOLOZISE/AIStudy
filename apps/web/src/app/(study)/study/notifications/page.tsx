import { StudyShell } from '@/components/study/StudyShell';
import { NotificationsPage } from '@/components/study/NotificationsPage';

export default function StudyNotificationsPage() {
  return (
    <StudyShell title="알림" description="학습 및 커뮤니티 활동 알림을 확인하세요.">
      <NotificationsPage />
    </StudyShell>
  );
}
