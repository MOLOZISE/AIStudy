import { and, eq, inArray, sql } from 'drizzle-orm';
import {
  db,
  studyConcepts,
  studyExamSetItems,
  studyExamSets,
  studyImportJobs,
  studyQuestions,
  studySeeds,
  studyWorkbooks,
} from '@repo/db';
import { parseStudyWorkbook, type StudyImportRowError } from './parseWorkbook';

export interface ImportStudyWorkbookInput {
  workbookId: string;
  subjectId: string | null;
  requestedBy: string;
  sourceHash: string;
  buffer: Buffer;
}

export interface ImportStudyWorkbookResult {
  workbookId: string;
  jobId: string;
  status: 'completed' | 'failed';
  totalRows: number;
  importedRows: number;
  failedRows: number;
  summary: {
    concepts: number;
    seeds: number;
    questions: number;
    examSets: number;
    examSetItems: number;
  };
  errors: StudyImportRowError[];
}

function toStringPoint(value?: string): string {
  if (!value) return '1';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : '1';
}

async function conceptIdMap(workbookId: string): Promise<Map<string, string>> {
  const rows = await db
    .select({ id: studyConcepts.id, externalId: studyConcepts.externalId })
    .from(studyConcepts)
    .where(eq(studyConcepts.workbookId, workbookId));

  return new Map(rows.map((row) => [row.externalId, row.id]));
}

async function seedIdMap(workbookId: string): Promise<Map<string, string>> {
  const rows = await db
    .select({ id: studySeeds.id, externalId: studySeeds.externalId })
    .from(studySeeds)
    .where(eq(studySeeds.workbookId, workbookId));

  return new Map(rows.map((row) => [row.externalId, row.id]));
}

async function questionIdMap(workbookId: string): Promise<Map<string, string>> {
  const rows = await db
    .select({ id: studyQuestions.id, externalId: studyQuestions.externalId })
    .from(studyQuestions)
    .where(eq(studyQuestions.workbookId, workbookId));

  return new Map(rows.map((row) => [row.externalId, row.id]));
}

