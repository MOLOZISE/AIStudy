import type { PublicWorkbook } from '@/lib/study/study-types';
import { Star, Bookmark } from 'lucide-react';
import Link from 'next/link';

const difficultyColor: Record<string, string> = {
  easy: 'bg-green-50 text-green-700',
  medium: 'bg-yellow-50 text-yellow-700',
  hard: 'bg-red-50 text-red-700',
};

export function PublicWorkbookListItem({ workbook }: { workbook: PublicWorkbook }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors bg-white">
      <div className="space-y-3">
        {/* Title & Verified Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 line-clamp-2">{workbook.title}</h3>
              {workbook.verified && (
                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded whitespace-nowrap">
                  ✓ 검증됨
                </span>
              )}
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${difficultyColor[workbook.difficulty] || 'bg-gray-100 text-gray-700'}`}>
            {workbook.difficulty === 'easy' ? '쉬움' : workbook.difficulty === 'medium' ? '중간' : '어려움'}
          </div>
        </div>

        {/* Info Row */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          <span>{workbook.subject}</span>
          <span>•</span>
          <span>{workbook.questionCount}개 문제</span>
          <span>•</span>
          <span>출제자: {workbook.authorName}</span>
        </div>

        {/* Rating & Metrics */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">{workbook.rating.toFixed(1)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">평점</p>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">{workbook.solveCount}</div>
            <p className="text-xs text-gray-500 mt-0.5">풀이</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Bookmark className="w-4 h-4" />
              <span className="font-semibold text-gray-900">{workbook.saveCount}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">저장</p>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">{workbook.likeCount}</div>
            <p className="text-xs text-gray-500 mt-0.5">좋아요</p>
          </div>
        </div>

        {/* Tags & CTA */}
        <div className="flex items-center justify-between pt-2 gap-2">
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {workbook.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                #{tag}
              </span>
            ))}
            {workbook.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{workbook.tags.length - 2}</span>
            )}
          </div>
          <Link href={`/study/workbooks/${workbook.id}`}>
            <button className="px-3 py-1.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-medium whitespace-nowrap">
              자세히 보기
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
