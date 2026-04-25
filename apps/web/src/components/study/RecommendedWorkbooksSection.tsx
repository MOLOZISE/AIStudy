'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';

export function RecommendedWorkbooksSection() {
  const { data, isLoading } = trpc.study.getRecommendedWorkbooks.useQuery({
    limit: 3,
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">로드 중입니다...</p>
      </div>
    );
  }

  if (!data?.items || data.items.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold mb-2">추천 문제집</h2>
        <p className="text-sm text-slate-600 mb-3">아직 추천할 문제집이 없습니다.</p>
        <Link href="/study/discover" className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-700">
          공개 문제집 탐색하기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">추천 문제집</h2>
        <p className="text-xs text-slate-500 mt-1">인기순 추천</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {data.items.map((workbook) => (
          <Link
            key={workbook.id}
            href={`/study/discover/${workbook.id}`}
            className="group rounded-lg border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600 mb-2">
              {workbook.title}
            </p>
            {workbook.description && (
              <p className="line-clamp-2 text-xs text-slate-600 mb-3">
                {workbook.description}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div>
                {workbook.avgRating ? (
                  <span>⭐ {(Number(workbook.avgRating) ?? 0).toFixed(1)}</span>
                ) : (
                  <span className="text-slate-400">평점 없음</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span>❤️ {workbook.likeCount}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
