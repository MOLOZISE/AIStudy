import { Star } from 'lucide-react';
import Link from 'next/link';

interface WorkbookRankingRowProps {
  rank: number;
  title: string;
  rating: number;
  solveCount: number;
  saveCount: number;
  score: number;
  workbookId: string;
}

export function WorkbookRankingRow({
  rank,
  title,
  rating,
  solveCount,
  saveCount,
  score,
  workbookId,
}: WorkbookRankingRowProps) {
  const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Rank & Title */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-center">
            {medalEmoji ? (
              <span className="text-2xl">{medalEmoji}</span>
            ) : (
              <span className="font-bold text-gray-900">#{rank}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{title}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{solveCount}</div>
            <p className="text-xs text-gray-500">풀이</p>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">{saveCount}</div>
            <p className="text-xs text-gray-500">저장</p>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-blue-600">{score}</div>
            <p className="text-xs text-gray-500">점수</p>
          </div>
        </div>

        {/* CTA */}
        <Link href={`/study/workbooks/${workbookId}`}>
          <button className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-medium whitespace-nowrap transition-colors">
            상세보기
          </button>
        </Link>
      </div>

      {/* Mobile Metrics */}
      <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 sm:hidden text-xs">
        <div className="flex-1">
          <span className="text-gray-500">풀이:</span>
          <span className="ml-2 font-semibold text-gray-900">{solveCount}</span>
        </div>
        <div className="flex-1">
          <span className="text-gray-500">저장:</span>
          <span className="ml-2 font-semibold text-gray-900">{saveCount}</span>
        </div>
        <div className="flex-1">
          <span className="text-gray-500">점수:</span>
          <span className="ml-2 font-bold text-blue-600">{score}</span>
        </div>
      </div>
    </div>
  );
}
