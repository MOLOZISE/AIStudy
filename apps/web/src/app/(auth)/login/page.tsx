import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">로그인</h1>
        <p className="text-sm text-slate-500 mt-1">Company Community에 오신 걸 환영합니다</p>
      </div>

      <LoginForm />

      <p className="mt-4 text-center text-sm text-slate-500">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="text-blue-500 hover:underline font-medium">
          회원가입
        </Link>
      </p>
    </>
  );
}
