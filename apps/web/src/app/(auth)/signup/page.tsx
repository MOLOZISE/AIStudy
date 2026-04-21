import Link from 'next/link';
import { SignupForm } from '@/components/SignupForm';

export default function SignupPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">회원가입</h1>
        <p className="text-sm text-slate-500 mt-1">사내 커뮤니티에 참여하세요</p>
      </div>

      <SignupForm />

      <p className="mt-4 text-center text-sm text-slate-500">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-blue-500 hover:underline font-medium">
          로그인
        </Link>
      </p>
    </>
  );
}
