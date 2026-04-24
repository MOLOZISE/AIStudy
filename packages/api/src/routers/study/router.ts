import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import {
  db,
  studyAttempts,
  studyConcepts,
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

// Excel에 정답이 "3" 같은 선택지 번호로 저장된 경우 실제 텍스트로 변환
function resolveAnswer(answer: string, choices: string[] | null): string {
  if (!choices || choices.length === 0) return answer;
  const n = parseInt(answer.trim(), 10);
  if (!isNaN(n) && n >= 1 && n <= choices.length) return choices[n - 1];
  return answer;
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
          choices: studyQuestions.choices,
          explanation: studyQuestions.explanation,
        })
        .from(studyQuestions)
        .where(eq(studyQuestions.id, input.questionId))
        .limit(1);

      if (!question) throw new TRPCError({ code: 'NOT_FOUND', message: '문항을 찾을 수 없습니다.' });

      const correctAnswer = resolveAnswer(question.answer, question.choices as string[] | null);
      const isCorrect = normalizeAnswer(input.selectedAnswer) === normalizeAnswer(correctAnswer);
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
        correctAnswer,
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
          choices: studyQuestions.choices,
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
        const correctAnswer = resolveAnswer(question.answer, question.choices as string[] | null);
        const isCorrect = selectedAnswer ? normalizeAnswer(selectedAnswer) === normalizeAnswer(correctAnswer) : false;
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
          correctAnswer,
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

  getStatsDetailed: protectedProcedure.query(async ({ ctx }) => {
    const workbookStats = await db
      .select({
        workbookId: studyAttempts.workbookId,
        workbookName: studyWorkbooks.originalFilename,
        total: sql<number>`count(*)::int`,
        correct: sql<number>`coalesce(sum(case when ${studyAttempts.isCorrect} then 1 else 0 end), 0)::int`,
      })
      .from(studyAttempts)
      .innerJoin(studyWorkbooks, eq(studyAttempts.workbookId, studyWorkbooks.id))
      .where(eq(studyAttempts.userId, ctx.userId))
      .groupBy(studyAttempts.workbookId, studyWorkbooks.originalFilename)
      .orderBy(desc(sql`count(*)`));

    const dailyStats = await db
      .select({
        date: sql<string>`date(${studyAttempts.submittedAt} at time zone 'Asia/Seoul')::text`,
        total: sql<number>`count(*)::int`,
        correct: sql<number>`coalesce(sum(case when ${studyAttempts.isCorrect} then 1 else 0 end), 0)::int`,
      })
      .from(studyAttempts)
      .where(and(
        eq(studyAttempts.userId, ctx.userId),
        sql`${studyAttempts.submittedAt} >= now() - interval '7 days'`,
      ))
      .groupBy(sql`date(${studyAttempts.submittedAt} at time zone 'Asia/Seoul')`)
      .orderBy(sql`date(${studyAttempts.submittedAt} at time zone 'Asia/Seoul')`);

    return {
      workbookStats: workbookStats.map((w) => ({
        ...w,
        accuracy: w.total > 0 ? Math.round((w.correct / w.total) * 100) : 0,
      })),
      dailyStats: dailyStats.map((d) => ({
        ...d,
        accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
      })),
    };
  }),

  listWrongNoteQuestions: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }).default({}))
    .query(async ({ input, ctx }) => {
      const items = await db
        .select({
          noteId: studyWrongNotes.id,
          questionId: studyQuestions.id,
          wrongCount: studyWrongNotes.wrongCount,
          workbookId: studyQuestions.workbookId,
          prompt: studyQuestions.prompt,
          choices: studyQuestions.choices,
          type: studyQuestions.type,
          difficulty: studyQuestions.difficulty,
          questionNo: studyQuestions.questionNo,
        })
        .from(studyWrongNotes)
        .innerJoin(studyQuestions, eq(studyWrongNotes.questionId, studyQuestions.id))
        .where(and(
          eq(studyWrongNotes.userId, ctx.userId),
          eq(studyWrongNotes.status, 'open'),
          eq(studyQuestions.isActive, true),
          eq(studyQuestions.isHidden, false),
        ))
        .orderBy(desc(studyWrongNotes.wrongCount), desc(studyWrongNotes.lastWrongAt))
        .limit(input.limit);

      return { items };
    }),

  submitWrongNoteExam: protectedProcedure
    .input(z.object({
      elapsedSeconds: z.number().int().min(0).optional(),
      answers: z.array(z.object({ questionId: z.string().uuid(), selectedAnswer: z.string().min(1) })).min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const questionIds = input.answers.map((a) => a.questionId);
      const dbQuestions = await db
        .select({
          id: studyQuestions.id,
          workbookId: studyQuestions.workbookId,
          prompt: studyQuestions.prompt,
          answer: studyQuestions.answer,
          choices: studyQuestions.choices,
          explanation: studyQuestions.explanation,
        })
        .from(studyQuestions)
        .where(and(inArray(studyQuestions.id, questionIds), eq(studyQuestions.isActive, true)));

      const questionMap = new Map(dbQuestions.map((q) => [q.id, q]));
      const answerMap = new Map(input.answers.map((a) => [a.questionId, a.selectedAnswer]));
      const results = [];

      for (const [questionId, selectedAnswer] of answerMap) {
        const question = questionMap.get(questionId);
        if (!question) continue;

        const correctAnswer = resolveAnswer(question.answer, question.choices as string[] | null);
        const isCorrect = normalizeAnswer(selectedAnswer) === normalizeAnswer(correctAnswer);

        const [attempt] = await db
          .insert(studyAttempts)
          .values({
            userId: ctx.userId,
            workbookId: question.workbookId,
            questionId,
            selectedAnswer,
            isCorrect,
            elapsedSeconds: input.elapsedSeconds,
            metadata: { source: 'wrong_note_session' },
          })
          .returning({ id: studyAttempts.id });

        if (isCorrect) {
          // 맞췄으면 오답노트 resolved 처리
          await db
            .update(studyWrongNotes)
            .set({ status: 'resolved', resolvedAt: new Date(), updatedAt: new Date() })
            .where(and(eq(studyWrongNotes.userId, ctx.userId), eq(studyWrongNotes.questionId, questionId)));
        } else {
          await createWrongNote({ userId: ctx.userId, workbookId: question.workbookId, questionId, attemptId: attempt.id });
        }

        results.push({
          questionId,
          prompt: question.prompt,
          selectedAnswer,
          isCorrect,
          correctAnswer,
          explanation: question.explanation,
        });
      }

      const correctCount = results.filter((r) => r.isCorrect).length;
      return {
        totalQuestions: results.length,
        correctCount,
        wrongCount: results.length - correctCount,
        accuracy: Math.round((correctCount / results.length) * 100),
        resolvedCount: correctCount,
        results,
      };
    }),

  // ── 개념 ───────────────────────────────────────────────────────────────────

  listConcepts: protectedProcedure
    .input(z.object({ workbookId: z.string().uuid() }))
    .query(async ({ input }) => {
      const concepts = await db
        .select({
          id: studyConcepts.id,
          externalId: studyConcepts.externalId,
          parentId: studyConcepts.parentId,
          title: studyConcepts.title,
          description: studyConcepts.description,
          orderIndex: studyConcepts.orderIndex,
          questionCount: sql<number>`(
            select count(*) from study_questions q
            where q.concept_id = ${studyConcepts.id}
            and q.is_active = true and q.is_hidden = false
          )::int`,
        })
        .from(studyConcepts)
        .where(eq(studyConcepts.workbookId, input.workbookId))
        .orderBy(asc(studyConcepts.orderIndex), asc(studyConcepts.externalId));

      return { concepts };
    }),

  getConceptQuestions: protectedProcedure
    .input(z.object({ conceptId: z.string().uuid(), limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input }) => {
      const questions = await db
        .select({
          id: studyQuestions.id,
          externalId: studyQuestions.externalId,
          questionNo: studyQuestions.questionNo,
          type: studyQuestions.type,
          prompt: studyQuestions.prompt,
          choices: studyQuestions.choices,
          difficulty: studyQuestions.difficulty,
        })
        .from(studyQuestions)
        .where(and(
          eq(studyQuestions.conceptId, input.conceptId),
          eq(studyQuestions.isActive, true),
          eq(studyQuestions.isHidden, false),
        ))
        .orderBy(asc(studyQuestions.questionNo))
        .limit(input.limit);

      return { questions };
    }),

  // ── 랜덤 연습 ────────────────────────────────────────────────────────────────

  getRandomQuestions: protectedProcedure
    .input(z.object({
      workbookId: z.string().uuid().optional(),
      conceptId: z.string().uuid().optional(),
      difficulty: z.string().optional(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      const conditions = [
        eq(studyQuestions.isActive, true),
        eq(studyQuestions.isHidden, false),
      ];
      if (input.workbookId) conditions.push(eq(studyQuestions.workbookId, input.workbookId));
      if (input.conceptId) conditions.push(eq(studyQuestions.conceptId, input.conceptId));
      if (input.difficulty) conditions.push(eq(studyQuestions.difficulty, input.difficulty));

      const questions = await db
        .select({
          id: studyQuestions.id,
          workbookId: studyQuestions.workbookId,
          questionNo: studyQuestions.questionNo,
          type: studyQuestions.type,
          prompt: studyQuestions.prompt,
          choices: studyQuestions.choices,
          difficulty: studyQuestions.difficulty,
        })
        .from(studyQuestions)
        .where(and(...conditions))
        .orderBy(sql`random()`)
        .limit(input.limit);

      return { questions };
    }),

  submitPractice: protectedProcedure
    .input(z.object({
      elapsedSeconds: z.number().int().min(0).optional(),
      answers: z.array(z.object({ questionId: z.string().uuid(), selectedAnswer: z.string().min(1) })).min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const questionIds = input.answers.map((a) => a.questionId);
      const dbQuestions = await db
        .select({
          id: studyQuestions.id,
          workbookId: studyQuestions.workbookId,
          prompt: studyQuestions.prompt,
          answer: studyQuestions.answer,
          choices: studyQuestions.choices,
          explanation: studyQuestions.explanation,
        })
        .from(studyQuestions)
        .where(and(inArray(studyQuestions.id, questionIds), eq(studyQuestions.isActive, true)));

      const questionMap = new Map(dbQuestions.map((q) => [q.id, q]));
      const answerMap = new Map(input.answers.map((a) => [a.questionId, a.selectedAnswer]));
      const results = [];

      for (const [questionId, selectedAnswer] of answerMap) {
        const question = questionMap.get(questionId);
        if (!question) continue;
        const correctAnswer = resolveAnswer(question.answer, question.choices as string[] | null);
        const isCorrect = normalizeAnswer(selectedAnswer) === normalizeAnswer(correctAnswer);

        const [attempt] = await db
          .insert(studyAttempts)
          .values({
            userId: ctx.userId,
            workbookId: question.workbookId,
            questionId,
            selectedAnswer,
            isCorrect,
            elapsedSeconds: input.elapsedSeconds,
            metadata: { source: 'random_practice' },
          })
          .returning({ id: studyAttempts.id });

        if (!isCorrect) {
          await createWrongNote({ userId: ctx.userId, workbookId: question.workbookId, questionId, attemptId: attempt.id });
        }
        results.push({ questionId, prompt: question.prompt, selectedAnswer, isCorrect, correctAnswer, explanation: question.explanation });
      }

      const correctCount = results.filter((r) => r.isCorrect).length;
      return {
        totalQuestions: results.length,
        correctCount,
        wrongCount: results.length - correctCount,
        accuracy: Math.round((correctCount / results.length) * 100),
        results,
      };
    }),

  // ── 검색 ────────────────────────────────────────────────────────────────────

  searchQuestions: protectedProcedure
    .input(z.object({
      query: z.string().min(1).max(200),
      workbookId: z.string().uuid().optional(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      const pattern = `%${input.query}%`;
      const conditions = [
        sql`(${studyQuestions.prompt} ilike ${pattern} or ${studyQuestions.explanation} ilike ${pattern})`,
        eq(studyQuestions.isActive, true),
        eq(studyQuestions.isHidden, false),
      ];
      if (input.workbookId) conditions.push(eq(studyQuestions.workbookId, input.workbookId));

      const items = await db
        .select({
          id: studyQuestions.id,
          workbookId: studyQuestions.workbookId,
          workbookName: studyWorkbooks.originalFilename,
          questionNo: studyQuestions.questionNo,
          type: studyQuestions.type,
          prompt: sql<string>`left(${studyQuestions.prompt}, 200)`,
          difficulty: studyQuestions.difficulty,
        })
        .from(studyQuestions)
        .innerJoin(studyWorkbooks, eq(studyQuestions.workbookId, studyWorkbooks.id))
        .where(and(...conditions))
        .orderBy(asc(studyQuestions.questionNo))
        .limit(input.limit);

      return { items, query: input.query };
    }),

  // ── 문제집 삭제 ───────────────────────────────────────────────────────────────

  deleteWorkbook: protectedProcedure
    .input(z.object({ workbookId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const [workbook] = await db
        .select({ uploadedBy: studyWorkbooks.uploadedBy })
        .from(studyWorkbooks)
        .where(eq(studyWorkbooks.id, input.workbookId))
        .limit(1);

      if (!workbook) throw new TRPCError({ code: 'NOT_FOUND', message: '문제집을 찾을 수 없습니다.' });
      if (workbook.uploadedBy !== ctx.userId) throw new TRPCError({ code: 'FORBIDDEN', message: '삭제 권한이 없습니다.' });

      await db.delete(studyWorkbooks).where(eq(studyWorkbooks.id, input.workbookId));
      return { deleted: true };
    }),

  listExamHistory: protectedProcedure
    .input(z.object({ setId: z.string().uuid(), limit: z.number().min(1).max(20).default(10) }))
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select({
          date: sql<string>`date(${studyAttempts.submittedAt} at time zone 'Asia/Seoul')::text`,
          total: sql<number>`count(*)::int`,
          correct: sql<number>`coalesce(sum(case when ${studyAttempts.isCorrect} then 1 else 0 end), 0)::int`,
        })
        .from(studyAttempts)
        .where(and(
          eq(studyAttempts.userId, ctx.userId),
          sql`${studyAttempts.metadata}->>'examSetId' = ${input.setId}`,
        ))
        .groupBy(sql`date(${studyAttempts.submittedAt} at time zone 'Asia/Seoul')`)
        .orderBy(desc(sql`date(${studyAttempts.submittedAt} at time zone 'Asia/Seoul')`))
        .limit(input.limit);

      return {
        history: rows.map((r) => ({
          ...r,
          accuracy: r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0,
        })),
      };
    }),
});
