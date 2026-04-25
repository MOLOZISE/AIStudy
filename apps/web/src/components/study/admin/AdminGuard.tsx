'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Protects admin pages from non-admin access.
 * Redirects non-admin users to /study if they try to access admin pages.
 */
export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const router = useRouter();
  const overview = trpc.admin.getAdminOverview.useQuery(
    undefined,
    {
      onError: (error) => {
        // If forbidden, redirect to study
        if (error.data?.code === 'FORBIDDEN') {
          router.push('/study');
        }
      },
      retry: 1,
    }
  );

  if (overview.isLoading) {
    return <div className="p-6 text-center text-sm text-slate-500">권한 확인 중...</div>;
  }

  if (overview.error) {
    if (overview.error.data?.code === 'FORBIDDEN') {
      // Already redirecting, show fallback
      return (
        fallback ?? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-semibold text-red-900">관리자 권한이 필요합니다.</p>
            <p className="text-xs text-red-700 mt-2">이 페이지에 접근할 권한이 없습니다.</p>
            <a href="/study" className="text-red-600 hover:text-red-700 text-xs font-medium mt-3 inline-block">
              메인으로 돌아가기
            </a>
          </div>
        )
      );
    }

    // Other errors
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-900">오류가 발생했습니다.</p>
        <p className="text-xs text-red-700 mt-1">{overview.error.message}</p>
      </div>
    );
  }

  // Admin user - render children
  return <>{children}</>;
}
