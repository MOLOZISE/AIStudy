import { StudyShell } from '@/components/study/StudyShell';
import { ProfilePage } from '@/components/study/ProfilePage';

export default function UserProfilePage() {
  return (
    <StudyShell title="프로필" description="나의 정보와 학습 통계를 확인하세요.">
      <ProfilePage />
    </StudyShell>
  );
}
