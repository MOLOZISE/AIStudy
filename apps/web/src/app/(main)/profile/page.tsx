import { ProfileForm } from '@/components/ProfileForm';

export default function ProfilePage() {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-6">내 프로필</h2>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <ProfileForm />
      </div>
    </div>
  );
}
