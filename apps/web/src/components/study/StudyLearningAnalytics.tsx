'use client';

import { trpc } from '@/lib/trpc';

function AccuracyBar({ accuracy }: { accuracy: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${accuracy >= 70 ? 'bg-emerald-500' : accuracy >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
          style={{ width: `${accuracy}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-semibold text-slate-700">{accuracy}%</span>
    </div>
  );
}

export function StudyLearningAnalytics() {
  const { data, isLoading, error } = trpc.study.getLearningAnalytics.useQuery();

  if (isLoading) return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">분석 데이터를 불러오는 중입니다.</div>;
  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  if (!data) return null;

  const { typeAccuracy, conceptAccuracy, weakConcepts, wrongNoteMastery, recentSummary } = data;

  return (
    <div className="space-y-5">
      {/* Recent summary */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-4">최근 학습 요약</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-xs text-blue-600 font-medium">최근 7일</p>
            <p className="mt-2 text-lg font-bold text-blue-700">{recentSummary.last7DaysAttempts}</p>
            <p className="text-xs text-blue-600">문제 풀이</p>
            <p className="mt-1 text-sm font-semibold text-blue-700">{recentSummary.last7DaysAccuracy}% 정답률</p>
          </div>
          <div className="rounded-md bg-purple-50 p-4">
            <p className="text-xs text-purple-600 font-medium">최근 30일</p>
            <p className="mt-2 text-lg font-bold text-purple-700">{recentSummary.last30DaysAttempts}</p>
            <p className="text-xs text-purple-600">문제 풀이</p>
            <p className="mt-1 text-sm font-semibold text-purple-700">{recentSummary.last30DaysAccuracy}% 정답률</p>
          </div>
        </div>
      </section>

      {/* Wrong note mastery */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-4">오답 정복률</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">전체 오답 노트</span>
            <span className="font-semibold text-slate-900">{wrongNoteMastery.total}개</span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">정복률</span>
              <span className="font-semibold text-emerald-700">{wrongNoteMastery.masteryRate}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${wrongNoteMastery.masteryRate}%` }}
              />
            </div>
          </div>
          <div className="grid gap-2 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span>정복됨</span>
              <span className="font-medium text-emerald-600">{wrongNoteMastery.mastered}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>복습 중</span>
              <span className="font-medium text-amber-600">{wrongNoteMastery.reviewing}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>미정복</span>
              <span className="font-medium text-slate-600">{wrongNoteMastery.open}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem type accuracy */}
      {typeAccuracy.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-4">문제 유형별 정답률</p>
          <div className="space-y-3">
            {typeAccuracy.map((type) => (
              <div key={type.type}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-600">{type.type || 'unknown'}</p>
                  <span className="text-xs text-slate-500">{type.correct}/{type.total}</span>
                </div>
                <AccuracyBar accuracy={type.accuracy} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Concept accuracy (top 10) */}
      {conceptAccuracy.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-4">개념별 정답률 (상위 10)</p>
          <div className="space-y-3">
            {conceptAccuracy.slice(0, 10).map((concept) => (
              <div key={concept.conceptId}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-slate-600">{concept.title}</p>
                  <span className="shrink-0 text-xs text-slate-500">{concept.correct}/{concept.total}</span>
                </div>
                <AccuracyBar accuracy={concept.accuracy} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Weak concepts */}
      {weakConcepts.length > 0 && (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-sm font-semibold text-red-700 mb-4">⚠️ 취약 개념 (정답률 낮은 상위 5)</p>
          <div className="space-y-3">
            {weakConcepts.map((concept) => (
              <div key={concept.conceptId}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-red-700 font-medium">{concept.title}</p>
                  <span className="shrink-0 text-xs text-red-600">{concept.total} 문제</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-red-200">
                  <div
                    className="h-full bg-red-500 transition-all"
                    style={{ width: `${concept.accuracy}%` }}
                  />
                </div>
                <p className="text-xs text-red-600 mt-1">{concept.accuracy}% 정답률</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {!typeAccuracy.length && !conceptAccuracy.length && !weakConcepts.length && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          아직 분석 데이터가 충분하지 않습니다.
        </div>
      )}
    </div>
  );
}
