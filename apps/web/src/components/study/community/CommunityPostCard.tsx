import type { CommunityPost } from '@/lib/study/study-types';
import { MessageCircle, ThumbsUp } from 'lucide-react';

const categoryColors: Record<string, { bg: string; text: string }> = {
  question: { bg: 'bg-blue-50', text: 'text-blue-700' },
  review: { bg: 'bg-green-50', text: 'text-green-700' },
  workbook: { bg: 'bg-purple-50', text: 'text-purple-700' },
  tip: { bg: 'bg-amber-50', text: 'text-amber-700' },
  discussion: { bg: 'bg-pink-50', text: 'text-pink-700' },
};

const categoryLabel: Record<string, string> = {
  question: '질문',
  review: '후기',
  workbook: '추천 문제집',
  tip: '학습 팁',
  discussion: '토론',
};

export function CommunityPostCard({ post }: { post: CommunityPost }) {
  const colors = categoryColors[post.category] || categoryColors.discussion;
  const label = categoryLabel[post.category] || post.category;

  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors bg-white">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${colors.bg} ${colors.text}`}
            >
              {label}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {new Date(post.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>

        {/* Title & Preview */}
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{post.bodyPreview}</p>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="font-medium text-gray-900">{post.author}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              <span>{post.likeCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
