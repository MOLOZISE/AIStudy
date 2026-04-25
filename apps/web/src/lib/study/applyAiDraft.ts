'use server';

import { randomUUID } from 'node:crypto';
import { db, studyConcepts, studyExamSetItems, studyExamSets, studyQuestions, studySeeds, studyWorkbooks, studyAiGenerationJobs } from '@repo/db';
import { eq } from 'drizzle-orm';
import type { AiGeneratedWorkbookDraft } from '@repo/types';
import { normalizeDraftForExport } from './draftValidation';

export interface ApplyAiDraftInput {
  jobId: string;
  userId: string;
  selectedQuestionIds?: string[];
  title?: string;
  description?: string;
}

export async function applyAiDraft(input: ApplyAiDraftInput) {
  // Verify job and get draft
  const job = await db.query.studyAiGenerationJobs.findFirst({
    where: eq(studyAiGenerationJobs.id, input.jobId),
  });

  if (!job) {
    throw new Error('AI generation job을 찾을 수 없습니다.');
  }

  if (job.userId !== input.userId) {
    throw new Error('AI generation job 접근 권한이 없습니다.');
  }

  if (job.status !== 'ready') {
    throw new Error('생성이 완료되지 않은 작업입니다.');
  }

  if (job.appliedWorkbookId) {
    throw new Error('이미 문제은행으로 저장된 작업입니다.');
  }

  const draft = job.resultPayload?.draft as AiGeneratedWorkbookDraft | undefined;
  if (!draft) {
    throw new Error('생성된 초안을 찾을 수 없습니다.');
  }

  // Normalize draft with selected questions
  const selectedIds = input.selectedQuestionIds ? new Set(input.selectedQuestionIds) : undefined;
  const normalizedDraft = normalizeDraftForExport(draft, selectedIds);

  // Create workbook
  const workbookId = randomUUID();
  const [workbook] = await db
    .insert(studyWorkbooks)
    .values({
      id: workbookId,
      uploadedBy: input.userId,
      originalFilename: input.title || normalizedDraft.workbook.title,
      storageBucket: 'study-workbooks',
      storagePath: `ai-draft/${input.userId}/${workbookId}`,
      status: 'uploaded',
      metadata: {
        aiGenerated: true,
        aiJobId: input.jobId,
        needsReview: true,
        description: input.description || normalizedDraft.workbook.description,
      },
    })
    .returning();

  if (!workbook) {
    throw new Error('문제은행 생성에 실패했습니다.');
  }

  // Create concepts
  const conceptIdMap = new Map<string, string>();
  if (normalizedDraft.concepts.length > 0) {
    const concepts = await db
      .insert(studyConcepts)
      .values(
        normalizedDraft.concepts.map((c) => ({
          workbookId,
          externalId: c.externalId,
          title: c.title,
          description: c.description,
          orderIndex: c.orderIndex,
          metadata: { aiGenerated: true },
        }))
      )
      .returning({ id: studyConcepts.id, externalId: studyConcepts.externalId });

    concepts.forEach((c) => conceptIdMap.set(c.externalId, c.id));
  }

  // Create seeds
  const seedIdMap = new Map<string, string>();
  if (normalizedDraft.seeds.length > 0) {
    const seeds = await db
      .insert(studySeeds)
      .values(
        normalizedDraft.seeds.map((s) => ({
          workbookId,
          conceptId: s.conceptExternalId ? conceptIdMap.get(s.conceptExternalId) : undefined,
          externalId: s.externalId,
          title: s.title,
          content: s.content,
          metadata: { aiGenerated: true },
        }))
      )
      .returning({ id: studySeeds.id, externalId: studySeeds.externalId });

    seeds.forEach((s) => seedIdMap.set(s.externalId, s.id));
  }

  // Create questions
  const questionIdMap = new Map<string, string>();
  if (normalizedDraft.questions.length > 0) {
    const questions = await db
      .insert(studyQuestions)
      .values(
        normalizedDraft.questions.map((q) => ({
          workbookId,
          conceptId: q.conceptExternalId ? conceptIdMap.get(q.conceptExternalId) : undefined,
          seedId: q.seedExternalId ? seedIdMap.get(q.seedExternalId) : undefined,
          externalId: q.externalId,
          questionNo: q.questionNo,
          type: q.type as any,
          prompt: q.prompt,
          choices: q.choices,
          answer: q.answer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          sourceSheet: '05_정식문제은행',
          reviewStatus: 'draft',
          isActive: true,
          isHidden: false,
          raw: q as any,
          metadata: { aiGenerated: true, needsReview: true },
        }))
      )
      .returning({ id: studyQuestions.id, externalId: studyQuestions.externalId });

    questions.forEach((q) => questionIdMap.set(q.externalId, q.id));
  }

  // Create exam sets and items
  if (normalizedDraft.examSets && normalizedDraft.examSets.length > 0) {
    for (const set of normalizedDraft.examSets) {
      const [examSet] = await db
        .insert(studyExamSets)
        .values({
          workbookId,
          externalId: set.externalId,
          title: set.title,
          description: set.description,
          totalQuestions: set.items.length,
          metadata: { aiGenerated: true },
        })
        .returning({ id: studyExamSets.id });

      if (examSet && set.items.length > 0) {
        await db
          .insert(studyExamSetItems)
          .values(
            set.items.map((item) => ({
              setId: examSet.id,
              questionId: questionIdMap.get(item.externalQuestionId) || 'unknown',
              position: item.position,
              points: item.points || '1',
              metadata: {},
            }))
          );
      }
    }
  }

  // Update job with applied workbook ID
  await db
    .update(studyAiGenerationJobs)
    .set({
      appliedWorkbookId: workbookId,
      appliedAt: new Date(),
    })
    .where(eq(studyAiGenerationJobs.id, input.jobId));

  return {
    workbookId,
    conceptCount: conceptIdMap.size,
    seedCount: seedIdMap.size,
    questionCount: questionIdMap.size,
  };
}
