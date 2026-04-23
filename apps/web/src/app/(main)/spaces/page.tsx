'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { PostCreateModal } from '@/components/PostCreateModal';
import { useAuthStore } from '@/store/auth';
import {
  SPACE_FILTER_TABS,
  formatChannelHighlight,
  getSpaceFilterHref,
} from '@/lib/channel-groups';
import { SPACE_LIST_QUERY } from '@/lib/channel-directory';

type SpaceItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  type?: string | null;
  memberCount: number | null;
  postCount: number | null;
  purpose?: string | null;
  membershipType?: string | null;
  latestPostTitle?: string | null;
  topPostTitle?: string | null;
};

const MEMBERSHIP_LABELS: Record<string, string> = {
  open: '바로 참여',
  request: '승인 후 참여',
  invite: '초대 전용',
};

export default function SpacesPage() {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthStore();
  const searchParams = useSearchParams();

  const { data: channelsData, isLoading } = trpc.channels.getList.useQuery(SPACE_LIST_QUERY);
  const { data: myChannelIds } = trpc.channels.getMyMemberships.useQuery(undefined, {
    enabled: !!user,
  });
  const join = trpc.channels.join.useMutation();

  const spaces = ((channelsData?.items ?? []) as SpaceItem[]).filter((channel) => channel.type === 'space');
  const mySpaces = spaces.filter((space) => myChannelIds?.includes(space.id));
  const otherSpaces = spaces.filter((space) => !myChannelIds?.includes(space.id));

  const activeView = useMemo<'all' | 'joined' | 'discoverable'>(() => {
    const view = searchParams.get('view');
    if (view === 'joined' || view === 'discoverable') return view;
    return 'all';
  }, [searchParams]);

  const visibleJoinedSpaces = activeView === 'discoverable' ? [] : mySpaces;
  const visibleDiscoverableSpaces = activeView === 'joined' ? [] : otherSpaces;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-700 px-6 py-6 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">Spaces</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">소모임</h1>
              <p className="mt-3 text-sm leading-6 text-white/75">
                참여 중인 모임과 새로 들어갈 수 있는 공간을 분리해서 보여드립니다. 지금 내 활동 영역을 더
                빠르게 찾을 수 있어요.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-indigo-50"
            >
              새 글 작성
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {SPACE_FILTER_TABS.map((tab) => {
              const active = tab.key === activeView;
              const count =
                tab.key === 'all' ? spaces.length : tab.key === 'joined' ? mySpaces.length : otherSpaces.length;

              return (
                <Link
                  key={tab.key}
                  href={getSpaceFilterHref(tab.key)}
                  prefetch={false}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
          소모임 목록 불러오는 중...
        </div>
      ) : (
        <>
          {activeView !== 'discoverable' && (
            <SpaceGroup
              title="참여 중"
              subtitle="내가 이미 들어가 있는 공간"
              tone="indigo"
              spaces={visibleJoinedSpaces}
              emptyLabel="참여 중인 소모임이 없습니다."
              joined
              onJoin={(id) => join.mutate({ channelId: id })}
            />
          )}

          {activeView !== 'joined' && (
            <SpaceGroup
              title="참여 가능"
              subtitle="바로 들어갈 수 있거나 요청 가능한 공간"
              tone="emerald"
              spaces={visibleDiscoverableSpaces}
              emptyLabel="참여 가능한 소모임이 없습니다."
              joined={false}
              onJoin={(id) => join.mutate({ channelId: id })}
            />
          )}

          {spaces.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
              아직 소모임이 없습니다. 관리자에게 개설을 요청해보세요.
            </div>
          )}
        </>
      )}

      {showModal && <PostCreateModal onClose={() => setShowModal(false)} onCreated={() => setShowModal(false)} />}
    </div>
  );
}

function SpaceGroup({
  title,
  subtitle,
  tone,
  spaces,
  emptyLabel,
  joined,
  onJoin,
}: {
  title: string;
  subtitle: string;
  tone: 'indigo' | 'emerald';
  spaces: SpaceItem[];
  emptyLabel: string;
  joined: boolean;
  onJoin: (id: string) => void;
}) {
  const toneClasses =
    tone === 'indigo'
      ? 'border-indigo-100 bg-indigo-50 text-indigo-700'
      : 'border-emerald-100 bg-emerald-50 text-emerald-700';

  return (
    <section className={`overflow-hidden rounded-[26px] border ${toneClasses}`}>
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-current/60">{title}</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">{subtitle}</h2>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-950">{spaces.length.toLocaleString()}개</div>
          <div className="text-xs text-current/60">표시 중</div>
        </div>
      </div>

      <div className="px-5 pb-5">
        {spaces.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-current/10 bg-white/70 px-4 py-6 text-center text-sm text-slate-500">
            {emptyLabel}
          </div>
        ) : (
          <div className="grid gap-3">
            {spaces.map((space) => (
              <SpaceCard key={space.id} space={space} joined={joined} onJoin={onJoin} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SpaceCard({
  space,
  joined,
  onJoin,
}: {
  space: SpaceItem;
  joined: boolean;
  onJoin: (id: string) => void;
}) {
  const highlight = getSpaceHighlight(space);
  const membershipLabel = space.membershipType ? MEMBERSHIP_LABELS[space.membershipType] ?? space.membershipType : null;

  return (
    <div className="rounded-[22px] border border-white/60 bg-white p-4 shadow-[0_1px_0_rgba(15,23,42,0.02)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <Link href={`/spaces/${space.slug}`} prefetch={false} className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {membershipLabel && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {membershipLabel}
              </span>
            )}
            {joined ? (
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                참여 중
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                참여 가능
              </span>
            )}
          </div>

          <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">{space.name}</h3>

          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
            {space.description ?? '프로젝트, 스터디, 취미 모임이 모여 있는 공간입니다.'}
          </p>

          <p className="mt-3 text-sm font-medium text-slate-800">{highlight}</p>
        </Link>

        <div className="flex shrink-0 flex-row gap-2 md:flex-col md:items-end md:gap-1">
          <StatChip label="참여" value={space.memberCount ?? 0} />
          <StatChip label="글" value={space.postCount ?? 0} />
          {!joined && (
            <button
              type="button"
              onClick={() => onJoin(space.id)}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
            >
              참여하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
      <span>{label}</span>
      <span className="font-semibold text-slate-900">{value.toLocaleString()}</span>
    </div>
  );
}

function getSpaceHighlight(space: SpaceItem) {
  const preferred = space.topPostTitle ?? space.latestPostTitle;
  if (preferred) {
    return `핫한 글 · ${formatChannelHighlight(preferred)}`;
  }
  return `공간 소개 · ${formatChannelHighlight(space.description ?? '지금 올라온 글이 없는 공간입니다.')}`;
}
