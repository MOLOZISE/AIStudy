'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { PostCard } from './PostCard';
import { PostCardSkeleton } from './Skeleton';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@repo/api';

type RouterOutput = inferRouterOutputs<AppRouter>;
type MyPost = RouterOutput['posts']['getMyPosts']['items'][number];

const LIMIT = 10;

export function ActivityTab() {
  const [offset, setOffset] = useState(0);
  const [allPosts, setAllPosts] = useState<MyPost[]>([]);

  const { data: profile, isLoading: profileLoading } = trpc.auth.getMe.useQuery();
  const { data: stats } = trpc.auth.getStats.useQuery();
  const { data: postsData, isFetching } = trpc.posts.getMyPosts.useQuery(
    { limit: LIMIT, offset },
    {
      onSuccess: (data) => {
        if (offset === 0) {
          setAllPosts(data.items);
        } else {
          setAllPosts((prev) => [...prev, ...data.items]);
        }
      },
    }
  );

  if (profileLoading) {
    return <div className="text-sm text-slate-400 py-8 text-center">불러오는 중...</div>;
  }

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const trustScore = profile?.trustScore ?? 36;
  const trustColor =
    trustScore >= 80 ? 'text-blue-600' :
    trustScore >= 50 ? 'text-green-600' :
    trustScore >= 20 ? 'text-yellow-600' :
    'text-red-500';
  const barColor =
    trustScore >= 80 ? 'bg-blue-500' :
    trustScore >= 50 ? 'bg-green-500' :
    trustScore >= 20 ? 'bg-yellow-400' :
    'bg-red-400';

  return (
    <div className="space-y-4">
      {/* Stats card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-700">{profile?.displayName}</p>
            {profile?.department && (
              <p className="text-xs text-slate-400">
                {profile.department}{profile.jobTitle ? ` · ${profile.jobTitle}` : ''}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className={`text-xl font-bold ${trustColor}`}>{trustScore}°</p>
            <p className="text-xs text-slate-400">신뢰도</p>
          </div>
        </div>

        {/* Trust bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
          <div
            className={`h-1.5 rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(100, trustScore)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 text-center pt-1">
          <div>
            <p className="text-lg font-bold text-slate-900">{stats?.postCount ?? 0}</p>
            <p className="text-xs text-slate-400">작성한 글</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{stats?.totalUpvotes ?? 0}</p>
            <p className="text-xs text-slate-400">받은 공감</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">{joinDate}</p>
            <p className="text-xs text-slate-400">가입일</p>
          </div>
        </div>
      </div>

      {/* My posts */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">내가 쓴 글</h3>

        {isFetching && allPosts.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
        ) : allPosts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm bg-white rounded-xl border border-slate-200">
            아직 작성한 글이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {allPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {postsData?.hasMore && (
              <button
                onClick={() => setOffset((o) => o + LIMIT)}
                disabled={isFetching}
                className="w-full py-2.5 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50"
              >
                {isFetching ? '불러오는 중...' : '더 보기'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
