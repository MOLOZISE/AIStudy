'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InfinitePostList } from '@/components/InfinitePostList';
import { PostCreateModal } from '@/components/PostCreateModal';
import { FlairChips } from '@/components/FlairChips';

export default function FeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelId = searchParams.get('channel') ?? undefined;
  const activeFlair = searchParams.get('flair') ?? undefined;
  const [showModal, setShowModal] = useState(false);
  const [feedKey, setFeedKey] = useState(0);

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
    router.push(`/feed?${params.toString()}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-900">
          {channelId ? '채널 피드' : '전체 피드'}
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
        >
          + 게시물 작성
        </button>
      </div>

      <div className="mb-4">
        <FlairChips activeFlair={activeFlair} onChange={handleFlairChange} />
      </div>

      <InfinitePostList key={feedKey} channelId={channelId} flair={activeFlair} />

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
