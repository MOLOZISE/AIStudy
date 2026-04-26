'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { FilterBar } from '@/components/study/shared';

export function WorkbookSearchFilters({
  onSearch,
}: {
  onSearch?: (query: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sort, setSort] = useState('relevance');

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="문제집 제목, 태그, 출제자 검색..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterBar>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 과목</option>
            <option value="math">수학</option>
            <option value="english">영어</option>
            <option value="korean">국어</option>
            <option value="history">한국사</option>
            <option value="science">과학</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">난이도</option>
            <option value="easy">쉬움</option>
            <option value="medium">중간</option>
            <option value="hard">어려움</option>
          </select>

          <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>공개 범위</option>
            <option>공개</option>
            <option>친구만</option>
          </select>
        </FilterBar>

        <div className="flex gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="relevance">관련도순</option>
            <option value="newest">최신순</option>
            <option value="rating">평점순</option>
            <option value="most-solved">많이 푼 순</option>
            <option value="most-saved">저장 많은 순</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(subject || difficulty || query) && (
        <div className="flex flex-wrap gap-2 pt-2">
          {query && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">
              검색: {query}
              <button
                onClick={() => handleSearch('')}
                className="ml-1 hover:text-blue-900"
              >
                ✕
              </button>
            </span>
          )}
          {subject && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">
              과목: {subject}
              <button
                onClick={() => setSubject('')}
                className="ml-1 hover:text-blue-900"
              >
                ✕
              </button>
            </span>
          )}
          {difficulty && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">
              난이도: {difficulty}
              <button
                onClick={() => setDifficulty('')}
                className="ml-1 hover:text-blue-900"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
