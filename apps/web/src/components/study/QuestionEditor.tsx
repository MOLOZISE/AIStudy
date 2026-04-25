'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

interface QuestionEditorProps {
  questionId: string;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export function QuestionEditor({ questionId, onClose, onSaveSuccess }: QuestionEditorProps) {
  const question = trpc.study.getQuestion.useQuery({ questionId });
  const updateQuestion = trpc.study.updateQuestion.useMutation();
  const hideQuestion = trpc.study.hideQuestion.useMutation();
  const updateReviewStatus = trpc.study.updateQuestionReviewStatus.useMutation();

  const [isSaving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [prompt, setPrompt] = useState(question.data?.prompt ?? '');
  const [type, setType] = useState(question.data?.type ?? 'multiple_choice');
  const [choices, setChoices] = useState<string[]>(question.data?.choices ?? ['', '', '', '']);
  const [answer, setAnswer] = useState(question.data?.answer ?? '');
  const [explanation, setExplanation] = useState(question.data?.explanation ?? '');
  const [difficulty, setDifficulty] = useState((question.data?.difficulty ?? '중') as '상' | '중' | '하');

  // Update form when question loads
  if (question.data && prompt === '') {
    setPrompt(question.data.prompt);
    setType(question.data.type);
    setChoices(question.data.choices ?? ['', '', '', '']);
    setAnswer(question.data.answer);
    setExplanation(question.data.explanation ?? '');
    setDifficulty((question.data.difficulty ?? '중') as '상' | '중' | '하');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!prompt.trim()) {
      setErrorMessage('문제 본문을 입력하세요.');
      return;
    }

    if (!answer.trim()) {
      setErrorMessage('정답을 입력하세요.');
      return;
    }

    if (type === 'multiple_choice') {
      const filledChoices = choices.filter((c) => c.trim());
      if (filledChoices.length < 2) {
        setErrorMessage('선택지를 최소 2개 이상 입력하세요.');
        return;
      }
    }

    setSaving(true);

    try {
      await updateQuestion.mutateAsync({
        questionId,
        prompt: prompt.trim(),
        type,
        choices: choices.map((c) => c.trim()).filter((c) => c),
        answer: answer.trim(),
        explanation: explanation.trim() || undefined,
        difficulty,
      });

      setSuccessMessage('저장되었습니다.');
      setTimeout(() => {
        onSaveSuccess();
      }, 800);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleHide() {
    setSaving(true);
    try {
      await hideQuestion.mutateAsync({ questionId, hidden: true });
      setSuccessMessage('문제가 숨겨졌습니다.');
      setTimeout(() => {
        onSaveSuccess();
      }, 800);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleReviewStatusChange(status: 'approved' | 'needs_fix' | 'rejected' | 'draft') {
    setSaving(true);
    try {
      await updateReviewStatus.mutateAsync({ questionId, status });
      setSuccessMessage(`상태가 변경되었습니다. (${status})`);
      setTimeout(() => {
        onSaveSuccess();
      }, 800);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '상태 변경 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  if (question.isLoading) {
    return <div className="text-sm text-slate-500">로딩 중...</div>;
  }

  if (question.error || !question.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {question.error?.message ?? '문제를 찾을 수 없습니다.'}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">문제 편집</h2>
        {question.data && (
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
            question.data.reviewStatus === 'approved'
              ? 'bg-emerald-100 text-emerald-700'
              : question.data.reviewStatus === 'needs_fix'
                ? 'bg-amber-100 text-amber-700'
                : question.data.reviewStatus === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-slate-100 text-slate-700'
          }`}>
            {question.data.reviewStatus === 'approved' && '✓ 승인됨'}
            {question.data.reviewStatus === 'needs_fix' && '⚠️ 검토 필요'}
            {question.data.reviewStatus === 'rejected' && '✗ 반려됨'}
            {question.data.reviewStatus === 'draft' && '📝 검수 중'}
          </span>
        )}
      </div>

      {/* Error/Success Messages */}
      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">{successMessage}</div>
      )}

      {/* Question Type */}
      <div>
        <label className="text-xs font-semibold text-slate-700">문제 유형</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="multiple_choice_single">객관식 (단일 선택)</option>
          <option value="true_false">OX 문제</option>
          <option value="short_answer">단답형</option>
          <option value="essay_self_review">주관식 (자기평가)</option>
        </select>
      </div>

      {/* Prompt */}
      <div>
        <label className="text-xs font-semibold text-slate-700">문제 본문 *</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          rows={4}
        />
      </div>

      {/* Choices */}
      {type === 'multiple_choice' && (
        <div>
          <label className="text-xs font-semibold text-slate-700">선택지</label>
          <div className="mt-2 space-y-2">
            {choices.map((choice, idx) => (
              <input
                key={idx}
                type="text"
                value={choice}
                onChange={(e) => {
                  const newChoices = [...choices];
                  newChoices[idx] = e.target.value;
                  setChoices(newChoices);
                }}
                placeholder={`선택지 ${idx + 1}`}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            ))}
          </div>
        </div>
      )}

      {/* Answer */}
      <div>
        <label className="text-xs font-semibold text-slate-700">정답 *</label>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="예: 1, 2, 3 또는 정답 텍스트"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Explanation */}
      <div>
        <label className="text-xs font-semibold text-slate-700">해설</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          rows={3}
        />
      </div>

      {/* Difficulty */}
      <div>
        <label className="text-xs font-semibold text-slate-700">난이도</label>
        <div className="mt-2 flex gap-2">
          {(['상', '중', '하'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                difficulty === level
                  ? level === '상'
                    ? 'bg-red-100 text-red-700'
                    : level === '중'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  : 'border border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Review Status Actions */}
      {question.data && question.data.reviewStatus === 'draft' && (
        <div className="border-t border-slate-200 pt-4">
          <p className="mb-2 text-xs font-semibold text-slate-700">검수 상태</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleReviewStatusChange('approved')}
              disabled={isSaving}
              className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300 hover:bg-emerald-700"
            >
              ✓ 승인
            </button>
            <button
              type="button"
              onClick={() => handleReviewStatusChange('needs_fix')}
              disabled={isSaving}
              className="rounded-md bg-amber-600 px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300 hover:bg-amber-700"
            >
              ⚠️ 수정필요
            </button>
            <button
              type="button"
              onClick={() => handleReviewStatusChange('rejected')}
              disabled={isSaving}
              className="rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300 hover:bg-red-700"
            >
              ✗ 반려
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 border-t border-slate-200 pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 hover:bg-blue-700"
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
        <button
          type="button"
          onClick={handleHide}
          disabled={isSaving}
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-red-100"
        >
          숨김
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
        >
          닫기
        </button>
      </div>
    </form>
  );
}
