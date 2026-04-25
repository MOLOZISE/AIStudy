'use client';

import { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { QuestionAnswerInput } from './QuestionAnswerInput';

type PracticeConfig = {
  workbookId?: string;
  difficulty?: string;
  count: number;
};

function ResultView({ result, onRetry }: {
  result: { totalQuestions: number; correctCount: number; wrongCount: number; accuracy: number; results: Array<{ questionId: string; prompt: string; selectedAnswer: string; isCorrect: boolean; correctAnswer: string; explanation: string | null }> };
  onRetry: () => void;
}) {
  const [wrongOnly, setWrongOnly] = useState(false);
  const items = wrongOnly ? result.results.filter((r) => !r.isCorrect) : result.results;

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">채점 결과</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-500">정답</p><p className="mt-1 text-xl font-bold text-slate-950">{result.correctCount}</p></div>
          <div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-500">오답</p><p className="mt-1 text-xl font-bold text-red-600">{result.wrongCount}</p></div>
          <div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-500">정답률</p><p className="mt-1 text-xl font-bold text-blue-700">{result.accuracy}%</p></div>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setWrongOnly(false)} className={`rounded-md border px-4 py-3 text-sm font-semibold ${!wrongOnly ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}>전체 보기</button>
        <button type="button" onClick={() => setWrongOnly(true)} className={`rounded-md border px-4 py-3 text-sm font-semibold ${wrongOnly ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-600'}`}>오답만 보기</button>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <section key={item.questionId} className={`rounded-lg border p-4 ${item.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-950">{i + 1}번</p><span className={`text-xs font-semibold ${item.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>{item.isCorrect ? '정답' : '오답'}</span></div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-900">{item.prompt}</p>
            <div className="mt-3 space-y-1 text-sm text-slate-700"><p>내 답: {item.selectedAnswer}</p><p>정답: {item.correctAnswer}</p></div>
            {item.explanation && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.explanation}</p>}
          </section>
        ))}
      </div>
      <button type="button" onClick={onRetry} className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white">다시 연습하기</button>
    </div>
  );
}

function Session({ config, onReset }: { config: PracticeConfig; onReset: () => void }) {
  const startedAt = useMemo(() => Date.now(), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    accuracy: number;
    results: Array<{ questionId: string; prompt: string; selectedAnswer: string; isCorrect: boolean; correctAnswer: string; explanation: string | null }>;
  } | null>(null);

  const { data, isLoading, error } = trpc.study.getRandomQuestions.useQuery({
    workbookId: config.workbookId,
    difficulty: config.difficulty,
    limit: config.count,
  });
  const submitPractice = trpc.study.submitPractice.useMutation({ onSuccess: setResult });

  if (isLoading) return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">문제를 불러오는 중입니다.</div>;
  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  if (!data?.questions.length) return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">조건에 맞는 문제가 없습니다.</div>;

  if (result) return <ResultView result={result} onRetry={onReset} />;

  const questions = data.questions;
  const current = questions[currentIndex];
  const choices = current.choices as string[] ?? [];
  const selectedAnswer = answers[current.id] ?? '';
  const answeredCount = questions.filter((q) => answers[q.id]?.trim()).length;

  function handleSubmit() {
    const selectedAnswers = Object.entries(answers).filter(([, v]) => v.trim()).map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer }));
    if (!selectedAnswers.length) return;
    submitPractice.mutate({ elapsedSeconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)), answers: selectedAnswers });
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-500">문항 이동</p>
          <button type="button" onClick={onReset} className="text-xs text-slate-400 hover:text-slate-600">설정 변경</button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, i) => (
            <button key={q.id} type="button" onClick={() => setCurrentIndex(i)}
              className={`h-8 w-8 rounded text-xs font-semibold transition-colors ${i === currentIndex ? 'bg-blue-600 text-white' : answers[q.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500">
          {current.difficulty && <span className={`rounded px-2 py-0.5 font-medium ${current.difficulty === '상' ? 'bg-red-50 text-red-600' : current.difficulty === '중' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{current.difficulty}</span>}
          <span>{currentIndex + 1}/{questions.length}</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-blue-600" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>
        <p className="mt-4 whitespace-pre-wrap text-base font-semibold leading-7 text-slate-950">{current.prompt}</p>
      </section>

      <section className="space-y-2">
        <QuestionAnswerInput
          type={current.type}
          choices={choices}
          selectedAnswer={selectedAnswer}
          onChange={(value) => setAnswers((p) => ({ ...p, [current.id]: value }))}
          disabled={submitPractice.isLoading}
        />
      </section>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setCurrentIndex((v) => Math.max(0, v - 1))} disabled={currentIndex === 0}
          className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300">이전</button>
        <button type="button" onClick={() => setCurrentIndex((v) => Math.min(questions.length - 1, v + 1))} disabled={currentIndex === questions.length - 1}
          className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300">다음</button>
      </div>

      <button type="button" onClick={handleSubmit} disabled={answeredCount === 0 || submitPractice.isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
        {submitPractice.isLoading ? '채점 중' : `${answeredCount}/${questions.length}문항 제출`}
      </button>
    </div>
  );
}

export function PracticeSession({ defaultWorkbookId }: { defaultWorkbookId?: string }) {
  const [config, setConfig] = useState<PracticeConfig | null>(null);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('');
  const { data: workbooks } = trpc.study.listWorkbooks.useQuery({ limit: 20 });
  const [workbookId, setWorkbookId] = useState(defaultWorkbookId ?? '');

  if (config) return <Session config={config} onReset={() => setConfig(null)} />;

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">연습 설정</p>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">문제집</label>
        <select value={workbookId} onChange={(e) => setWorkbookId(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
          <option value="">전체 문제집</option>
          {workbooks?.items.map((w) => (
            <option key={w.id} value={w.id}>{w.originalFilename.replace(/\.[^.]+$/, '')}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">난이도</label>
        <div className="flex gap-2">
          {['', '하', '중', '상'].map((d) => (
            <button key={d} type="button" onClick={() => setDifficulty(d)}
              className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${difficulty === d ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
              {d || '전체'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">문항 수: {count}개</label>
        <input type="range" min={5} max={50} step={5} value={count} onChange={(e) => setCount(Number(e.target.value))}
          className="w-full accent-blue-600" />
        <div className="flex justify-between text-xs text-slate-400"><span>5</span><span>50</span></div>
      </div>

      <button type="button" onClick={() => setConfig({ workbookId: workbookId || undefined, difficulty: difficulty || undefined, count })}
        className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
        랜덤 {count}문제 시작
      </button>
    </div>
  );
}
