'use client';

import Link from 'next/link';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export function RankingsPage() {
  const [tab, setTab] = useState<'workbooks' | 'users'>('workbooks');
  const [workbookSort, setWorkbookSort] = useState<'popularity' | 'latest' | 'rating' | 'forks'>('popularity');
  const [userTab, setUserTab] = useState<'xp' | 'solved'>('xp');

  const rankedWorkbooks = trpc.study.listRankedWorkbooks.useQuery({
    sort: workbookSort,
    limit: 10,
    offset: 0,
  });

  const xpLeaderboard = trpc.study.getWeeklyXpLeaderboard.useQuery({}, {
    enabled: userTab === 'xp',
  });

  const solvedLeaderboard = trpc.study.getWeeklySolvedLeaderboard.useQuery({}, {
    enabled: userTab === 'solved',
  });

  return (
    <div className="space-y-6">
      {/* Main Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setTab('workbooks')}
          className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'workbooks'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          📚 문제집 순위
        </button>
        <button
          onClick={() => setTab('users')}
          className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          👥 사용자 순위
        </button>
      </div>

      {/* Workbooks Tab */}
      {tab === 'workbooks' && (
        <div className="space-y-4">
          {/* Workbook Sort Tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setWorkbookSort('popularity')}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                workbookSort === 'popularity'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              인기순
            </button>
            <button
              onClick={() => setWorkbookSort('latest')}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                workbookSort === 'latest'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => setWorkbookSort('rating')}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                workbookSort === 'rating'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              평점순
            </button>
            <button
              onClick={() => setWorkbookSort('forks')}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                workbookSort === 'forks'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              많이 복사됨
            </button>
          </div>

          {/* Workbook List */}
          {rankedWorkbooks.isLoading ? (
            <div className="text-center text-sm text-slate-500">로드 중입니다...</div>
          ) : rankedWorkbooks.data?.items.length === 0 ? (
            <div className="text-center text-sm text-slate-500">문제집이 없습니다.</div>
          ) : (
            <div className="space-y-2">
              {rankedWorkbooks.data?.items.map((workbook, idx) => (
                <Link
                  key={workbook.id}
                  href={`/study/discover/${workbook.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {workbook.title}
                        </p>
                      </div>
                      {workbook.description && (
                        <p className="line-clamp-1 text-xs text-slate-600 mb-2">
                          {workbook.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span>📖 {workbook.questionCount}문항</span>
                        {workbook.difficulty && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5">
                            {workbook.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs text-slate-600">
                      {workbook.avgRating ? (
                        <span>⭐ {(Number(workbook.avgRating) ?? 0).toFixed(1)}</span>
                      ) : (
                        <span className="text-slate-400">평점 없음</span>
                      )}
                      <div className="flex items-center gap-1">
                        <span>❤️ {workbook.likeCount}</span>
                        <span>📋 {workbook.forkCount ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="space-y-4">
          {/* User Leaderboard Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setUserTab('xp')}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                userTab === 'xp'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              주간 XP
            </button>
            <button
              onClick={() => setUserTab('solved')}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                userTab === 'solved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              주간 풀이 수
            </button>
          </div>

          <p className="text-xs text-slate-500">이번 주 (최근 7일)</p>

          {/* XP Leaderboard */}
          {userTab === 'xp' && (
            <>
              {xpLeaderboard.isLoading ? (
                <div className="text-center text-sm text-slate-500">로드 중입니다...</div>
              ) : xpLeaderboard.data?.items.length === 0 ? (
                <div className="text-center text-sm text-slate-500">아직 데이터가 없습니다.</div>
              ) : (
                <div className="space-y-2">
                  {xpLeaderboard.data?.items.map((user) => (
                    <div
                      key={user.userId}
                      className={`rounded-lg border p-3 flex items-center justify-between ${
                        user.userId === xpLeaderboard.data?.items[0]?.userId
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-600 w-8 text-center">
                          {user.rank === xpLeaderboard.data?.myRank ? '🏆' : user.rank}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {user.displayName}
                            {user.userId === xpLeaderboard.data?.items[0]?.userId && (
                              <span className="ml-2 text-xs bg-amber-200 text-amber-900 rounded px-2 py-1">
                                1위
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">
                            Lv. {user.level}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{user.weeklyXp}</p>
                        <p className="text-xs text-slate-500">XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Solved Leaderboard */}
          {userTab === 'solved' && (
            <>
              {solvedLeaderboard.isLoading ? (
                <div className="text-center text-sm text-slate-500">로드 중입니다...</div>
              ) : solvedLeaderboard.data?.items.length === 0 ? (
                <div className="text-center text-sm text-slate-500">아직 데이터가 없습니다.</div>
              ) : (
                <div className="space-y-2">
                  {solvedLeaderboard.data?.items.map((user) => (
                    <div
                      key={user.userId}
                      className={`rounded-lg border p-3 flex items-center justify-between ${
                        user.userId === solvedLeaderboard.data?.items[0]?.userId
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-600 w-8 text-center">
                          {user.rank === solvedLeaderboard.data?.myRank ? '🏆' : user.rank}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {user.displayName}
                            {user.userId === solvedLeaderboard.data?.items[0]?.userId && (
                              <span className="ml-2 text-xs bg-amber-200 text-amber-900 rounded px-2 py-1">
                                1위
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">
                            Lv. {user.level}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{user.solvedCount}</p>
                        <p className="text-xs text-slate-500">문항</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
