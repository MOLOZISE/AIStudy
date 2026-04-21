'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { InfinitePostList } from '@/components/InfinitePostList';
import { PostCreateModal } from '@/components/PostCreateModal';

export default function FeedPage() {
  const searchParams = useSearchParams();
  const channelId = searchParams.get('channel') ?? undefined;
  const [showModal, setShowModal] = useState(false);
  const [feedKey, setFeedKey] = useState(0);

  function handleCreated() {
    setFeedKey((k) => k + 1);
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

      <InfinitePostList key={feedKey} channelId={channelId} />

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
