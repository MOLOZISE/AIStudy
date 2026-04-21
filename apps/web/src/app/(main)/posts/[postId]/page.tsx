'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/store/auth';

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  return `${Math.floor(diffHr / 24)}일 전`;
}

export default function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: post, isLoading } = trpc.posts.getById.useQuery({ id: postId });
  const incrementView = trpc.posts.incrementViewCount.useMutation();
  const deletePost = trpc.posts.delete.useMutation({
    onSuccess: () => router.push('/feed'),
  });

  useEffect(() => {
    if (postId) incrementView.mutate({ id: postId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  if (isLoading) {
    return <div className="text-slate-400 text-sm py-8 text-center">불러오는 중...</div>;
  }

  if (!post) {
    return <div className="text-slate-400 text-sm py-8 text-center">게시물을 찾을 수 없습니다.</div>;
  }

  const isOwner = user?.id === post.authorId;
  const authorLabel = post.isAnonymous ? post.anonAlias ?? '익명' : '멤버';

  return (
    <article className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span className="font-medium text-slate-800">{authorLabel}</span>
            {post.createdAt && <span>{relativeTime(new Date(post.createdAt))}</span>}
          </div>
          {post.title && (
            <h1 className="text-2xl font-bold text-slate-900">{post.title}</h1>
          )}
        </div>
        {isOwner && (
          <button
            onClick={() => deletePost.mutate({ id: post.id })}
            disabled={deletePost.isLoading}
            className="text-sm text-slate-400 hover:text-red-500"
          >
            삭제
          </button>
        )}
      </div>

      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>

      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="mt-4 space-y-2">
          {post.mediaUrls.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt="" loading="lazy" className="rounded-lg max-w-full" />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100 text-sm text-slate-400">
        <span>↑ {post.upvoteCount ?? 0}</span>
        <span>💬 {post.commentCount ?? 0}</span>
        <span>👁 {post.viewCount ?? 0}</span>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100">
        <p className="text-sm text-slate-400">댓글 기능은 Week 4에서 추가됩니다.</p>
      </div>
    </article>
  );
}
