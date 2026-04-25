'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navigation bar for admin pages.
 * Shows which admin section is currently active.
 */
export function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { label: '대시보드', href: '/study/admin', icon: '📊' },
    { label: '신고 관리', href: '/study/admin/reports', icon: '📋' },
    { label: '퀘스트 관리', href: '/study/admin/quests', icon: '🎯' },
    { label: 'AI 작업', href: '/study/admin/ai-jobs', icon: '🤖' },
    { label: '문제 QC', href: '/study/admin/questions', icon: '✓' },
    { label: '문제집 관리', href: '/study/admin/workbooks', icon: '📚' },
  ];

  return (
    <div className="border-b border-slate-200 bg-slate-50">
      <div className="flex gap-1 px-4 py-3 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
