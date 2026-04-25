'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';

export function DiscoverPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sort, setSort] = useState<'latest' | 'rating' | 'popularity'>('latest');
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const { data, isLoading } = trpc.study.listPublicWorkbooks.useQuery({
    keyword: keyword || undefined,
    category: category || undefined,
    difficulty: difficulty || undefined,
    sort,
    limit,
    offset,
  });

  const handleReset = useCallback(() => {
    setKeyword('');
    setCategory('');
    setDifficulty('');
    setSort('latest');
    setOffset(0);
  }, []);

  if (isLoading) {
    return <div className="text-center text-sm text-slate-500">공개 문제집을 불러오는 중입니다...</div>;
  }

  const workbooks = data?.items ?? [];
  const hasMore = workbooks.length === limit;

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">검색</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setOffset(0);
              }}
              placeholder="제목, 설명 검색..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">카테고리</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setOffset(0);
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">전체</option>
              <option value="exam">시험</option>
              <option value="practice">연습</option>
              <option value="tutorial">강좌</option>
              <option value="other">기타</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">난이도</label>
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setOffset(0);
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">전체</option>
              <option value="easy">쉬움</option>
              <option value="medium">중간</option>
              <option value="hard">어려움</option>
              <option value="expert">전문가</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">정렬</label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as typeof sort);
                setOffset(0);
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="latest">최신순</option>
              <option value="rating">평점순</option>
              <option value="popularity">인기순</option>
            </select>
          </div>
        </div>

        {/* Reset Button */}
        {(keyword || category || difficulty || sort !== 'latest') && (
          <button
            onClick={handleReset}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* Workbook Grid */}
      {workbooks.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500 mb-3">공개된 문제집이 없습니다.</p>
          <p className="text-xs text-slate-400 mb-4">필터를 조정하거나 문제집을 공개해보세요.</p>
          <Link
            href="/study/library"
            className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            내 문제집으로 돌아가기 →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workbooks.map((workbook) => (
              <Link
                key={workbook.id}
                href={`/study/discover/${workbook.id}`}
                className="group rounded-lg border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                {/* Title */}
                <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600 mb-2">
                  {workbook.title}
                </p>

                {/* Description */}
                {workbook.description && (
                  <p className="line-clamp-2 text-xs text-slate-600 mb-3">
                    {workbook.description}
                  </p>
                )}

                {/* Tags */}
                {workbook.tags && workbook.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {workbook.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
                      >
                        {tag}
                      </span>
                    ))}
                    {workbook.tags.length > 2 && (
                      <span className="text-xs text-slate-500">+{workbook.tags.length - 2}</span>
                    )}
                  </div>
                )}

                {/* Metadata Row 1 */}
                <div className="mb-2 flex items-center gap-3 text-xs text-slate-600">
                  {workbook.difficulty && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5">
                      {workbook.difficulty}
                    </span>
                  )}
                  <span>📖 {workbook.questionCount}문항</span>
                </div>

                {/* Metadata Row 2 - Stats */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {workbook.avgRating ? (
                      <>
                        <span>⭐ {(Number(workbook.avgRating) ?? 0).toFixed(1)}</span>
                        <span className="text-slate-400">({workbook.reviewCount})</span>
                      </>
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

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed"
            >
              ← 이전
            </button>
            <span className="text-sm text-slate-600">
              {offset + 1} ~ {offset + workbooks.length} / 전체
            </span>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={!hasMore}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed"
            >
              다음 →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
