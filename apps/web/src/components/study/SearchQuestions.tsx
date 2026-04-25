'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';

export function SearchQuestions() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const { data, isLoading, error } = trpc.study.searchQuestions.useQuery(
    { query: submitted, limit: 30 },
    { enabled: submitted.length > 0 },
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) setSubmitted(query.trim());
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="문제 내용, 해설 검색..."
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button type="submit" disabled={!query.trim()}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-300">
          검색
        </button>
      </form>

      {isLoading && <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">검색 중...</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>}

      {data && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">&lsquo;{data.query}&rsquo;</span> 검색 결과 {data.items.length}건
          </p>
          {data.items.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">검색 결과가 없습니다.</div>
          )}
          {data.items.map((item) => {
            const highlighted = item.prompt.replace(
              new RegExp(`(${data.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
              '**$1**',
            );
            return (
              <Link key={item.id} href={`/study/questions/${item.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300">
                <div className="flex items-start justify-between gap-3">
                  <p className="line-clamp-3 text-sm leading-6 text-slate-900">
                    {highlighted.split('**').map((part, i) =>
                      i % 2 === 1
                        ? <mark key={i} className="bg-yellow-100 text-yellow-900">{part}</mark>
                        : part
                    )}
                  </p>
                  {item.difficulty && (
                    <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                      item.difficulty === '상' ? 'bg-red-50 text-red-600' :
                      item.difficulty === '중' ? 'bg-amber-50 text-amber-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>{item.difficulty}</span>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-400">{item.workbookName.replace(/\.[^.]+$/, '')}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
