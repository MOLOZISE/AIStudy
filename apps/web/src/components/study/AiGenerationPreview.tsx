'use client';

import Link from 'next/link';
import { useState } from 'react';
import { utils, write } from 'xlsx';
import type { AiGeneratedWorkbookDraft } from '@repo/types';

interface AiGenerationPreviewProps {
  job: { id: string };
  preview: {
    status: string;
    progress: number | null;
    payload?: Record<string, unknown>;
    error?: Record<string, unknown>;
  };
}

export function AiGenerationPreview({ preview }: AiGenerationPreviewProps) {
  const [showJson, setShowJson] = useState(false);

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
  const questionCount = draft.questions?.length ?? 0;
  const conceptCount = draft.concepts?.length ?? 0;
  const seedCount = draft.seeds?.length ?? 0;
  const mcCount = draft.questions?.filter(q => q.type === 'multiple_choice_single').length ?? 0;
  const tfCount = draft.questions?.filter(q => q.type === 'true_false').length ?? 0;
  const saCount = draft.questions?.filter(q => q.type === 'short_answer').length ?? 0;
  const essayCount = draft.questions?.filter(q => q.type === 'essay_self_review').length ?? 0;

  function downloadExcel() {
    const workbook = utils.book_new();

    // 1. 문제집정보
    const infoSheet = utils.aoa_to_sheet([
      ['항목', '값'],
      ['문제집명', draft.workbook.title],
      ['설명', draft.workbook.description || ''],
      ['카테고리', draft.workbook.category || ''],
      ['난이도', draft.workbook.difficulty || ''],
      ['총 문항수', questionCount],
      ['생성일', new Date().toLocaleDateString('ko-KR')],
      ['', ''],
      ['주의사항', 'AI 생성 결과는 반드시 검수 후 사용해주세요.'],
    ]);
    utils.book_append_sheet(workbook, infoSheet, '00_문제집정보');

    // 2. 개념마스터
    if (conceptCount > 0 && draft.concepts) {
      const conceptSheet = utils.aoa_to_sheet([
        ['concept_id', 'concept_name', 'parent_concept_id', 'description'],
        ...draft.concepts.map((c) => [
          c.externalId,
          c.title,
          '',
          c.description || '',
        ]),
      ]);
      utils.book_append_sheet(workbook, conceptSheet, '01_개념마스터');
    }

    // 3. 출제포인트표
    if (seedCount > 0 && draft.seeds) {
      const seedSheet = utils.aoa_to_sheet([
        ['point_id', 'concept_id', 'point_name', 'weight'],
        ...draft.seeds.map((s, i) => [
          `p${i + 1}`,
          s.conceptExternalId || '',
          s.title || `포인트 ${i + 1}`,
          '중',
        ]),
      ]);
      utils.book_append_sheet(workbook, seedSheet, '02_출제포인트표');
    }

    // 4. 정식문제은행
    if (questionCount > 0 && draft.questions) {
      const qSheet = utils.aoa_to_sheet([
        ['question_id', 'concept_id', 'question_type', 'prompt', 'choice_1', 'choice_2', 'choice_3', 'choice_4', 'answer', 'explanation', 'difficulty'],
        ...draft.questions.map((q) => {
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
            q.difficulty || 'medium',
          ];
        }),
      ]);
      utils.book_append_sheet(workbook, qSheet, '05_정식문제은행');
    }

    // 5. 모의고사 세트매핑
    if (draft.examSets && draft.examSets.length > 0) {
      const setSheet = utils.aoa_to_sheet([
        ['set_id', 'set_name', 'set_description'],
        ...draft.examSets.map((s) => [
          s.externalId,
          s.title,
          s.description || '',
        ]),
      ]);

      const itemSheet = utils.aoa_to_sheet([
        ['set_id', 'question_id', 'position', 'points'],
        ...draft.examSets.flatMap((s) =>
          s.items.map((item) => [
            s.externalId,
            item.externalQuestionId,
            item.position,
            item.points || '',
          ])
        ),
      ]);

      utils.book_append_sheet(workbook, setSheet, '07_모의고사_세트');
      utils.book_append_sheet(workbook, itemSheet, '07_모의고사_세트매핑');
    }

    // Download
    const fileName = `${draft.workbook.title}_${new Date().toISOString().split('T')[0]}.xlsx`;
    write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
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

      {/* Warning */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs text-amber-900">
          <strong>⚠️ 검수 필요:</strong> 생성된 초안입니다. 정답/해설을 반드시 확인하고 필요시 수정해주세요.
        </p>
      </div>

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
          <p className="text-xs text-slate-500">세트</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{draft.examSets?.length ?? 0}</p>
        </div>
      </div>

      {/* Question Types */}
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
      <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
        <button
          onClick={downloadExcel}
          className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          📥 Excel 다운로드
        </button>

        <Link
          href="/study/library"
          className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors text-center"
        >
          📤 Import하기
        </Link>
      </div>

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
            {JSON.stringify({ workbook: draft.workbook, conceptCount, questionCount }, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
