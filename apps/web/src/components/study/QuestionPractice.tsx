'use client';

import { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { QuestionAnswerInput } from './QuestionAnswerInput';

type Result = {
  attemptId: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string | null;
  questionType: 'multiple_choice_single' | 'true_false' | 'short_answer' | 'essay_self_review';
};

export function QuestionPractice({ questionId }: { questionId: string }) {
  const startedAt = useMemo(() => Date.now(), []);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [selfReview, setSelfReview] = useState<'알고있음' | '부분이해' | '모름' | null>(null);

  const { data: question, isLoading, error } = trpc.study.getQuestion.useQuery({ questionId });
  const submitAttempt = trpc.study.submitAttempt.useMutation({
    onSuccess(data) {
      setResult(data);
    },
  });
  const submitSelfReview = trpc.study.submitSelfReview.useMutation({
    onSuccess() {
      setSelfReview(null);
    },
  });

  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">문항을 불러오는 중입니다.</div>;
  }

  if (error || !question) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error?.message ?? '문항을 찾을 수 없습니다.'}</div>;
  }

  const choices = question.choices ?? [];

  function handleSubmit() {
    if (!answer.trim()) return;
    submitAttempt.mutate({
      questionId,
      selectedAnswer: answer,
      elapsedSeconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
    });
  }

  function handleSelfReview(review: '알고있음' | '부분이해' | '모름') {
    if (!result) return;
    submitSelfReview.mutate({
      attemptId: result.attemptId,
      selfReview: review,
    });
  }

  if (result && result.questionType === 'essay_self_review' && !selfReview) {
    return (
      <div className="space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>{question.questionNo ? `${question.questionNo}번` : question.externalId}</span>
            <span>{question.difficulty ?? question.type}</span>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-base font-semibold leading-7 text-slate-950">{question.prompt}</p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">당신의 답변</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{result.explanation ? result.explanation : '(작성 없음)'}</p>
        </section>

        <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">모범 답안</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-blue-800">{result.correctAnswer}</p>
        </section>

        <div>
          <p className="mb-3 text-sm font-semibold text-slate-900">이 문제를 얼마나 잘 이해하셨나요?</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSelfReview('알고있음')}
              disabled={submitSelfReview.isLoading}
              className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              알고 있음 ✓
            </button>
            <button
              type="button"
              onClick={() => handleSelfReview('부분이해')}
              disabled={submitSelfReview.isLoading}
              className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              부분 이해
            </button>
            <button
              type="button"
              onClick={() => handleSelfReview('모름')}
              disabled={submitSelfReview.isLoading}
              className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              모름
            </button>
          </div>
        </div>
      </div>
    );
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

      {!result && (
        <section className="space-y-2">
          <QuestionAnswerInput type={question.type} choices={choices} selectedAnswer={answer} onChange={setAnswer} disabled={submitAttempt.isLoading} />
        </section>
      )}

      {!result && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!answer.trim() || submitAttempt.isLoading}
          className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitAttempt.isLoading ? '채점 중' : '정답 제출'}
        </button>
      )}

      {result && result.questionType !== 'essay_self_review' && (
        <section className={`rounded-lg border p-4 ${result.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
          <p className={`text-base font-bold ${result.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
            {result.isCorrect ? '정답입니다.' : '오답입니다.'}
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-900">정답: {result.correctAnswer}</p>
          {result.explanation ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{result.explanation}</p> : null}
        </section>
      )}

      {selfReview && (
        <section className={`rounded-lg border p-4 ${selfReview === '알고있음' ? 'border-emerald-200 bg-emerald-50' : selfReview === '부분이해' ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
          <p className={`text-base font-bold ${selfReview === '알고있음' ? 'text-emerald-700' : selfReview === '부분이해' ? 'text-amber-700' : 'text-red-700'}`}>
            {selfReview === '알고있음' ? '완벽하게 이해했습니다! ✓' : selfReview === '부분이해' ? '부분적으로 이해했습니다.' : '더 공부가 필요합니다.'}
          </p>
        </section>
      )}
    </div>
  );
}
