'use client';

import { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';

interface ExamSubmitResult {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  results: Array<{
    questionId: string;
    position: number;
    prompt: string;
    selectedAnswer: string;
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string | null;
  }>;
}

export function ExamSession({ setId }: { setId: string }) {
  const startedAt = useMemo(() => Date.now(), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ExamSubmitResult | null>(null);
  const [wrongOnly, setWrongOnly] = useState(false);

  const { data: examSet, isLoading, error } = trpc.study.getExamSet.useQuery({ setId });
  const submitExamSet = trpc.study.submitExamSet.useMutation({
    onSuccess(data) {
      setResult(data);
      setWrongOnly(false);
    },
  });

  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">모의고사를 불러오는 중입니다.</div>;
  }

  if (error || !examSet) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error?.message ?? '모의고사 세트를 찾을 수 없습니다.'}</div>;
  }

  const questions = examSet.questions;
  const current = questions[currentIndex];
  const answeredCount = questions.filter((question) => answers[question.questionId]?.trim()).length;

  function setAnswer(questionId: string, value: string) {
    setAnswers((previous) => ({ ...previous, [questionId]: value }));
  }

  function submit() {
    const selectedAnswers = Object.entries(answers)
      .filter(([, selectedAnswer]) => selectedAnswer.trim())
      .map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer }));

    if (selectedAnswers.length === 0) return;

    submitExamSet.mutate({
      setId,
      elapsedSeconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
      answers: selectedAnswers,
    });
  }

  if (result) {
    const reviewItems = wrongOnly ? result.results.filter((item) => !item.isCorrect) : result.results;

    return (
      <div className="space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">채점 결과</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
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
          </div>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setWrongOnly(false)}
            className={`rounded-md border px-4 py-3 text-sm font-semibold ${!wrongOnly ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}
          >
            전체 보기
          </button>
          <button
            type="button"
            onClick={() => setWrongOnly(true)}
            className={`rounded-md border px-4 py-3 text-sm font-semibold ${wrongOnly ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-600'}`}
          >
            오답만 보기
          </button>
        </div>

        <div className="space-y-3">
          {reviewItems.map((item) => (
            <section key={item.questionId} className={`rounded-lg border p-4 ${item.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-950">{item.position}번</p>
                <span className={`text-xs font-semibold ${item.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                  {item.isCorrect ? '정답' : '오답'}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-900">{item.prompt}</p>
              <div className="mt-3 space-y-1 text-sm text-slate-700">
                <p>내 답: {item.selectedAnswer}</p>
                <p>정답: {item.correctAnswer}</p>
              </div>
              {item.explanation ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.explanation}</p> : null}
            </section>
          ))}
        </div>
      </div>
    );
  }

  if (!current) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">풀이 가능한 문항이 없습니다.</div>;
  }

  const choices = current.choices ?? [];
  const selectedAnswer = answers[current.questionId] ?? '';

  return (
    <div className="space-y-4">
      {/* 번호 그리드 네비게이션 */}
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
          <span>{examSet.title}</span>
          <span>{currentIndex + 1}/{questions.length}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-blue-600" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>
        <p className="mt-4 whitespace-pre-wrap text-base font-semibold leading-7 text-slate-950">{current.prompt}</p>
      </section>

      <section className="space-y-2">
        {choices.length > 0 ? (
          choices.map((choice, index) => (
            <button
              key={`${choice}-${index}`}
              type="button"
              onClick={() => setAnswer(current.questionId, choice)}
              className={`w-full rounded-lg border p-4 text-left text-sm leading-6 ${
                selectedAnswer === choice ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-800'
              }`}
            >
              {choice}
            </button>
          ))
        ) : (
          <textarea
            value={selectedAnswer}
            onChange={(event) => setAnswer(current.questionId, event.target.value)}
            rows={4}
            placeholder="정답을 입력하세요."
            className="w-full rounded-lg border border-slate-300 bg-white p-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        )}
      </section>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
          disabled={currentIndex === 0}
          className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          이전
        </button>
        <button
          type="button"
          onClick={() => setCurrentIndex((value) => Math.min(questions.length - 1, value + 1))}
          disabled={currentIndex === questions.length - 1}
          className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          다음
        </button>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={answeredCount === 0 || submitExamSet.isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {submitExamSet.isLoading ? '채점 중' : `${answeredCount}/${questions.length}문항 제출`}
      </button>
    </div>
  );
}
