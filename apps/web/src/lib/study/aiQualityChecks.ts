import type { AiGeneratedWorkbookDraft } from '@repo/types';

export interface AiQualityIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  questionId?: string;
  field?: string;
}

export interface AiQualityCheckResult {
  issues: AiQualityIssue[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
  qualityScore: number;
  qualityGrade: 'excellent' | 'good' | 'fair' | 'poor';
}

const QUALITY_SCORE_CONFIG = {
  errorPenalty: 15,
  warningPenalty: 5,
  infoPenalty: 1,
  maxScore: 100,
};

function calculateQualityGrade(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

export function checkAiQuality(
  draft: AiGeneratedWorkbookDraft | undefined
): AiQualityCheckResult {
  const issues: AiQualityIssue[] = [];

  if (!draft) {
    issues.push({
      severity: 'error',
      code: 'NO_DRAFT',
      message: '생성된 초안이 없습니다.',
    });
    const errorCount = 1;
    const qualityScore = Math.max(
      0,
      QUALITY_SCORE_CONFIG.maxScore - errorCount * QUALITY_SCORE_CONFIG.errorPenalty
    );
    return {
      issues,
      errorCount,
      warningCount: 0,
      infoCount: 0,
      qualityScore,
      qualityGrade: calculateQualityGrade(qualityScore),
    };
  }

  // Track for duplicate detection
  const questionIds = new Set<string>();
  const prompts = new Map<string, string[]>();
  const answerDistribution = new Map<number, number>();

  if (draft.questions) {
    draft.questions.forEach((question, idx) => {
      const questionRef = `questions[${idx}]`;

      // Error: Missing prompt
      if (!question.prompt || question.prompt.trim().length === 0) {
        issues.push({
          severity: 'error',
          code: 'MISSING_PROMPT',
          message: `문제 #${idx + 1}: 문제 본문이 없습니다.`,
          questionId: question.externalId,
          field: `${questionRef}.prompt`,
        });
      }

      // Error: Missing answer
      if (!question.answer || question.answer.trim().length === 0) {
        issues.push({
          severity: 'error',
          code: 'MISSING_ANSWER',
          message: `문제 #${idx + 1}: 정답이 없습니다.`,
          questionId: question.externalId,
          field: `${questionRef}.answer`,
        });
      }

      // Error: Missing explanation
      if (!question.explanation || question.explanation.trim().length === 0) {
        issues.push({
          severity: 'error',
          code: 'MISSING_EXPLANATION',
          message: `문제 #${idx + 1}: 해설이 없습니다.`,
          questionId: question.externalId,
          field: `${questionRef}.explanation`,
        });
      }

      // Error: Unsupported question type
      const validTypes = [
        'multiple_choice',
        'multiple_choice_single',
        'true_false',
        'ox',
        'short_answer',
        'essay',
        'essay_self_review',
      ];
      if (!validTypes.includes(question.type)) {
        issues.push({
          severity: 'error',
          code: 'UNSUPPORTED_TYPE',
          message: `문제 #${idx + 1}: 지원하지 않는 문제 유형입니다: ${question.type}`,
          questionId: question.externalId,
          field: `${questionRef}.type`,
        });
      }

      // Error: Multiple choice without enough choices
      if (
        (question.type === 'multiple_choice' || question.type === 'multiple_choice_single') &&
        (!question.choices || question.choices.length < 2)
      ) {
        issues.push({
          severity: 'error',
          code: 'INSUFFICIENT_CHOICES',
          message: `문제 #${idx + 1}: 객관식 문제에 선택지가 2개 미만입니다.`,
          questionId: question.externalId,
          field: `${questionRef}.choices`,
        });
      }

      // Error: Answer doesn't match choices
      if (
        (question.type === 'multiple_choice' ||
          question.type === 'multiple_choice_single' ||
          question.type === 'true_false' ||
          question.type === 'ox') &&
        question.choices &&
        question.choices.length > 0
      ) {
        const answerNum = parseInt(question.answer);
        if (!isNaN(answerNum) && (answerNum < 1 || answerNum > question.choices.length)) {
          issues.push({
            severity: 'error',
            code: 'INVALID_ANSWER_INDEX',
            message: `문제 #${idx + 1}: 정답 번호가 선택지 범위를 벗어났습니다. (정답: ${question.answer}, 선택지: ${question.choices.length}개)`,
            questionId: question.externalId,
            field: `${questionRef}.answer`,
          });
        }

        // Track answer distribution
        const answerIdx = answerNum || 0;
        answerDistribution.set(answerIdx, (answerDistribution.get(answerIdx) || 0) + 1);
      }

      // Error: Invalid difficulty
      if (question.difficulty) {
        const validDifficulties = ['상', '중', '하', 'easy', 'medium', 'hard', 'low', 'high'];
        if (!validDifficulties.includes(question.difficulty.toLowerCase())) {
          issues.push({
            severity: 'error',
            code: 'INVALID_DIFFICULTY',
            message: `문제 #${idx + 1}: 유효하지 않은 난이도입니다: ${question.difficulty}`,
            questionId: question.externalId,
            field: `${questionRef}.difficulty`,
          });
        }
      }

      // Error: Duplicate question ID
      if (question.externalId) {
        if (questionIds.has(question.externalId)) {
          issues.push({
            severity: 'error',
            code: 'DUPLICATE_QUESTION_ID',
            message: `문제 #${idx + 1}: 중복된 문제 ID: ${question.externalId}`,
            questionId: question.externalId,
            field: `${questionRef}.externalId`,
          });
        }
        questionIds.add(question.externalId);
      }

      // Warning: Short prompt
      if (question.prompt && question.prompt.trim().length < 10) {
        issues.push({
          severity: 'warning',
          code: 'SHORT_PROMPT',
          message: `문제 #${idx + 1}: 문제 본문이 너무 짧습니다. (${question.prompt.length}자)`,
          questionId: question.externalId,
          field: `${questionRef}.prompt`,
        });
      }

      // Warning: Short explanation
      if (question.explanation && question.explanation.trim().length < 20) {
        issues.push({
          severity: 'warning',
          code: 'SHORT_EXPLANATION',
          message: `문제 #${idx + 1}: 해설이 너무 짧습니다. (${question.explanation.length}자)`,
          questionId: question.externalId,
          field: `${questionRef}.explanation`,
        });
      }

      // Warning: Short choice
      if (question.choices && question.choices.some((c) => c.trim().length < 2)) {
        issues.push({
          severity: 'warning',
          code: 'SHORT_CHOICE',
          message: `문제 #${idx + 1}: 일부 선택지가 너무 짧습니다.`,
          questionId: question.externalId,
          field: `${questionRef}.choices`,
        });
      }

      // Warning: Similar prompts (simple heuristic)
      const promptKey = question.prompt.substring(0, 30).toLowerCase();
      if (!prompts.has(promptKey)) {
        prompts.set(promptKey, []);
      }
      prompts.get(promptKey)!.push(question.externalId);

      // Warning: No concept link
      if (!question.conceptExternalId) {
        issues.push({
          severity: 'warning',
          code: 'NO_CONCEPT_LINK',
          message: `문제 #${idx + 1}: 관련 개념이 연결되지 않았습니다.`,
          questionId: question.externalId,
          field: `${questionRef}.conceptExternalId`,
        });
      }

      // Warning: essay_self_review without rubric
      if (question.type === 'essay_self_review' && !question.explanation?.includes('기준')) {
        issues.push({
          severity: 'warning',
          code: 'NO_ESSAY_RUBRIC',
          message: `문제 #${idx + 1}: 주관식 문제의 채점 기준이 명확하지 않습니다.`,
          questionId: question.externalId,
          field: `${questionRef}.explanation`,
        });
      }

      // Warning: short_answer with single accepted answer
      if (question.type === 'short_answer' && !question.explanation?.includes('|')) {
        issues.push({
          severity: 'info',
          code: 'SINGLE_ANSWER',
          message: `문제 #${idx + 1}: 단답형이 하나의 정답만 수용합니다. (필요시 해설에 대체 정답 추가)`,
          questionId: question.externalId,
          field: `${questionRef}.explanation`,
        });
      }
    });

    // Check for similar prompts (duplicate detection)
    for (const [, ids] of prompts) {
      if (ids.length > 1) {
        issues.push({
          severity: 'warning',
          code: 'SIMILAR_PROMPTS',
          message: `중복된 것으로 의심되는 문제들이 있습니다: ${ids.join(', ')}`,
          field: 'questions',
        });
      }
    }

    // Check answer distribution
    if (answerDistribution.size > 0) {
      const totalChoices = draft.questions.filter((q) =>
        ['multiple_choice', 'multiple_choice_single', 'true_false', 'ox'].includes(q.type)
      ).length;

      const firstChoiceCount = answerDistribution.get(1) || 0;
      if (firstChoiceCount > totalChoices * 0.5) {
        issues.push({
          severity: 'warning',
          code: 'SKEWED_ANSWER_DISTRIBUTION',
          message: `정답이 1번에 과도하게 몰려 있습니다. (${firstChoiceCount}/${totalChoices})`,
          field: 'questions',
        });
      }
    }
  }

  // Check concepts
  const conceptIds = new Set<string>();
  if (draft.concepts) {
    draft.concepts.forEach((concept, idx) => {
      // Error: Duplicate concept ID
      if (concept.externalId) {
        if (conceptIds.has(concept.externalId)) {
          issues.push({
            severity: 'error',
            code: 'DUPLICATE_CONCEPT_ID',
            message: `개념 #${idx + 1}: 중복된 개념 ID: ${concept.externalId}`,
            field: `concepts[${idx}].externalId`,
          });
        }
        conceptIds.add(concept.externalId);
      }
    });
  }

  // Check exam sets
  if (draft.examSets) {
    draft.examSets.forEach((set, idx) => {
      if (set.items) {
        set.items.forEach((item, itemIdx) => {
          if (!questionIds.has(item.externalQuestionId)) {
            issues.push({
              severity: 'error',
              code: 'EXAM_SET_MISSING_QUESTION',
              message: `모의고사 '${set.title}' 문제 #${itemIdx + 1}: 존재하지 않는 문제를 참조합니다. (${item.externalQuestionId})`,
              field: `examSets[${idx}].items[${itemIdx}]`,
            });
          }
        });
      }
    });
  }

  // Calculate quality score
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  const qualityScore = Math.max(
    0,
    QUALITY_SCORE_CONFIG.maxScore -
      errorCount * QUALITY_SCORE_CONFIG.errorPenalty -
      warningCount * QUALITY_SCORE_CONFIG.warningPenalty -
      infoCount * QUALITY_SCORE_CONFIG.infoPenalty
  );

  return {
    issues,
    errorCount,
    warningCount,
    infoCount,
    qualityScore,
    qualityGrade: calculateQualityGrade(qualityScore),
  };
}
