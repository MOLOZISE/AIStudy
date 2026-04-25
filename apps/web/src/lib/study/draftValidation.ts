import type { AiGeneratedWorkbookDraft, StudyQuestionType } from '@repo/types';

export interface DraftValidationError {
  type: 'error' | 'warning';
  field: string;
  message: string;
  details?: string;
}

export interface DraftValidationResult {
  valid: boolean;
  errors: DraftValidationError[];
  stats: {
    totalQuestions: number;
    totalConcepts: number;
    totalSeeds: number;
    validQuestions: number;
  };
}

function normalizeAnswer(answer: string, choices: string[]): string | null {
  if (!answer) return null;

  const clean = answer.trim();

  // Numeric answer 1-6
  const numMatch = clean.match(/^[1-6]$/);
  if (numMatch && choices.length >= parseInt(numMatch[0])) {
    return numMatch[0];
  }

  // Alphabetic A-F / a-f
  const alphaMatch = clean.match(/^[A-Fa-f]$/);
  if (alphaMatch) {
    const idx = alphaMatch[0].toUpperCase().charCodeAt(0) - 65 + 1;
    if (choices.length >= idx) return String(idx);
  }

  // Korean ㄱ-ㄹ
  const korMatch = clean.match(/^[ㄱㄴㄷㄹ]$/);
  if (korMatch) {
    const idx = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'].indexOf(korMatch[0]) + 1;
    if (choices.length >= idx) return String(idx);
  }

  // choice_1 format
  const choiceMatch = clean.toLowerCase().match(/^choice_?([1-6])$/);
  if (choiceMatch) {
    const idx = parseInt(choiceMatch[1]);
    if (choices.length >= idx) return String(idx);
  }

  // Exact choice text match
  const choiceIdx = choices.findIndex((c) => c.trim() === clean);
  if (choiceIdx >= 0) return String(choiceIdx + 1);

  return null;
}

function normalizeDifficulty(difficulty: string | undefined): string | undefined {
  if (!difficulty) return undefined;

  const clean = difficulty.trim().toLowerCase();

  // Already normalized
  if (clean === '상' || clean === '중' || clean === '하') {
    return clean;
  }

  // English → Korean mapping
  const mapping: Record<string, string> = {
    'easy': '중',
    'medium': '중',
    'hard': '상',
    'low': '하',
    'high': '상',
  };

  return mapping[clean];
}

function normalizeQuestionType(type: string | undefined): string | undefined {
  if (!type) return undefined;

  const clean = type.trim().toLowerCase();

  // Map P4 types to P2 parser expectations
  const typeMap: Record<string, string> = {
    'multiple_choice': 'multiple_choice',
    'multiple_choice_single': 'multiple_choice_single',
    'true_false': 'true_false',
    'ox': 'true_false',
    'short_answer': 'short_answer',
    'essay': 'essay_self_review',
    'essay_self_review': 'essay_self_review',
  };

  return typeMap[clean] || type;
}

