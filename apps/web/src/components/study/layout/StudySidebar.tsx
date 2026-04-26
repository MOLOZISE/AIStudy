'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

const navItems = [
  { href: '/study', label: '홈', icon: '📚' },
  { href: '/study/quests', label: '오늘의 퀘스트', icon: '⚡' },
  { href: '/study/workbooks', label: '내 문제집', icon: '📖' },
  { href: '/study/generate', label: '문제 생성', icon: '✨' },
  { href: '/study/community', label: '커뮤니티', icon: '💬' },
  { href: '/study/discover', label: '탐색', icon: '🔍' },
  { href: '/study/rankings', label: '랭킹', icon: '🏆' },
  { href: '/study/wrong-notes', label: '오답노트', icon: '📝' },
  { href: '/study/mypage', label: '마이페이지', icon: '👤' },
  { href: '/study/stats', label: '학습 통계', icon: '📊' },
];

export function StudySidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-200 ease-out lg:sticky lg:top-14 lg:translate-x-0 lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-screen flex-col">
          {/* Mobile close button */}
          <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4 lg:hidden">
            <span className="font-semibold">메뉴</span>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
              aria-label="메뉴 닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-4">
            <p className="text-xs text-gray-500">AIStudy © 2026</p>
          </div>
        </div>
      </aside>
    </>
  );
}
