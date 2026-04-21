'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { Sidebar } from '@/components/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm">로딩 중...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/feed" className="font-bold text-slate-900 hover:text-blue-600">
            Company Community
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-sm text-slate-500 hover:text-slate-900">
              프로필
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