export function validateAiDraft(draft: AiGeneratedWorkbookDraft | undefined): DraftValidationResult {
  const errors: DraftValidationError[] = [];
  const stats = {
    totalQuestions: 0,
    totalConcepts: 0,
    totalSeeds: 0,
    validQuestions: 0,
  };

  if (!draft) {
    errors.push({
      type: 'error',
      field: 'draft',
      message: '생성된 초안을 찾을 수 없습니다.',
    });
    return { valid: false, errors, stats };
  }

  // Validate workbook
  if (!draft.workbook.title) {
    errors.push({
      type: 'error',
      field: 'workbook.title',
      message: '문제집 제목이 없습니다.',
    });
  }

  // Validate concepts
  const conceptIds = new Set<string>();
  stats.totalConcepts = draft.concepts?.length ?? 0;

  if (draft.concepts) {
    draft.concepts.forEach((concept, idx) => {
      if (!concept.externalId) {
        errors.push({
          type: 'error',
          field: `concepts[${idx}].externalId`,
          message: `개념 #${idx + 1}의 ID가 없습니다.`,
        });
        return;
      }

      if (conceptIds.has(concept.externalId)) {
        errors.push({
          type: 'error',
          field: `concepts[${idx}].externalId`,
          message: `개념 ID '${concept.externalId}'가 중복됩니다.`,
        });
        return;
      }

      conceptIds.add(concept.externalId);

      if (!concept.title) {
        errors.push({
          type: 'error',
          field: `concepts[${idx}].title`,
          message: `개념 #${idx + 1}의 제목이 없습니다.`,
        });
      }
    });
  }

  // Validate seeds
  const seedIds = new Set<string>();
  stats.totalSeeds = draft.seeds?.length ?? 0;

  if (draft.seeds) {
    draft.seeds.forEach((seed, idx) => {
      if (!seed.externalId) {
        errors.push({
          type: 'error',
          field: `seeds[${idx}].externalId`,
          message: `포인트 #${idx + 1}의 ID가 없습니다.`,
        });
        return;
      }

      if (seedIds.has(seed.externalId)) {
        errors.push({
          type: 'error',
          field: `seeds[${idx}].externalId`,
          message: `포인트 ID '${seed.externalId}'가 중복됩니다.`,
        });
        return;
      }

      seedIds.add(seed.externalId);

      // Warn if concept doesn't exist
      if (seed.conceptExternalId && !conceptIds.has(seed.conceptExternalId)) {
        errors.push({
          type: 'warning',
          field: `seeds[${idx}].conceptExternalId`,
          message: `포인트의 관련 개념 '${seed.conceptExternalId}'을(를) 찾을 수 없습니다.`,
        });
      }
    });
  }

  // Validate questions
  const questionIds = new Set<string>();
  stats.totalQuestions = draft.questions?.length ?? 0;

  if (draft.questions) {
    draft.questions.forEach((question, idx) => {
      if (!question.externalId) {
        errors.push({
          type: 'error',
          field: `questions[${idx}].externalId`,
          message: `문제 #${idx + 1}의 ID가 없습니다.`,
        });
        return;
      }

      if (questionIds.has(question.externalId)) {
        errors.push({
          type: 'error',
          field: `questions[${idx}].externalId`,
          message: `문제 ID '${question.externalId}'가 중복됩니다.`,
        });
        return;
      }

      questionIds.add(question.externalId);

      // Validate required fields
      if (!question.prompt) {
        errors.push({
          type: 'error',
          field: `questions[${idx}].prompt`,
          message: `문제 #${idx + 1}의 본문이 없습니다.`,
        });
        return;
      }

      if (!question.answer) {
        errors.push({
          type: 'error',
          field: `questions[${idx}].answer`,
          message: `문제 #${idx + 1}의 정답이 없습니다.`,
        });
        return;
      }

      // Validate question type
      const normalizedType = normalizeQuestionType(question.type);
      if (!normalizedType) {
        errors.push({
          type: 'error',
          field: `questions[${idx}].type`,
          message: `문제 #${idx + 1}의 타입 '${question.type}'은(는) 지원되지 않습니다.`,
        });
        return;
      }

      // Validate answer for multiple choice
      if (normalizedType.includes('multiple_choice') || normalizedType === 'true_false') {
        if (!question.choices || question.choices.length === 0) {
          errors.push({
            type: 'error',
            field: `questions[${idx}].choices`,
            message: `문제 #${idx + 1}은(는) 객관식이므로 선택지가 있어야 합니다.`,
          });
          return;
        }

        const normalizedAnswer = normalizeAnswer(question.answer, question.choices);
        if (!normalizedAnswer) {
          errors.push({
            type: 'error',
            field: `questions[${idx}].answer`,
            message: `문제 #${idx + 1}의 정답 '${question.answer}'을(를) 선택지와 매칭할 수 없습니다. (선택지: ${question.choices.length}개)`,
          });
          return;
        }
      }

      // Validate difficulty
      if (question.difficulty) {
        const normalized = normalizeDifficulty(question.difficulty);
        if (!normalized) {
          errors.push({
            type: 'warning',
            field: `questions[${idx}].difficulty`,
            message: `문제 #${idx + 1}의 난이도 '${question.difficulty}'을(를) 인식할 수 없습니다. (상/중/하 또는 easy/medium/hard)`,
          });
        }
      }

      // Validate concept reference
      if (question.conceptExternalId && !conceptIds.has(question.conceptExternalId)) {
        errors.push({
          type: 'warning',
          field: `questions[${idx}].conceptExternalId`,
          message: `문제 #${idx + 1}의 관련 개념 '${question.conceptExternalId}'을(를) 찾을 수 없습니다.`,
        });
      }

      // Validate seed reference
      if (question.seedExternalId && !seedIds.has(question.seedExternalId)) {
        errors.push({
          type: 'warning',
          field: `questions[${idx}].seedExternalId`,
          message: `문제 #${idx + 1}의 관련 포인트 '${question.seedExternalId}'을(를) 찾을 수 없습니다.`,
        });
      }

      stats.validQuestions++;
    });
  }

  // Validate exam sets
  if (draft.examSets) {
    draft.examSets.forEach((set, idx) => {
      if (!set.externalId || !set.title) {
        errors.push({
          type: 'warning',
          field: `examSets[${idx}]`,
          message: `모의고사 세트 #${idx + 1}의 ID 또는 제목이 없습니다.`,
        });
        return;
      }

      if (set.items) {
        set.items.forEach((item, itemIdx) => {
          if (!questionIds.has(item.externalQuestionId)) {
            errors.push({
              type: 'error',
              field: `examSets[${idx}].items[${itemIdx}]`,
              message: `모의고사 세트 '${set.title}'의 문제 '${item.externalQuestionId}'을(를) 찾을 수 없습니다.`,
            });
          }
        });
      }
    });
  }

  return {
    valid: errors.every((e) => e.type !== 'error'),
    errors,
    stats,
  };
}

