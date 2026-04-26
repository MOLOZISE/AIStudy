'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';

export function NotificationBell() {
  const { data: unreadCount } = trpc.study.getUnreadNotificationCount.useQuery();

  return (
    <Link
      href="/study/notifications"
      className="relative rounded-md p-2 text-slate-600 hover:bg-white hover:text-slate-950 font-medium"
      title="알림"
    >
      <span className="text-xl">🔔</span>
      {unreadCount && unreadCount > 0 && (
        <span className="absolute top-1 right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
