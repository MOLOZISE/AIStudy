import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import {
  db,
  studyAttempts,
  studyExamSetItems,
  studyExamSets,
  studyImportJobs,
  studyQuestions,
  studySubjects,
  studyWorkbooks,
  studyWrongNotes,
} from '@repo/db';
import { protectedProcedure, router } from '../../trpc.js';

function normalizeAnswer(value: string): string {
  return value.trim().replace(/\s+/g, '').toLowerCase();
}

async function createWrongNote(input: {
  userId: string;
  workbookId: string;
  questionId: string;
  attemptId: string;
}) {
  await db
    .insert(studyWrongNotes)
    .values({
      userId: input.userId,
      workbookId: input.workbookId,
      questionId: input.questionId,
      attemptId: input.attemptId,
      status: 'open',
      wrongCount: 1,
      lastWrongAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [studyWrongNotes.userId, studyWrongNotes.questionId],
      set: {
        attemptId: input.attemptId,
        status: 'open',
        wrongCount: sql`${studyWrongNotes.wrongCount} + 1`,
        lastWrongAt: new Date(),
        resolvedAt: null,
        updatedAt: new Date(),
      },
    });
}

export const studyRouter = router({
  listWorkbooks: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }).default({ limit: 20 }))
    .query(async ({ input }) => {
      const items = await db
        .select({
          id: studyWorkbooks.id,
          subjectId: studyWorkbooks.subjectId,
          subjectName: studySubjects.name,
          originalFilename: studyWorkbooks.originalFilename,
          storagePath: studyWorkbooks.storagePath,
          fileHash: studyWorkbooks.fileHash,
          status: studyWorkbooks.status,
          metadata: studyWorkbooks.metadata,
          uploadedAt: studyWorkbooks.uploadedAt,
          updatedAt: studyWorkbooks.updatedAt,
        })
        .from(studyWorkbooks)
        .leftJoin(studySubjects, eq(studyWorkbooks.subjectId, studySubjects.id))
        .orderBy(desc(studyWorkbooks.uploadedAt))
        .limit(input.limit);

      return { items };
    }),

  getWorkbook: protectedProcedure
    .input(z.object({ workbookId: z.string().uuid() }))
    .query(async ({ input }) => {
      const [workbook] = await db
        .select()
        .from(studyWorkbooks)
        .where(eq(studyWorkbooks.id, input.workbookId))
        .limit(1);

      return workbook ?? null;
    }),

  listImportJobs: protectedProcedure
    .input(z.object({ workbookId: z.string().uuid(), limit: z.number().min(1).max(20).default(10) }))
    .query(async ({ input }) => {
      const items = await db
        .select()
        .from(studyImportJobs)
        .where(eq(studyImportJobs.workbookId, input.workbookId))
        .orderBy(desc(studyImportJobs.createdAt))
        .limit(input.limit);

      return { items };
    }),

  listQuestions: protectedProcedure
    .input(z.object({ workbookId: z.string().uuid(), limit: z.number().min(1).max(100).default(50), offset: z.number().min(0).default(0) }))
    .query(async ({ input }) => {
      const items = await db
        .select({
          id: studyQuestions.id,
          workbookId: studyQuestions.workbookId,
          externalId: studyQuestions.externalId,
          questionNo: studyQuestions.questionNo,
          type: studyQuestions.type,
          prompt: sql<string>`left(${studyQuestions.prompt}, 180)`,
          choices: studyQuestions.choices,
          difficulty: studyQuestions.difficulty,
          reviewStatus: studyQuestions.reviewStatus,
        })
        .from(studyQuestions)
        .where(and(eq(studyQuestions.workbookId, input.workbookId), eq(studyQuestions.isActive, true), eq(studyQuestions.isHidden, false)))
        .orderBy(asc(studyQuestions.questionNo), asc(studyQuestions.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return { items, hasMore: items.length === input.limit };
    }),

  getQuestion: protectedProcedure
    .input(z.object({ questionId: z.string().uuid() }))
    .query(async ({ input }) => {
      const [question] = await db
        .select({
          id: studyQuestions.id,
          workbookId: studyQuestions.workbookId,
          externalId: studyQuestions.externalId,
          questionNo: studyQuestions.questionNo,
          type: studyQuestions.type,
          prompt: studyQuestions.prompt,
          choices: studyQuestions.choices,
          difficulty: studyQuestions.difficulty,
          sourceSheet: studyQuestions.sourceSheet,
        })
        .from(studyQuestions)
        .where(and(eq(studyQuestions.id, input.questionId), eq(studyQuestions.isActive, true), eq(studyQuestions.isHidden, false)))
        .limit(1);

      if (!question) throw new TRPCError({ code: 'NOT_FOUND', message: '문항을 찾을 수 없습니다.' });
      return question;
    }),

  submitAttempt: protectedProcedure
    .input(
      z.object({
        questionId: z.string().uuid(),
        selectedAnswer: z.string().min(1),
        elapsedSeconds: z.number().int().min(0).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [question] = await db
        .select({
          id: studyQuestions.id,
          workbookId: studyQuestions.workbookId,
          answer: studyQuestions.answer,
          explanation: studyQuestions.explanation,
        })
        .from(studyQuestions)
        .where(eq(studyQuestions.id, input.questionId))
        .limit(1);

      if (!question) throw new TRPCError({ code: 'NOT_FOUND', message: '문항을 찾을 수 없습니다.' });

      const isCorrect = normalizeAnswer(input.selectedAnswer) === normalizeAnswer(question.answer);
      const [attempt] = await db
        .insert(studyAttempts)
        .values({
          userId: ctx.userId,
          workbookId: question.workbookId,
          questionId: question.id,
          selectedAnswer: input.selectedAnswer,
          isCorrect,
          elapsedSeconds: input.elapsedSeconds,
        })
        .returning({ id: studyAttempts.id });

      if (!isCorrect) {
        await createWrongNote({ userId: ctx.userId, workbookId: question.workbookId, questionId: question.id, attemptId: attempt.id });
      }

      return {
        attemptId: attempt.id,
        isCorrect,
        correctAnswer: question.answer,
        explanation: question.explanation,
      };
    }),

  listExamSets: protectedProcedure
    .input(z.object({ workbookId: z.string().uuid().optional(), limit: z.number().min(1).max(50).default(20) }).default({ limit: 20 }))
    .query(async ({ input }) => {
      const conditions = input.workbookId ? [eq(studyExamSets.workbookId, input.workbookId)] : [];
      const items = await db
        .select({
          id: studyExamSets.id,
          workbookId: studyExamSets.workbookId,
          externalId: studyExamSets.externalId,
          title: studyExamSets.title,
          description: studyExamSets.description,
          totalQuestions: studyExamSets.totalQuestions,
          createdAt: studyExamSets.createdAt,
          workbookName: studyWorkbooks.originalFilename,
          subjectName: studySubjects.name,
        })
        .from(studyExamSets)
        .innerJoin(studyWorkbooks, eq(studyExamSets.workbookId, studyWorkbooks.id))
        .leftJoin(studySubjects, eq(studyExamSets.subjectId, studySubjects.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(studyExamSets.createdAt))
        .limit(input.limit);

      return { items };
    }),

  getExamSet: protectedProcedure
    .input(z.object({ setId: z.string().uuid() }))
    .query(async ({ input }) => {
      const [set] = await db
        .select({
          id: studyExamSets.id,
          workbookId: studyExamSets.workbookId,
          externalId: studyExamSets.externalId,
          title: studyExamSets.title,
          description: studyExamSets.description,
          totalQuestions: studyExamSets.totalQuestions,
        })
        .from(studyExamSets)
        .where(eq(studyExamSets.id, input.setId))
        .limit(1);

      if (!set) throw new TRPCError({ code: 'NOT_FOUND', message: '모의고사 세트를 찾을 수 없습니다.' });

      const questions = await db
        .select({
          itemId: studyExamSetItems.id,
          position: studyExamSetItems.position,
          points: studyExamSetItems.points,
          questionId: studyQuestions.id,
          externalId: studyQuestions.externalId,
          questionNo: studyQuestions.questionNo,
          type: studyQuestions.type,
          prompt: studyQuestions.prompt,
          choices: studyQuestions.choices,
          difficulty: studyQuestions.difficulty,
        })
        .from(studyExamSetItems)
        .innerJoin(studyQuestions, eq(studyExamSetItems.questionId, studyQuestions.id))
        .where(and(eq(studyExamSetItems.setId, input.setId), eq(studyQuestions.isActive, true), eq(studyQuestions.isHidden, false)))
        .orderBy(asc(studyExamSetItems.position));

      return { ...set, questions };
    }),

  submitExamSet: protectedProcedure
    .input(
      z.object({
        setId: z.string().uuid(),
        elapsedSeconds: z.number().int().min(0).optional(),
        answers: z.array(z.object({ questionId: z.string().uuid(), selectedAnswer: z.string().min(1) })).min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const setQuestions = await db
        .select({
          position: studyExamSetItems.position,
          questionId: studyQuestions.id,
          workbookId: studyQuestions.workbookId,
          prompt: studyQuestions.prompt,
          answer: studyQuestions.answer,
          explanation: studyQuestions.explanation,
        })
        .from(studyExamSetItems)
        .innerJoin(studyQuestions, eq(studyExamSetItems.questionId, studyQuestions.id))
        .where(and(eq(studyExamSetItems.setId, input.setId), eq(studyQuestions.isActive, true), eq(studyQuestions.isHidden, false)))
        .orderBy(asc(studyExamSetItems.position));

      if (setQuestions.length === 0) throw new TRPCError({ code: 'NOT_FOUND', message: '제출할 문항이 없습니다.' });

      const answerMap = new Map(input.answers.map((answer) => [answer.questionId, answer.selectedAnswer]));
      const results = [];

      for (const question of setQuestions) {
        const selectedAnswer = answerMap.get(question.questionId) ?? '';
        const isCorrect = selectedAnswer ? normalizeAnswer(selectedAnswer) === normalizeAnswer(question.answer) : false;
        const [attempt] = await db
          .insert(studyAttempts)
          .values({
            userId: ctx.userId,
            workbookId: question.workbookId,
            questionId: question.questionId,
            selectedAnswer: selectedAnswer || '(미응답)',
            isCorrect,
            elapsedSeconds: input.elapsedSeconds,
            metadata: { examSetId: input.setId, position: question.position },
          })
          .returning({ id: studyAttempts.id });

        if (!isCorrect) {
          await createWrongNote({ userId: ctx.userId, workbookId: question.workbookId, questionId: question.questionId, attemptId: attempt.id });
        }

        results.push({
          questionId: question.questionId,
          position: question.position,
          prompt: question.prompt,
          selectedAnswer: selectedAnswer || '(미응답)',
          isCorrect,
          correctAnswer: question.answer,
          explanation: question.explanation,
        });
      }

      const correctCount = results.filter((result) => result.isCorrect).length;
      return {
        setId: input.setId,
        totalQuestions: results.length,
        correctCount,
        wrongCount: results.length - correctCount,
        accuracy: Math.round((correctCount / results.length) * 100),
        results,
      };
    }),

  listWrongNotes: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }).default({ limit: 20 }))
    .query(async ({ input, ctx }) => {
      const items = await db
        .select({
          id: studyWrongNotes.id,
          questionId: studyWrongNotes.questionId,
          workbookId: studyWrongNotes.workbookId,
          status: studyWrongNotes.status,
          wrongCount: studyWrongNotes.wrongCount,
          lastWrongAt: studyWrongNotes.lastWrongAt,
          prompt: sql<string>`left(${studyQuestions.prompt}, 180)`,
          questionNo: studyQuestions.questionNo,
        })
        .from(studyWrongNotes)
        .innerJoin(studyQuestions, eq(studyWrongNotes.questionId, studyQuestions.id))
        .where(eq(studyWrongNotes.userId, ctx.userId))
        .orderBy(desc(studyWrongNotes.lastWrongAt))
        .limit(input.limit);

      return { items };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [attemptStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        correct: sql<number>`coalesce(sum(case when ${studyAttempts.isCorrect} then 1 else 0 end), 0)::int`,
      })
      .from(studyAttempts)
      .where(eq(studyAttempts.userId, ctx.userId));

    const [wrongStats] = await db
      .select({ openWrongNotes: sql<number>`count(*)::int` })
      .from(studyWrongNotes)
      .where(and(eq(studyWrongNotes.userId, ctx.userId), eq(studyWrongNotes.status, 'open')));

    const total = attemptStats?.total ?? 0;
    const correct = attemptStats?.correct ?? 0;
    return {
      totalAttempts: total,
      correctAttempts: correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      openWrongNotes: wrongStats?.openWrongNotes ?? 0,
    };
  }),
});