export function normalizeDraftForExport(
  draft: AiGeneratedWorkbookDraft,
  selectedQuestionIds?: Set<string>
): AiGeneratedWorkbookDraft {
  // Filter questions if selected
  let filteredQuestions = draft.questions;
  if (selectedQuestionIds && selectedQuestionIds.size > 0) {
    filteredQuestions = draft.questions.filter((q) => selectedQuestionIds.has(q.externalId));
  }

  // Find required concepts/seeds for selected questions
  const requiredConceptIds = new Set<string>();
  const requiredSeedIds = new Set<string>();

  filteredQuestions.forEach((q) => {
    if (q.conceptExternalId) requiredConceptIds.add(q.conceptExternalId);
    if (q.seedExternalId) requiredSeedIds.add(q.seedExternalId);
  });

  return {
    workbook: {
      ...draft.workbook,
      difficulty: normalizeDifficulty(draft.workbook.difficulty) || 'medium',
    },
    concepts: draft.concepts.filter((c) => requiredConceptIds.has(c.externalId) || requiredConceptIds.size === 0),
    seeds: draft.seeds.filter((s) => requiredSeedIds.has(s.externalId) || requiredSeedIds.size === 0),
    questions: filteredQuestions.map((q) => {
      const normalizedType = (normalizeQuestionType(q.type) || 'multiple_choice_single') as StudyQuestionType;
      const normalizedAnswer = normalizeAnswer(q.answer, q.choices) || q.answer;
      return {
        ...q,
        type: normalizedType,
        answer: normalizedAnswer,
        difficulty: normalizeDifficulty(q.difficulty),
      };
    }),
    examSets: (draft.examSets || []).map((set) => ({
      ...set,
      items: set.items.filter((item) => filteredQuestions.some((q) => q.externalId === item.externalQuestionId)),
    })).filter((set) => set.items.length > 0),
  };
}
