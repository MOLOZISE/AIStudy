'use client';

import Link from 'next/link';
import { Menu, Search } from 'lucide-react';
import { NotificationBell } from '../NotificationBell';

export function StudyTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Logo + Menu Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="메뉴 열기"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/study" className="flex items-center gap-2 font-bold">
            <span className="text-xl">📚</span>
            <span className="hidden sm:inline">AIStudy</span>
          </Link>
        </div>

        {/* Search + Notifications + User Menu */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden items-center gap-2 rounded-lg bg-gray-100 px-3 py-1 md:flex">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="검색..."
              className="bg-transparent text-sm outline-none placeholder:text-gray-500"
            />
          </div>

          {/* Notifications */}
          <NotificationBell />

          {/* User Avatar Placeholder */}
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
            👤
          </div>
        </div>
      </div>
    </header>
  );
}
