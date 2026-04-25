'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { utils, write } from 'xlsx';
import { trpc } from '@/lib/trpc';
import { validateAiDraft, normalizeDraftForExport } from '@/lib/study/draftValidation';
import type { AiGeneratedWorkbookDraft, StudyAiGenerationJob } from '@repo/types';

interface AiGenerationPreviewProps {
  job: StudyAiGenerationJob;
  preview: {
    status: string;
    progress: number | null;
    payload?: Record<string, unknown>;
    error?: Record<string, unknown>;
  };
}

export function AiGenerationPreview({ job, preview }: AiGenerationPreviewProps) {
  const router = useRouter();
  const [showJson, setShowJson] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string> | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const createWorkbook = trpc.study.createWorkbookFromAiDraft.useMutation({
    onSuccess: (result) => {
      router.push(`/study/workbooks/${result.workbookId}/editor`);
    },
    onError: (error) => {
      setApplyError(error.message);
      setIsApplying(false);
    },
  });

  if (preview.status === 'pending' || preview.status === 'extracting' || preview.status === 'generating') {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
        <p className="text-sm font-semibold text-slate-700">처리 중...</p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>진행률</span>
            <span>{preview.progress ?? 0}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${preview.progress ?? 0}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">페이지를 새로고침하면 최신 상태를 확인할 수 있습니다.</p>
      </div>
    );
  }

  if (preview.status === 'failed') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 space-y-3">
        <p className="font-semibold text-red-900">생성 실패</p>
        {preview.error && (
          <div className="text-sm text-red-700">
            <p><strong>오류:</strong> {String(preview.error.error)}</p>
            <p className="text-xs mt-1">{String(preview.error.message)}</p>
          </div>
        )}
        <p className="text-xs text-red-700">
          다시 시도하거나 <Link href="/study/templates" className="underline">템플릿</Link>에서 수동으로 진행해주세요.
        </p>
      </div>
    );
  }

  const draftData = preview.payload?.draft as AiGeneratedWorkbookDraft | undefined;

  if (!draftData) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-900">생성 결과를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const draft = draftData;
  const validation = validateAiDraft(draft);
  const allQuestionIds = draft.questions?.map(q => q.externalId) ?? [];
  const selected = selectedQuestionIds ?? new Set(allQuestionIds);
  const selectedCount = Array.from(selected).filter(id => selected.has(id)).length;

  const questionCount = draft.questions?.length ?? 0;
  const conceptCount = draft.concepts?.length ?? 0;
  const seedCount = draft.seeds?.length ?? 0;
  const mcCount = draft.questions?.filter(q => q.type === 'multiple_choice_single').length ?? 0;
  const tfCount = draft.questions?.filter(q => q.type === 'true_false').length ?? 0;
  const saCount = draft.questions?.filter(q => q.type === 'short_answer').length ?? 0;
  const essayCount = draft.questions?.filter(q => q.type === 'essay_self_review').length ?? 0;

  function toggleQuestion(id: string) {
    const updated = new Set(selected);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedQuestionIds(updated);
  }

  function selectAll() {
    setSelectedQuestionIds(new Set(allQuestionIds));
  }

  function deselectAll() {
    setSelectedQuestionIds(new Set());
  }

  function downloadExcel() {
    const normalizedDraft = normalizeDraftForExport(draft, selectedCount > 0 ? selected : undefined);
    const workbook = utils.book_new();

    // 00_문제집정보
    const infoSheet = utils.aoa_to_sheet([
      ['항목', '값'],
      ['문제집명', normalizedDraft.workbook.title],
      ['설명', normalizedDraft.workbook.description || ''],
      ['카테고리', normalizedDraft.workbook.category || ''],
      ['난이도', normalizedDraft.workbook.difficulty || ''],
      ['총 문항수', normalizedDraft.questions.length],
      ['생성일', new Date().toLocaleDateString('ko-KR')],
    ]);
    utils.book_append_sheet(workbook, infoSheet, '00_문제집정보');

    // 01_개념마스터
    if (normalizedDraft.concepts.length > 0) {
      const conceptSheet = utils.aoa_to_sheet([
        ['concept_id', 'concept_name', 'parent_concept_id', 'description'],
        ...normalizedDraft.concepts.map((c) => [
          c.externalId,
          c.title,
          '',
          c.description || '',
        ]),
      ]);
      utils.book_append_sheet(workbook, conceptSheet, '01_개념마스터');
    }

    // 02_출제포인트표
    if (normalizedDraft.seeds.length > 0) {
      const seedSheet = utils.aoa_to_sheet([
        ['point_id', 'concept_id', 'point_name', 'weight'],
        ...normalizedDraft.seeds.map((s, i) => [
          `p${i + 1}`,
          s.conceptExternalId || '',
          s.title || `포인트 ${i + 1}`,
          '중',
        ]),
      ]);
      utils.book_append_sheet(workbook, seedSheet, '02_출제포인트표');
    }

    // 05_정식문제은행
    if (normalizedDraft.questions.length > 0) {
      const qSheet = utils.aoa_to_sheet([
        ['question_id', 'concept_id', 'question_type', 'prompt', 'choice_1', 'choice_2', 'choice_3', 'choice_4', 'answer', 'explanation', 'difficulty'],
        ...normalizedDraft.questions.map((q) => {
          const choices = [...q.choices, '', '', ''].slice(0, 4);
          return [
            q.externalId,
            q.conceptExternalId || '',
            q.type,
            q.prompt,
            choices[0] || '',
            choices[1] || '',
            choices[2] || '',
            choices[3] || '',
            q.answer,
            q.explanation || '',
            q.difficulty || '중',
          ];
        }),
      ]);
      utils.book_append_sheet(workbook, qSheet, '05_정식문제은행');
    }

    const fileName = `${normalizedDraft.workbook.title}_${new Date().toISOString().split('T')[0]}.xlsx`;
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDirectApply() {
    setApplyError(null);
    setIsApplying(true);

    try {
      await createWorkbook.mutateAsync({
        jobId: job.id,
        selectedQuestionIds: selectedCount > 0 ? Array.from(selected) : undefined,
        title: draft.workbook.title,
        description: draft.workbook.description,
      });
    } catch (error: any) {
      setApplyError(error.message);
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900">{draft.workbook.title}</h3>
        {draft.workbook.description && (
          <p className="text-sm text-slate-600 mt-1">{draft.workbook.description}</p>
        )}
      </div>

      {/* Applied Status */}
      {job.appliedWorkbookId && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-900">
            <strong>✓ 저장됨:</strong> 이미 문제은행으로 저장되었습니다.
          </p>
          <Link
            href={`/study/workbooks/${job.appliedWorkbookId}`}
            className="text-sm text-emerald-700 underline mt-2 inline-block"
          >
            저장된 문제집 보기 →
          </Link>
        </div>
      )}

      {/* Warning */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs text-amber-900">
          <strong>⚠️ 검수 필요:</strong> AI가 생성한 초안입니다. 정답/해설을 반드시 확인하고 필요시 수정해주세요.
        </p>
      </div>

      {/* Validation Errors */}
      {validation.errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
          <p className="text-sm font-semibold text-red-900">검증 오류</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {validation.errors.map((err, idx) => (
              <div key={idx} className={`text-xs ${err.type === 'error' ? 'text-red-700' : 'text-amber-700'}`}>
                <strong>{err.field}:</strong> {err.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
          <p className="text-xs text-slate-500">총 문항</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{questionCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
          <p className="text-xs text-slate-500">개념</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{conceptCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
          <p className="text-xs text-slate-500">포인트</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{seedCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
          <p className="text-xs text-slate-500">선택된</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{selectedCount}/{questionCount}</p>
        </div>
      </div>

      {/* Question Type Distribution */}
      {questionCount > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">문제 유형 분포</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            {mcCount > 0 && <p>객관식: {mcCount}개</p>}
            {tfCount > 0 && <p>참/거짓: {tfCount}개</p>}
            {saCount > 0 && <p>단답형: {saCount}개</p>}
            {essayCount > 0 && <p>주관식: {essayCount}개</p>}
          </div>
        </div>
      )}

      {/* Question Selection */}
      {questionCount > 0 && !job.appliedWorkbookId && (
        <div className="space-y-3 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">포함할 문제 선택</p>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                전체 선택
              </button>
              <button
                onClick={deselectAll}
                className="text-xs text-slate-600 hover:text-slate-700 font-semibold"
              >
                전체 해제
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50">
            {draft.questions?.map((q, idx) => (
              <label
                key={q.externalId}
                className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer hover:bg-white p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.has(q.externalId)}
                  onChange={() => toggleQuestion(q.externalId)}
                  className="mt-1"
                />
                <span className="min-w-0 flex-1">
                  <strong>#{idx + 1}</strong> {q.prompt.substring(0, 60)}...
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Sample Questions */}
      {questionCount > 0 && draft.questions && (
        <div className="space-y-3 border-t border-slate-200 pt-4">
          <p className="text-sm font-semibold text-slate-700">샘플 문제 (처음 3개)</p>
          <div className="space-y-3">
            {draft.questions.slice(0, 3).map((q, idx) => (
              <div key={q.externalId} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-600 mb-1">
                  {idx + 1}. {q.type === 'multiple_choice_single' && '객관식'}
                  {q.type === 'true_false' && '참/거짓'}
                  {q.type === 'short_answer' && '단답형'}
                  {q.type === 'essay_self_review' && '주관식'}
                  {q.difficulty && ` (${q.difficulty})`}
                </p>
                <p className="text-sm text-slate-900 font-medium mb-2">{q.prompt.substring(0, 100)}...</p>
                {q.choices.length > 0 && (
                  <p className="text-xs text-slate-600 mb-1">선지: {q.choices.length}개</p>
                )}
                <p className="text-xs text-slate-600">정답: {q.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {!job.appliedWorkbookId && (
        <div>
          {applyError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {applyError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
            <button
              onClick={downloadExcel}
              disabled={validation.errors.some(e => e.type === 'error')}
              className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
            >
              📥 Excel 다운로드
            </button>

            <button
              onClick={handleDirectApply}
              disabled={isApplying || validation.errors.some(e => e.type === 'error') || selectedCount === 0}
              className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300 transition-colors"
            >
              {isApplying ? '저장 중...' : '📚 저장하기'}
            </button>
          </div>
        </div>
      )}

      {/* JSON Toggle */}
      <div className="border-t border-slate-200 pt-4 space-y-2">
        <button
          onClick={() => setShowJson(!showJson)}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
        >
          {showJson ? '▼ JSON 숨기기' : '▶ JSON 보기'}
        </button>

        {showJson && (
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100 max-h-64 overflow-y-auto">
            {JSON.stringify({ workbook: draft.workbook, stats: validation.stats }, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
