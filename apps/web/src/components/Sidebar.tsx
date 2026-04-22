'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import { ChannelRequestModal } from './ChannelRequestModal';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps = {}) {
  const pathname = usePathname();
  const [showRequestModal, setShowRequestModal] = useState(false);

  const { data: boardsData } = trpc.channels.getList.useQuery({ limit: 50, offset: 0, type: 'board' });
  const { data: spacesData } = trpc.channels.getList.useQuery({ limit: 50, offset: 0, type: 'space' });
  const { data: myChannelIds, refetch: refetchMemberships } = trpc.channels.getMyMemberships.useQuery();
  const { data: isAdmin = false } = trpc.channels.isAdmin.useQuery();

  const leave = trpc.channels.leave.useMutation({ onSuccess: () => refetchMemberships() });

  const boards = boardsData?.items ?? [];
  const spaces = spacesData?.items ?? [];
  const myBoards = boards.filter((b) => myChannelIds?.includes(b.id));
  const mySpaces = spaces.filter((s) => myChannelIds?.includes(s.id));

  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <aside className="w-56 shrink-0">
      {showRequestModal && <ChannelRequestModal onClose={() => setShowRequestModal(false)} />}
      <div className="sticky top-20 space-y-1">

        {/* 게시판 섹션 */}
        <NavSection label="게시판">
          <NavLink href="/boards" active={isActive('/boards')} onClick={onNavigate}>
            커뮤니티 게시판
          </NavLink>
          {myBoards.map((board) => (
            <NavLink
              key={board.id}
              href={`/boards/${board.slug}`}
              active={pathname === `/boards/${board.slug}`}
              onClick={onNavigate}
              onLeave={() => leave.mutate({ channelId: board.id })}
            >
              # {board.name}
            </NavLink>
          ))}
        </NavSection>

        {/* 공간 섹션 */}
        <NavSection label="내 공간">
          <NavLink href="/spaces" active={isActive('/spaces')} onClick={onNavigate}>
            공간 탐색
          </NavLink>
          {mySpaces.map((space) => (
            <NavLink
              key={space.id}
              href={`/spaces/${space.slug}`}
              active={pathname === `/spaces/${space.slug}`}
              onClick={onNavigate}
              onLeave={() => leave.mutate({ channelId: space.id })}
            >
              · {space.name}
            </NavLink>
          ))}
        </NavSection>

        {/* 관리자 링크 */}
        {isAdmin && (
          <NavSection label="관리">
            <NavLink href="/admin/channels" active={pathname === '/admin/channels'} onClick={onNavigate}>
              채널 신청 관리
            </NavLink>
            <NavLink href="/admin/reports" active={pathname === '/admin/reports'} onClick={onNavigate}>
              신고 관리
            </NavLink>
          </NavSection>
        )}

        {/* 모아보기 (피드) — 하단 보조 */}
        <div className="pt-1 border-t border-slate-200">
          <NavLink href="/feed" active={isActive('/feed')} onClick={onNavigate} muted>
            모아보기
          </NavLink>
        </div>

        {/* 공간/채널 개설 신청 */}
        <button
          onClick={() => setShowRequestModal(true)}
          className="w-full rounded-lg border border-dashed border-slate-300 bg-white px-4 py-3 text-left text-sm font-medium text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        >
          + 게시판 / 공간 개설 신청
        </button>
      </div>
    </aside>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white py-2">
      <p className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <nav className="px-1">{children}</nav>
    </section>
  );
}

function NavLink({
  href,
  active,
  onClick,
  onLeave,
  muted,
  children,
}: {
  href: string;
  active: boolean;
  onClick?: () => void;
  onLeave?: () => void;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="group flex items-center rounded-md hover:bg-slate-50">
      <Link
        href={href}
        onClick={onClick}
        className={`flex-1 truncate px-3 py-2 text-sm ${
          active
            ? 'font-semibold text-blue-700'
            : muted
              ? 'text-slate-400 hover:text-slate-600'
              : 'text-slate-700'
        }`}
      >
        {children}
      </Link>
      {onLeave && (
        <button
          onClick={onLeave}
          className="pr-2 text-xs text-slate-300 opacity-0 hover:text-red-400 group-hover:opacity-100"
          title="나가기"
        >
          ✕
        </button>
      )}
    </div>
  );
}
