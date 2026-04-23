'use client';

import { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';

export function QuestionPractice({ questionId }: { questionId: string }) {
  const startedAt = useMemo(() => Date.now(), []);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [freeAnswer, setFreeAnswer] = useState('');
  const [result, setResult] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string | null;
  } | null>(null);

  const { data: question, isLoading, error } = trpc.study.getQuestion.useQuery({ questionId });
  const submitAttempt = trpc.study.submitAttempt.useMutation({
    onSuccess(data) {
      setResult(data);
    },
  });

  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">문항을 불러오는 중입니다.</div>;
  }

  if (error || !question) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error?.message ?? '문항을 찾을 수 없습니다.'}</div>;
  }

  const choices = question.choices ?? [];
  const hasChoices = choices.length > 0;
  const answer = hasChoices ? selectedAnswer : freeAnswer;

  function handleSubmit() {
    if (!answer.trim()) return;
    submitAttempt.mutate({
      questionId,
      selectedAnswer: answer,
      elapsedSeconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
    });
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>{question.questionNo ? `${question.questionNo}번` : question.externalId}</span>
          <span>{question.difficulty ?? question.type}</span>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-base font-semibold leading-7 text-slate-950">{question.prompt}</p>
      </section>

      <section className="space-y-2">
        {hasChoices ? (
          choices.map((choice, index) => (
            <button
              key={`${choice}-${index}`}
              type="button"
              onClick={() => setSelectedAnswer(choice)}
              className={`w-full rounded-lg border p-4 text-left text-sm leading-6 ${
                selectedAnswer === choice ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-800'
              }`}
            >
              {choice}
            </button>
          ))
        ) : (
          <textarea
            value={freeAnswer}
            onChange={(event) => setFreeAnswer(event.target.value)}
            rows={4}
            placeholder="정답을 입력하세요."
            className="w-full rounded-lg border border-slate-300 bg-white p-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        )}
      </section>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!answer.trim() || submitAttempt.isLoading || Boolean(result)}
        className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {submitAttempt.isLoading ? '채점 중' : '정답 제출'}
      </button>

      {result ? (
        <section className={`rounded-lg border p-4 ${result.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
          <p className={`text-base font-bold ${result.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
            {result.isCorrect ? '정답입니다.' : '오답입니다.'}
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-900">정답: {result.correctAnswer}</p>
          {result.explanation ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{result.explanation}</p> : null}
        </section>
      ) : null}
    </div>
  );
}
