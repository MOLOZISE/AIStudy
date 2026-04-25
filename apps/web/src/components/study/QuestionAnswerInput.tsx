'use client';

import { normalizeQuestionType } from '@/lib/study/questionTypeUtils';

interface Props {
  type: string | null | undefined;
  choices: string[];
  selectedAnswer: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function QuestionAnswerInput({ type, choices, selectedAnswer, onChange, disabled }: Props) {
  const normalizedType = normalizeQuestionType(type);

  if (normalizedType === 'multiple_choice_single') {
    return (
      <div className="space-y-2">
        {choices.map((choice, index) => (
          <button
            key={`${choice}-${index}`}
            type="button"
            onClick={() => onChange(choice)}
            disabled={disabled}
            className={`w-full rounded-lg border p-4 text-left text-sm leading-6 ${
              selectedAnswer === choice ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-800'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {choice}
          </button>
        ))}
      </div>
    );
  }

  if (normalizedType === 'true_false') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('O')}
          disabled={disabled}
          className={`rounded-lg border p-6 text-center text-2xl font-bold ${
            selectedAnswer === 'O'
              ? 'border-blue-600 bg-blue-50 text-blue-600'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          O
        </button>
        <button
          type="button"
          onClick={() => onChange('X')}
          disabled={disabled}
          className={`rounded-lg border p-6 text-center text-2xl font-bold ${
            selectedAnswer === 'X'
              ? 'border-blue-600 bg-blue-50 text-blue-600'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          X
        </button>
      </div>
    );
  }

  if (normalizedType === 'short_answer') {
    return (
      <input
        type="text"
        value={selectedAnswer}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="정답을 입력하세요."
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
    );
  }

  // essay_self_review
  return (
    <textarea
      value={selectedAnswer}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      rows={5}
      placeholder="자신의 답변을 입력하세요."
      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
    />
  );
}
