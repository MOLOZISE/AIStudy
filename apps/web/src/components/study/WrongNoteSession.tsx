'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

export function WrongNoteSession() {
  const router = useRouter();
  const startedAt = useMemo(() => Date.now(), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    accuracy: number;
    resolvedCount: number;
    results: Array<{ questionId: string; prompt: string; selectedAnswer: string; isCorrect: boolean; correctAnswer: string; explanation: string | null }>;
  } | null>(null);
  const [wrongOnly, setWrongOnly] = useState(false);

  const { data, isLoading, error } = trpc.study.listWrongNoteQuestions.useQuery({ limit: 100 });
  const submit = trpc.study.submitWrongNoteExam.useMutation({
    onSuccess(data) { setResult(data); },
  });

  if (isLoading) return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">오답 문제를 불러오는 중입니다.</div>;
  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  if (!data?.items.length) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-sm font-semibold text-emerald-700">오답 문제가 없습니다!</p>
        <p className="mt-1 text-xs text-emerald-600">모든 문제를 맞췄어요.</p>
      </div>
    );
  }

  const questions = data.items;
  const current = questions[currentIndex];
  const answeredCount = questions.filter((q) => answers[q.questionId]?.trim()).length;

  function setAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleSubmit() {
    const selectedAnswers = Object.entries(answers)
      .filter(([, v]) => v.trim())
      .map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer }));
    if (!selectedAnswers.length) return;
    submit.mutate({
      elapsedSeconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
      answers: selectedAnswers,
    });
  }

  if (result) {
    const reviewItems = wrongOnly ? result.results.filter((r) => !r.isCorrect) : result.results;
    return (
      <div className="space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">채점 결과</p>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-500">정답</p>
              <p className="mt-1 text-xl font-bold text-slate-950">{result.correctCount}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-500">오답</p>
              <p className="mt-1 text-xl font-bold text-red-600">{result.wrongCount}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-500">정답률</p>
              <p className="mt-1 text-xl font-bold text-blue-700">{result.accuracy}%</p>
            </div>
            <div className="rounded-md bg-emerald-50 p-3">
              <p className="text-xs text-emerald-600">해결됨</p>
              <p className="mt-1 text-xl font-bold text-emerald-700">{result.resolvedCount}</p>
            </div>
          </div>
          {result.resolvedCount > 0 && (
            <p className="mt-3 text-xs text-emerald-600 text-center">
              {result.resolvedCount}개 오답이 해결 처리되었습니다.
            </p>
          )}
        </section>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setWrongOnly(false)}
            className={`rounded-md border px-4 py-3 text-sm font-semibold ${!wrongOnly ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}>
            전체 보기
          </button>
          <button type="button" onClick={() => setWrongOnly(true)}
            className={`rounded-md border px-4 py-3 text-sm font-semibold ${wrongOnly ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-600'}`}>
            오답만 보기
          </button>
        </div>

        <div className="space-y-3">
          {reviewItems.map((item, i) => (
            <section key={item.questionId} className={`rounded-lg border p-4 ${item.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-950">{i + 1}번</p>
                <span className={`text-xs font-semibold ${item.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                  {item.isCorrect ? '정답 ✓ 해결됨' : '오답'}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-900">{item.prompt}</p>
              <div className="mt-3 space-y-1 text-sm text-slate-700">
                <p>내 답: {item.selectedAnswer}</p>
                <p>정답: {item.correctAnswer}</p>
              </div>
              {item.explanation && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.explanation}</p>}
            </section>
          ))}
        </div>

        <button type="button" onClick={() => router.push('/study/wrong-notes')}
          className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
          오답노트로 돌아가기
        </button>
      </div>
    );
  }

  const choices = current.choices as string[] ?? [];
  const selectedAnswer = answers[current.questionId] ?? '';

  return (
    <div className="space-y-4">
      {/* 번호 그리드 */}
      <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <p className="mb-2 text-xs text-slate-500">문항 이동</p>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, i) => (
            <button
              key={q.questionId}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`h-8 w-8 rounded text-xs font-semibold transition-colors ${
                i === currentIndex
                  ? 'bg-blue-600 text-white'
                  : answers[q.questionId]
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
            {current.wrongCount}회 틀림
          </span>
          <span>{currentIndex + 1}/{questions.length}</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-blue-600" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>
        <p className="mt-4 whitespace-pre-wrap text-base font-semibold leading-7 text-slate-950">{current.prompt}</p>
      </section>

      <section className="space-y-2">
        {choices.length > 0 ? (
          choices.map((choice, index) => (
            <button key={`${choice}-${index}`} type="button"
              onClick={() => setAnswer(current.questionId, choice)}
              className={`w-full rounded-lg border p-4 text-left text-sm leading-6 ${
                selectedAnswer === choice ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-800'
              }`}>
              {choice}
            </button>
          ))
        ) : (
          <textarea value={selectedAnswer} onChange={(e) => setAnswer(current.questionId, e.target.value)}
            rows={4} placeholder="정답을 입력하세요."
            className="w-full rounded-lg border border-slate-300 bg-white p-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        )}
      </section>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setCurrentIndex((v) => Math.max(0, v - 1))} disabled={currentIndex === 0}
          className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300">
          이전
        </button>
        <button type="button" onClick={() => setCurrentIndex((v) => Math.min(questions.length - 1, v + 1))} disabled={currentIndex === questions.length - 1}
          className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300">
          다음
        </button>
      </div>

      <button type="button" onClick={handleSubmit}
        disabled={answeredCount === 0 || submit.isLoading}
        className="w-full rounded-md bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
        {submit.isLoading ? '채점 중' : `${answeredCount}/${questions.length}문항 제출`}
      </button>
    </div>
  );
}