export async function importStudyWorkbook(input: ImportStudyWorkbookInput): Promise<ImportStudyWorkbookResult> {
  const [job] = await db
    .insert(studyImportJobs)
    .values({
      workbookId: input.workbookId,
      requestedBy: input.requestedBy,
      status: 'running',
      sourceHash: input.sourceHash,
      startedAt: new Date(),
    })
    .returning({ id: studyImportJobs.id });

  try {
    const parsed = await parseStudyWorkbook(input.buffer);
    const totalRows = parsed.concepts.length + parsed.seeds.length + parsed.questions.length + parsed.examSets.length;

    if (parsed.concepts.length > 0) {
      await db
        .insert(studyConcepts)
        .values(
          parsed.concepts.map((concept) => ({
            workbookId: input.workbookId,
            subjectId: input.subjectId,
            externalId: concept.externalId,
            parentExternalId: concept.parentExternalId,
            title: concept.title,
            description: concept.description,
            orderIndex: concept.orderIndex,
            metadata: { raw: concept.raw },
            updatedAt: new Date(),
          }))
        )
        .onConflictDoUpdate({
          target: [studyConcepts.workbookId, studyConcepts.externalId],
          set: {
            subjectId: sql`excluded.subject_id`,
            parentExternalId: sql`excluded.parent_external_id`,
            title: sql`excluded.title`,
            description: sql`excluded.description`,
            orderIndex: sql`excluded.order_index`,
            metadata: sql`excluded.metadata`,
            updatedAt: new Date(),
          },
        });
    }

    const concepts = await conceptIdMap(input.workbookId);
    for (const concept of parsed.concepts) {
      if (!concept.parentExternalId) continue;
      const parentId = concepts.get(concept.parentExternalId);
      const childId = concepts.get(concept.externalId);
      if (parentId && childId) {
        await db.update(studyConcepts).set({ parentId, updatedAt: new Date() }).where(eq(studyConcepts.id, childId));
      }
    }

    if (parsed.seeds.length > 0) {
      await db
        .insert(studySeeds)
        .values(
          parsed.seeds.map((seed) => ({
            workbookId: input.workbookId,
            subjectId: input.subjectId,
            conceptId: seed.conceptExternalId ? concepts.get(seed.conceptExternalId) : undefined,
            externalId: seed.externalId,
            title: seed.title,
            content: seed.content,
            metadata: { raw: seed.raw },
            updatedAt: new Date(),
          }))
        )
        .onConflictDoUpdate({
          target: [studySeeds.workbookId, studySeeds.externalId],
          set: {
            subjectId: sql`excluded.subject_id`,
            conceptId: sql`excluded.concept_id`,
            title: sql`excluded.title`,
            content: sql`excluded.content`,
            metadata: sql`excluded.metadata`,
            updatedAt: new Date(),
          },
        });
    }

    const seeds = await seedIdMap(input.workbookId);

    if (parsed.questions.length > 0) {
      await db
        .insert(studyQuestions)
        .values(
          parsed.questions.map((question) => ({
            workbookId: input.workbookId,
            subjectId: input.subjectId,
            conceptId: question.conceptExternalId ? concepts.get(question.conceptExternalId) : undefined,
            seedId: question.seedExternalId ? seeds.get(question.seedExternalId) : undefined,
            externalId: question.externalId,
            questionNo: question.questionNo,
            type: question.type,
            prompt: question.prompt,
            choices: question.choices,
            answer: question.answer,
            explanation: question.explanation,
            difficulty: question.difficulty,
            sourceSheet: '05_정식문제은행',
            reviewStatus: 'approved',
            isActive: true,
            isHidden: false,
            rowHash: question.rowHash,
            raw: question.raw,
            updatedAt: new Date(),
          }))
        )
        .onConflictDoUpdate({
          target: [studyQuestions.workbookId, studyQuestions.externalId],
          set: {
            subjectId: sql`excluded.subject_id`,
            conceptId: sql`excluded.concept_id`,
            seedId: sql`excluded.seed_id`,
            questionNo: sql`excluded.question_no`,
            type: sql`excluded.type`,
            prompt: sql`excluded.prompt`,
            choices: sql`excluded.choices`,
            answer: sql`excluded.answer`,
            explanation: sql`excluded.explanation`,
            difficulty: sql`excluded.difficulty`,
            sourceSheet: sql`excluded.source_sheet`,
            reviewStatus: sql`excluded.review_status`,
            isActive: sql`excluded.is_active`,
            isHidden: sql`excluded.is_hidden`,
            rowHash: sql`excluded.row_hash`,
            raw: sql`excluded.raw`,
            updatedAt: new Date(),
          },
        });
    }

    const questions = await questionIdMap(input.workbookId);
    let examSetItems = 0;

    if (parsed.examSets.length > 0) {
      await db
        .insert(studyExamSets)
        .values(
          parsed.examSets.map((set) => ({
            workbookId: input.workbookId,
            subjectId: input.subjectId,
            externalId: set.externalId,
            title: set.title,
            description: set.description,
            totalQuestions: set.items.length,
            metadata: {},
            updatedAt: new Date(),
          }))
        )
        .onConflictDoUpdate({
          target: [studyExamSets.workbookId, studyExamSets.externalId],
          set: {
            subjectId: sql`excluded.subject_id`,
            title: sql`excluded.title`,
            description: sql`excluded.description`,
            totalQuestions: sql`excluded.total_questions`,
            metadata: sql`excluded.metadata`,
            updatedAt: new Date(),
          },
        });

      const setRows = await db
        .select({ id: studyExamSets.id, externalId: studyExamSets.externalId })
        .from(studyExamSets)
        .where(eq(studyExamSets.workbookId, input.workbookId));
      const sets = new Map(setRows.map((row) => [row.externalId, row.id]));

      const itemValues = parsed.examSets.flatMap((set) => {
        const setId = sets.get(set.externalId);
        if (!setId) return [];
        return set.items.flatMap((item) => {
          const questionId = questions.get(item.questionExternalId);
          if (!questionId) return [];
          return [{
            setId,
            questionId,
            position: item.position,
            points: toStringPoint(item.points),
            metadata: { raw: item.raw },
          }];
        });
      });

      examSetItems = itemValues.length;
      if (itemValues.length > 0) {
        await db
          .insert(studyExamSetItems)
          .values(itemValues)
          .onConflictDoUpdate({
            target: [studyExamSetItems.setId, studyExamSetItems.position],
            set: {
              questionId: sql`excluded.question_id`,
              points: sql`excluded.points`,
              metadata: sql`excluded.metadata`,
            },
          });
      }
    }

    const importedRows = parsed.concepts.length + parsed.seeds.length + parsed.questions.length + parsed.examSets.length + examSetItems;
    const jobErrors = parsed.errors.map((error) => ({ ...error }));
    const result: ImportStudyWorkbookResult = {
      workbookId: input.workbookId,
      jobId: job.id,
      status: 'completed',
      totalRows,
      importedRows,
      failedRows: parsed.errors.length,
      summary: {
        concepts: parsed.concepts.length,
        seeds: parsed.seeds.length,
        questions: parsed.questions.length,
        examSets: parsed.examSets.length,
        examSetItems,
      },
      errors: parsed.errors,
    };

    await db
      .update(studyImportJobs)
      .set({
        status: 'completed',
        totalRows,
        importedRows,
        failedRows: parsed.errors.length,
        errors: jobErrors,
        metadata: { sheetNames: parsed.sheetNames, summary: result.summary },
        completedAt: new Date(),
      })
      .where(eq(studyImportJobs.id, job.id));

    await db
      .update(studyWorkbooks)
      .set({ status: 'imported', metadata: { sheetNames: parsed.sheetNames, summary: result.summary }, updatedAt: new Date() })
      .where(eq(studyWorkbooks.id, input.workbookId));

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 import 오류가 발생했습니다.';
    const errors: StudyImportRowError[] = [{ sheet: 'workbook', row: 0, message }];
    const jobErrors = errors.map((rowError) => ({ ...rowError }));
    await db
      .update(studyImportJobs)
      .set({ status: 'failed', failedRows: 1, errors: jobErrors, metadata: { message }, completedAt: new Date() })
      .where(eq(studyImportJobs.id, job.id));
    await db.update(studyWorkbooks).set({ status: 'failed', updatedAt: new Date() }).where(eq(studyWorkbooks.id, input.workbookId));
    throw error;
  }
}

export async function getWorkbookQuestionIds(workbookId: string, questionIds: string[]) {
  if (questionIds.length === 0) return new Map<string, string>();
  const rows = await db
    .select({ id: studyQuestions.id, externalId: studyQuestions.externalId })
    .from(studyQuestions)
    .where(and(eq(studyQuestions.workbookId, workbookId), inArray(studyQuestions.externalId, questionIds)));

  return new Map(rows.map((row) => [row.externalId, row.id]));
}
