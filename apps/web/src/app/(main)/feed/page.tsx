'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InfinitePostList } from '@/components/InfinitePostList';
import { PostCreateModal } from '@/components/PostCreateModal';
import { FlairChips } from '@/components/FlairChips';
import { trpc } from '@/lib/trpc';

export default function FeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelId = searchParams.get('channel') ?? undefined;
  const activeFlair = searchParams.get('flair') ?? undefined;
  const [showModal, setShowModal] = useState(false);
  const [feedKey, setFeedKey] = useState(0);

  const { data: channelsData } = trpc.channels.getList.useQuery({ limit: 50, offset: 0 });
  const { data: myChannelIds, refetch: refetchMemberships } = trpc.channels.getMyMemberships.useQuery();
  const join = trpc.channels.join.useMutation({ onSuccess: () => refetchMemberships() });
  const leave = trpc.channels.leave.useMutation({ onSuccess: () => refetchMemberships() });

  const activeChannel = useMemo(
    () => channelsData?.items.find((ch) => ch.id === channelId),
    [channelsData?.items, channelId]
  );

  const isSpace = activeChannel?.type === 'space';
  const isMember = channelId ? myChannelIds?.includes(channelId) : false;

  function handleCreated() {
    setFeedKey((k) => k + 1);
  }

  function handleFlairChange(flair: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (flair) {
      params.set('flair', flair);
    } else {
      params.delete('flair');
    }
    const query = params.toString();
    router.push(query ? `/feed?${query}` : '/feed');
  }

  // No channel: "모아보기" aggregate view
  if (!activeChannel && !channelId) {
    return (
      <div className="space-y-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">모아보기</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">전체 글 모아보기</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                구독 중인 게시판과 공간의 최신 글을 한곳에서 확인합니다.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              새 글 작성
            </button>
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <FlairChips activeFlair={activeFlair} onChange={handleFlairChange} />
        </section>
        <InfinitePostList key={feedKey} flair={activeFlair} onStartPost={() => setShowModal(true)} />
        {showModal && (
          <PostCreateModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
        )}
      </div>
    );
  }

  // Space channel: purpose-driven, member-oriented
  if (isSpace) {
    return (
      <div className="space-y-5">
        <section className="rounded-lg border border-indigo-100 bg-indigo-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">공간</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                {activeChannel?.name ?? '공간'}
              </h1>
              {activeChannel?.description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  {activeChannel.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3 text-xs text-indigo-600">
                <span>{(activeChannel?.memberCount ?? 0).toLocaleString()}명 참여 중</span>
                <span>·</span>
                <span>{(activeChannel?.postCount ?? 0).toLocaleString()}개 글</span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              {isMember ? (
                <>
                  <button
                    onClick={() => setShowModal(true)}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    새 글 작성
                  </button>
                  <button
                    onClick={() => channelId && leave.mutate({ channelId })}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    공간 나가기
                  </button>
                </>
              ) : (
                <button
                  onClick={() => channelId && join.mutate({ channelId })}
                  className="rounded-lg border border-indigo-400 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  참여하기
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <FlairChips activeFlair={activeFlair} onChange={handleFlairChange} />
        </section>

        <InfinitePostList
          key={feedKey}
          channelId={channelId}
          flair={activeFlair}
          onStartPost={() => setShowModal(true)}
        />

        {showModal && (
          <PostCreateModal
            onClose={() => setShowModal(false)}
            onCreated={handleCreated}
            defaultChannelId={channelId}
          />
        )}
      </div>
    );
  }

  // Board channel (default): strong category identity, public discussion
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              {activeChannel ? '게시판' : '모아보기'}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              {activeChannel?.name ?? '전체 글 모아보기'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {activeChannel?.description ?? '게시판을 찾을 수 없습니다.'}
            </p>
            {activeChannel && (
              <div className="mt-2 text-xs text-slate-400">
                {(activeChannel.memberCount ?? 0).toLocaleString()}명 · {(activeChannel.postCount ?? 0).toLocaleString()}개 글
              </div>
            )}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            새 글 작성
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <FlairChips activeFlair={activeFlair} onChange={handleFlairChange} />
      </section>

      <InfinitePostList
        key={feedKey}
        channelId={channelId}
        flair={activeFlair}
        onStartPost={() => setShowModal(true)}
      />

      {showModal && (
        <PostCreateModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
          defaultChannelId={channelId}
        />
      )}
    </div>
  );
}
