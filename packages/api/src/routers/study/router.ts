import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { and, asc, avg, count, desc, eq, inArray, sql, isNull } from 'drizzle-orm';
import {
  db,
  profiles,
  studyAttempts,
  studyComments,
  studyCommentLikes,
  studyConcepts,
  studyExamSetItems,
  studyExamSets,
  studyImportJobs,
  studyQuestions,
  studyRewardEvents,
  studySeeds,
  studySubjects,
  studyUserLibrary,
  studyUserProgress,
  studyWorkbooks,
  studyWrongNotes,
  studyWorkbookPublications,
  studyWorkbookReviews,
  studyWorkbookLikes,
  studyReports,
  studyWorkbookForks,
  studyAiGenerationJobs,
  studyBadges,
  studyUserBadges,
  studyNotifications,
} from '@repo/db';
import { protectedProcedure, router } from '../../trpc.js';
import { awardStudyReward, updateStudyStreak, getMyProgress, listRecentRewardEvents } from '../../gamification.js';
import { evaluateAndAwardBadges } from '../../badges.js';
import { createStudyNotification, markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount } from '../../notifications.js';
import {
  updateQuestProgressFromRewardEvent,
  claimQuestRewardInternal,
  getTodayQuests,
  getWeeklyQuests,
  getMonthlyQuests,
  getQuestSummary,
} from '../../quests.js';

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

// OX/true_false 정규화
function normalizeOXAnswer(value: string): 'O' | 'X' | null {
  const n = value.trim().toLowerCase();
  if (['o', 'true', '맞음', '맞다', '예'].includes(n)) return 'O';
  if (['x', 'false', '틀림', '틀리다', '아니오'].includes(n)) return 'X';
  return null;
}

// 문제 타입 정규화
function normalizeQuestionType(type: string | null | undefined): 'multiple_choice_single' | 'true_false' | 'short_answer' | 'essay_self_review' {
  switch ((type ?? '').toLowerCase()) {
    case 'multiple_choice':
    case 'multiple_choice_single':
    case 'choice':
    case '객관식':
      return 'multiple_choice_single';
    case 'true_false':
    case 'ox':
    case 'o/x':
      return 'true_false';
    case 'short_answer':
    case '단답형':
      return 'short_answer';
    case 'essay':
    case 'essay_self_review':
    case '주관식':
      return 'essay_self_review';
    default:
      return 'multiple_choice_single';
  }
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
      reviewCount: 0,
      lastWrongAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [studyWrongNotes.userId, studyWrongNotes.questionId],
      set: {
        attemptId: input.attemptId,
        status: 'open',
        wrongCount: sql`${studyWrongNotes.wrongCount} + 1`,
        reviewCount: sql`${studyWrongNotes.reviewCount} + 1`,
        lastWrongAt: new Date(),
        lastReviewedAt: new Date(),
        updatedAt: new Date(),
      },
    });
}

export const studyRouter = router({
  listWorkbooks: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }).default({ limit: 20 }))
    .query(async ({ input, ctx }) => {
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
        .where(eq(studyWorkbooks.uploadedBy, ctx.userId))
        .orderBy(desc(studyWorkbooks.uploadedAt))
        .limit(input.limit);

      return { items };
    }),

  getWorkbook: protectedProcedure
    .input(z.object({ workbookId: z.string().uuid() }))
    .query(async ({ input }) => {
      const [workbook] = await db
        .select({
          id: studyWorkbooks.id,
          subjectId: studyWorkbooks.subjectId,
          subjectName: studySubjects.name,
          uploadedBy: studyWorkbooks.uploadedBy,
          originalFilename: studyWorkbooks.originalFilename,
          storageBucket: studyWorkbooks.storageBucket,
          storagePath: studyWorkbooks.storagePath,
          fileHash: studyWorkbooks.fileHash,
          status: studyWorkbooks.status,
          metadata: studyWorkbooks.metadata,
          uploadedAt: studyWorkbooks.uploadedAt,
          updatedAt: studyWorkbooks.updatedAt,
        })
        .from(studyWorkbooks)
        .leftJoin(studySubjects, eq(studyWorkbooks.subjectId, studySubjects.id))
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
          answer: studyQuestions.answer,
          explanation: studyQuestions.explanation,
          difficulty: studyQuestions.difficulty,
          sourceSheet: studyQuestions.sourceSheet,
          reviewStatus: studyQuestions.reviewStatus,
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
          type: studyQuestions.type,
          answer: studyQuestions.answer,
          choices: studyQuestions.choices,
          explanation: studyQuestions.explanation,
        })
        .from(studyQuestions)
        .where(eq(studyQuestions.id, input.questionId))
        .limit(1);

      if (!question) throw new TRPCError({ code: 'NOT_FOUND', message: '문항을 찾을 수 없습니다.' });

      const normalizedType = normalizeQuestionType(question.type);
      const correctAnswer = resolveAnswer(question.answer, question.choices as string[] | null);

      let isCorrect: boolean;
      if (normalizedType === 'essay_self_review') {
        isCorrect = false;
      } else if (normalizedType === 'true_false') {
        const userOX = normalizeOXAnswer(input.selectedAnswer);
        const correctOX = normalizeOXAnswer(correctAnswer);
        isCorrect = userOX !== null && correctOX !== null && userOX === correctOX;
      } else {
        isCorrect = normalizeAnswer(input.selectedAnswer) === normalizeAnswer(correctAnswer);
      }

      const [attempt] = await db
        .insert(studyAttempts)
        .values({
          userId: ctx.userId,
          workbookId: question.workbookId,
          questionId: question.id,
          selectedAnswer: input.selectedAnswer,
          isCorrect,
          elapsedSeconds: input.elapsedSeconds,
          metadata: { questionType: normalizedType },
        })
        .returning({ id: studyAttempts.id });

      if (!isCorrect && normalizedType !== 'essay_self_review') {
        await createWrongNote({ userId: ctx.userId, workbookId: question.workbookId, questionId: question.id, attemptId: attempt.id });
      }

      // Award gamification rewards (non-blocking)
      await awardStudyReward({
        userId: ctx.userId,
        eventType: 'question_attempt',
        sourceType: 'attempt',
        sourceId: attempt.id,
        reason: 'Question attempt submission',
        idempotencyKey: `question_attempt:${ctx.userId}:${attempt.id}`,
      });

      if (isCorrect) {
        await awardStudyReward({
          userId: ctx.userId,
          eventType: 'question_correct_bonus',
          sourceType: 'attempt',
          sourceId: attempt.id,
          reason: 'Correct answer bonus',
          idempotencyKey: `question_correct:${ctx.userId}:${attempt.id}`,
        });
      }

      await updateStudyStreak(ctx.userId);

      // Update quest progress
      await updateQuestProgressFromRewardEvent(ctx.userId, 'question_attempt', 5);
      if (isCorrect) {
        await updateQuestProgressFromRewardEvent(ctx.userId, 'question_correct_bonus', 2);
      }

      // Evaluate and award badges (non-blocking)
      evaluateAndAwardBadges(ctx.userId).catch((err) => {
        console.error('Badge evaluation failed:', err);
      });

      return {
        attemptId: attempt.id,
        isCorrect,
        correctAnswer,
        explanation: question.explanation,
        questionType: normalizedType,
      };
    }),

  submitSelfReview: protectedProcedure
    .input(
      z.object({
        attemptId: z.string().uuid(),
        selfReview: z.enum(['알고있음', '부분이해', '모름']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [attempt] = await db
        .select()
        .from(studyAttempts)
        .where(and(eq(studyAttempts.id, input.attemptId), eq(studyAttempts.userId, ctx.userId)))
        .limit(1);

      if (!attempt) throw new TRPCError({ code: 'NOT_FOUND', message: '응시 기록을 찾을 수 없습니다.' });

      const isCorrect = input.selfReview === '알고있음';

      await db
        .update(studyAttempts)
        .set({
          isCorrect,
          metadata: { ...(attempt.metadata as Record<string, unknown>), selfReview: input.selfReview },
        })
        .where(eq(studyAttempts.id, input.attemptId));

      let event: string | null = null;

      if (input.selfReview === '알고있음') {
        // Mark as mastered
        await db
          .update(studyWrongNotes)
          .set({
            status: 'mastered',
            masteredAt: new Date(),
            reviewCount: sql`${studyWrongNotes.reviewCount} + 1`,
            lastReviewedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(eq(studyWrongNotes.userId, ctx.userId), eq(studyWrongNotes.questionId, attempt.questionId)));
        event = 'wrong_note_review_success';

        // Award reward (non-blocking)
        await awardStudyReward({
          userId: ctx.userId,
          eventType: 'wrong_note_review_success',
          sourceType: 'self_review',
          sourceId: attempt.id,
          reason: 'Self-review mastery confirmation',
          idempotencyKey: `wrong_note_review_success:${ctx.userId}:${attempt.questionId}:${attempt.id}`,
        });
      } else if (input.selfReview === '부분이해') {
        // Create/update as reviewing
        await createWrongNote({ userId: ctx.userId, workbookId: attempt.workbookId, questionId: attempt.questionId, attemptId: attempt.id });
        await db
          .update(studyWrongNotes)
          .set({
            status: 'reviewing',
            lastReviewedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(eq(studyWrongNotes.userId, ctx.userId), eq(studyWrongNotes.questionId, attempt.questionId)));
        event = 'wrong_note_review_failed';
      } else {
        // '모름' - create as open
        await createWrongNote({ userId: ctx.userId, workbookId: attempt.workbookId, questionId: attempt.questionId, attemptId: attempt.id });
        event = 'wrong_note_review_failed';
      }

      // Update streak after self review
      await updateStudyStreak(ctx.userId);

      // Update quest progress
      if (input.selfReview === '알고있음') {
        await updateQuestProgressFromRewardEvent(ctx.userId, 'wrong_note_review_success', 8);
      }

      return { selfReview: input.selfReview, isCorrect, event };
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
          type: studyQuestions.type,
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
        const normalizedType = normalizeQuestionType(question.type);

        let isCorrect: boolean;
        if (normalizedType === 'essay_self_review') {
          isCorrect = false;
        } else if (normalizedType === 'true_false') {
          const userOX = normalizeOXAnswer(selectedAnswer);
          const correctOX = normalizeOXAnswer(correctAnswer);
          isCorrect = userOX !== null && correctOX !== null && userOX === correctOX;
        } else {
          isCorrect = selectedAnswer ? normalizeAnswer(selectedAnswer) === normalizeAnswer(correctAnswer) : false;
        }

        const [attempt] = await db
          .insert(studyAttempts)
          .values({
            userId: ctx.userId,
            workbookId: question.workbookId,
            questionId: question.questionId,
            selectedAnswer: selectedAnswer || '(미응답)',
            isCorrect,
            elapsedSeconds: input.elapsedSeconds,
            metadata: { examSetId: input.setId, position: question.position, questionType: normalizedType },
          })
          .returning({ id: studyAttempts.id });

        if (!isCorrect && normalizedType !== 'essay_self_review') {
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

      // Award exam completion reward (non-blocking)
      const now = new Date().toISOString();
      await awardStudyReward({
        userId: ctx.userId,
        eventType: 'exam_completed',
        sourceType: 'exam_set',
        sourceId: input.setId,
        reason: `Exam completed: ${correctCount}/${results.length} correct`,
        idempotencyKey: `exam_completed:${ctx.userId}:${input.setId}:${now}`,
      });

      // Update streak after exam submission
      await updateStudyStreak(ctx.userId);

      // Update quest progress
      await updateQuestProgressFromRewardEvent(ctx.userId, 'exam_completed', 30);

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
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      status: z.enum(['all', 'open', 'reviewing', 'mastered', 'ignored']).default('all'),
    }).default({ limit: 50, status: 'all' }))
    .query(async ({ input, ctx }) => {
      const conditions = [eq(studyWrongNotes.userId, ctx.userId)];
      if (input.status !== 'all') {
        if (input.status === 'mastered') {
          conditions.push(inArray(studyWrongNotes.status, ['mastered', 'resolved']));
        } else {
          conditions.push(eq(studyWrongNotes.status, input.status));
        }
      }

      const items = await db
        .select({
          id: studyWrongNotes.id,
          questionId: studyWrongNotes.questionId,
          workbookId: studyWrongNotes.workbookId,
          status: studyWrongNotes.status,
          wrongCount: studyWrongNotes.wrongCount,
          reviewCount: studyWrongNotes.reviewCount,
          lastWrongAt: studyWrongNotes.lastWrongAt,
          masteredAt: studyWrongNotes.masteredAt,
          prompt: sql<string>`left(${studyQuestions.prompt}, 180)`,
          questionNo: studyQuestions.questionNo,
          questionType: studyQuestions.type,
          difficulty: studyQuestions.difficulty,
        })
        .from(studyWrongNotes)
        .innerJoin(studyQuestions, eq(studyWrongNotes.questionId, studyQuestions.id))
        .where(and(...conditions))
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
          inArray(studyWrongNotes.status, ['open', 'reviewing']),
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
          type: studyQuestions.type,
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
        const normalizedType = normalizeQuestionType(question.type);

        let isCorrect: boolean;
        if (normalizedType === 'essay_self_review') {
          isCorrect = false;
        } else if (normalizedType === 'true_false') {
          const userOX = normalizeOXAnswer(selectedAnswer);
          const correctOX = normalizeOXAnswer(correctAnswer);
          isCorrect = userOX !== null && correctOX !== null && userOX === correctOX;
        } else {
          isCorrect = normalizeAnswer(selectedAnswer) === normalizeAnswer(correctAnswer);
        }

        const [attempt] = await db
          .insert(studyAttempts)
          .values({
            userId: ctx.userId,
            workbookId: question.workbookId,
            questionId,
            selectedAnswer,
            isCorrect,
            elapsedSeconds: input.elapsedSeconds,
            metadata: { source: 'wrong_note_session', questionType: normalizedType },
          })
          .returning({ id: studyAttempts.id });

        if (isCorrect) {
          // 맞췄으면 오답노트 mastered 처리
          await db
            .update(studyWrongNotes)
            .set({
              status: 'mastered',
              masteredAt: new Date(),
              resolvedAt: new Date(),
              reviewCount: sql`${studyWrongNotes.reviewCount} + 1`,
              lastReviewedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(and(eq(studyWrongNotes.userId, ctx.userId), eq(studyWrongNotes.questionId, questionId)));

          // Award wrong note review success reward (non-blocking)
          await awardStudyReward({
            userId: ctx.userId,
            eventType: 'wrong_note_review_success',
            sourceType: 'wrong_note_exam',
            sourceId: questionId,
            reason: 'Successful wrong note review',
            idempotencyKey: `wrong_note_review_success:${ctx.userId}:${questionId}:${attempt.id}`,
          });
        } else if (normalizedType !== 'essay_self_review') {
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

      // Update streak after wrong note exam session
      await updateStudyStreak(ctx.userId);

      // Update quest progress
      const correctCount2 = results.filter((r) => r.isCorrect).length;
      if (correctCount2 > 0) {
        await updateQuestProgressFromRewardEvent(ctx.userId, 'wrong_note_review_success', 8 * correctCount2);
      }

      return {
        totalQuestions: results.length,
        correctCount,
        wrongCount: results.length - correctCount,
        accuracy: Math.round((correctCount / results.length) * 100),
        resolvedCount: correctCount,
        results,
      };
    }),

  getWrongNoteStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [counts] = await db
        .select({
          openCount: sql<number>`count(*) filter (where status = 'open')::int`,
          reviewingCount: sql<number>`count(*) filter (where status = 'reviewing')::int`,
          masteredCount: sql<number>`count(*) filter (where status in ('mastered', 'resolved'))::int`,
          ignoredCount: sql<number>`count(*) filter (where status = 'ignored')::int`,
          recentCount: sql<number>`count(*) filter (where last_wrong_at >= now() - interval '7 days')::int`,
        })
        .from(studyWrongNotes)
        .where(eq(studyWrongNotes.userId, ctx.userId));

      return counts || { openCount: 0, reviewingCount: 0, masteredCount: 0, ignoredCount: 0, recentCount: 0 };
    }),

  updateWrongNoteStatus: protectedProcedure
    .input(
      z.object({
        noteId: z.string().uuid(),
        status: z.enum(['open', 'reviewing', 'mastered', 'ignored']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [note] = await db
        .select()
        .from(studyWrongNotes)
        .where(and(eq(studyWrongNotes.id, input.noteId), eq(studyWrongNotes.userId, ctx.userId)))
        .limit(1);

      if (!note) throw new TRPCError({ code: 'NOT_FOUND', message: '오답노트를 찾을 수 없습니다.' });

      const updateData: Record<string, any> = {
        status: input.status,
        updatedAt: new Date(),
      };

      if (input.status === 'mastered' && !note.masteredAt) {
        updateData.masteredAt = new Date();
      }
      if (input.status === 'ignored' && !note.ignoredAt) {
        updateData.ignoredAt = new Date();
      }
      if (input.status === 'reviewing' && !note.lastReviewedAt) {
        updateData.lastReviewedAt = new Date();
      }

      await db
        .update(studyWrongNotes)
        .set(updateData)
        .where(eq(studyWrongNotes.id, input.noteId));

      let event: string | null = null;
      if (input.status === 'mastered') {
        event = 'wrong_note_marked_mastered';
        // Award reward only if this is the first time mastering (check masteredAt was just set)
        if (!note.masteredAt) {
          await awardStudyReward({
            userId: ctx.userId,
            eventType: 'wrong_note_marked_mastered',
            sourceType: 'wrong_note',
            sourceId: input.noteId,
            reason: 'Manual mastery mark',
            idempotencyKey: `wrong_note_marked_mastered:${input.noteId}`,
          });

          // Evaluate and award badges (non-blocking)
          evaluateAndAwardBadges(ctx.userId).catch((err) => {
            console.error('Badge evaluation failed:', err);
          });
        }
      }
      if (input.status === 'ignored') {
        event = 'wrong_note_marked_ignored';
      }

      return { status: input.status, event };
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
          type: studyQuestions.type,
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
        const normalizedType = normalizeQuestionType(question.type);

        let isCorrect: boolean;
        if (normalizedType === 'essay_self_review') {
          isCorrect = false;
        } else if (normalizedType === 'true_false') {
          const userOX = normalizeOXAnswer(selectedAnswer);
          const correctOX = normalizeOXAnswer(correctAnswer);
          isCorrect = userOX !== null && correctOX !== null && userOX === correctOX;
        } else {
          isCorrect = normalizeAnswer(selectedAnswer) === normalizeAnswer(correctAnswer);
        }

        const [attempt] = await db
          .insert(studyAttempts)
          .values({
            userId: ctx.userId,
            workbookId: question.workbookId,
            questionId,
            selectedAnswer,
            isCorrect,
            elapsedSeconds: input.elapsedSeconds,
            metadata: { source: 'random_practice', questionType: normalizedType },
          })
          .returning({ id: studyAttempts.id });

        if (!isCorrect && normalizedType !== 'essay_self_review') {
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

  // ── 문제 수정 ───────────────────────────────────────────────────────────────

  updateQuestion: protectedProcedure
    .input(
      z.object({
        questionId: z.string().uuid(),
        prompt: z.string().min(1).optional(),
        choices: z.array(z.string()).optional(),
        answer: z.string().min(1).optional(),
        explanation: z.string().optional(),
        difficulty: z.enum(['상', '중', '하']).optional(),
        type: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get question and check ownership via workbook
      const [question] = await db
        .select({
          id: studyQuestions.id,
          workbookId: studyQuestions.workbookId,
          prompt: studyQuestions.prompt,
          choices: studyQuestions.choices,
          answer: studyQuestions.answer,
          explanation: studyQuestions.explanation,
          difficulty: studyQuestions.difficulty,
          type: studyQuestions.type,
        })
        .from(studyQuestions)
        .where(eq(studyQuestions.id, input.questionId))
        .limit(1);

      if (!question) throw new TRPCError({ code: 'NOT_FOUND', message: '문항을 찾을 수 없습니다.' });

      // Check ownership
      const [workbook] = await db
        .select({ uploadedBy: studyWorkbooks.uploadedBy })
        .from(studyWorkbooks)
        .where(eq(studyWorkbooks.id, question.workbookId))
        .limit(1);

      if (!workbook) throw new TRPCError({ code: 'NOT_FOUND', message: '문제집을 찾을 수 없습니다.' });
      if (workbook.uploadedBy !== ctx.userId) throw new TRPCError({ code: 'FORBIDDEN', message: '수정 권한이 없습니다.' });

      // Prepare update values
      const updates: Partial<typeof studyQuestions.$inferInsert> = {};
      if (input.prompt !== undefined) updates.prompt = input.prompt;
      if (input.choices !== undefined) updates.choices = input.choices;
      if (input.answer !== undefined) updates.answer = input.answer;
      if (input.explanation !== undefined) updates.explanation = input.explanation;
      if (input.difficulty !== undefined) updates.difficulty = input.difficulty;
      if (input.type !== undefined) updates.type = input.type;
      updates.updatedAt = new Date();

      await db.update(studyQuestions).set(updates).where(eq(studyQuestions.id, input.questionId));

      return { updated: true };
    }),

  // ── 문제 숨김 ───────────────────────────────────────────────────────────────

  hideQuestion: protectedProcedure
    .input(z.object({ questionId: z.string().uuid(), hidden: z.boolean().default(true) }))
    .mutation(async ({ input, ctx }) => {
      const [question] = await db
        .select({ workbookId: studyQuestions.workbookId })
        .from(studyQuestions)
        .where(eq(studyQuestions.id, input.questionId))
        .limit(1);

      if (!question) throw new TRPCError({ code: 'NOT_FOUND', message: '문항을 찾을 수 없습니다.' });

      const [workbook] = await db
        .select({ uploadedBy: studyWorkbooks.uploadedBy })
        .from(studyWorkbooks)
        .where(eq(studyWorkbooks.id, question.workbookId))
        .limit(1);

      if (!workbook) throw new TRPCError({ code: 'NOT_FOUND', message: '문제집을 찾을 수 없습니다.' });
      if (workbook.uploadedBy !== ctx.userId) throw new TRPCError({ code: 'FORBIDDEN', message: '수정 권한이 없습니다.' });

      await db.update(studyQuestions).set({ isHidden: input.hidden, updatedAt: new Date() }).where(eq(studyQuestions.id, input.questionId));

      return { hidden: input.hidden };
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

  // ── 게임화 (Gamification) ──────────────────────────────────────────────────

  getMyProgress: protectedProcedure
    .query(async ({ ctx }) => {
      return await getMyProgress(ctx.userId);
    }),

  listRecentRewardEvents: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }).default({}))
    .query(async ({ input, ctx }) => {
      const events = await listRecentRewardEvents(ctx.userId, input.limit);
      return { events };
    }),

  getGrowthSummary: protectedProcedure
    .query(async ({ ctx }) => {
      const progress = await getMyProgress(ctx.userId);
      const recentEvents = await listRecentRewardEvents(ctx.userId, 5);

      return {
        level: progress?.level ?? 1,
        totalXp: progress?.totalXp ?? 0,
        totalPoints: progress?.totalPoints ?? 0,
        currentStreak: progress?.currentStreak ?? 0,
        longestStreak: progress?.longestStreak ?? 0,
        nextLevelProgress: progress?.progress ?? 0,
        recentEvents,
      };
    }),

  // ── 퀘스트 (Quests) ─────────────────────────────────────────────────────────

  getTodayQuests: protectedProcedure
    .query(async ({ ctx }) => {
      const quests = await getTodayQuests(ctx.userId);
      return { quests };
    }),

  getWeeklyQuests: protectedProcedure
    .query(async ({ ctx }) => {
      const quests = await getWeeklyQuests(ctx.userId);
      return { quests };
    }),

  getMonthlyQuests: protectedProcedure
    .query(async ({ ctx }) => {
      const quests = await getMonthlyQuests(ctx.userId);
      return { quests };
    }),

  getQuestSummary: protectedProcedure
    .query(async ({ ctx }) => {
      return await getQuestSummary(ctx.userId);
    }),

  claimQuestReward: protectedProcedure
    .input(z.object({ questId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const success = await claimQuestRewardInternal(ctx.userId, input.questId);
      if (!success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '퀘스트 보상을 받을 수 없습니다. 완료되지 않았거나 이미 받은 퀘스트입니다.',
        });
      }
      return { success: true };
    }),

  // ── P9: Public Workbook Repository ────────────────────────────────

  publishWorkbook: protectedProcedure
    .input(
      z.object({
        workbookId: z.string().uuid(),
        title: z.string().min(1).max(200),
        description: z.string().optional(),
        category: z.string().optional(),
        difficulty: z.string().optional(),
        tags: z.array(z.string()).default([]),
        licenseType: z.string().default('all-rights-reserved'),
        agreed: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!input.agreed) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '저작권 확인에 동의해야 합니다.',
        });
      }

      const [workbook] = await db
        .select({ uploadedBy: studyWorkbooks.uploadedBy })
        .from(studyWorkbooks)
        .where(eq(studyWorkbooks.id, input.workbookId))
        .limit(1);

      if (!workbook) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '문제집을 찾을 수 없습니다.' });
      }

      if (workbook.uploadedBy !== ctx.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: '본인의 문제집만 공개할 수 있습니다.' });
      }

      const now = new Date();
      const [publication] = await db
        .insert(studyWorkbookPublications)
        .values({
          workbookId: input.workbookId,
          ownerId: ctx.userId,
          title: input.title,
          description: input.description,
          category: input.category,
          difficulty: input.difficulty,
          tags: input.tags,
          visibility: 'public',
          status: 'published',
          licenseType: input.licenseType,
          publishedAt: now,
        })
        .onConflictDoUpdate({
          target: studyWorkbookPublications.workbookId,
          set: {
            title: input.title,
            description: input.description,
            category: input.category,
            difficulty: input.difficulty,
            tags: input.tags,
            visibility: 'public',
            status: 'published',
            publishedAt: now,
            updatedAt: now,
          },
        })
        .returning();

      await awardStudyReward({
        userId: ctx.userId,
        eventType: 'workbook_published',
        sourceType: 'workbook_publication',
        sourceId: publication.id,
        reason: `문제집 공개: ${input.title}`,
        idempotencyKey: `publish:${ctx.userId}:${input.workbookId}`,
      });

      // Evaluate and award badges (non-blocking)
      evaluateAndAwardBadges(ctx.userId).catch((err) => {
        console.error('Badge evaluation failed:', err);
      });

      return publication;
    }),

  unpublishWorkbook: protectedProcedure
    .input(z.object({ workbookId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const [pub] = await db
        .select()
        .from(studyWorkbookPublications)
        .where(
          and(
            eq(studyWorkbookPublications.workbookId, input.workbookId),
            eq(studyWorkbookPublications.ownerId, ctx.userId)
          )
        )
        .limit(1);

      if (!pub) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '공개 중인 문제집을 찾을 수 없습니다.' });
      }

      await db
        .update(studyWorkbookPublications)
        .set({ status: 'hidden', updatedAt: new Date() })
        .where(eq(studyWorkbookPublications.id, pub.id));

      return { status: 'hidden' };
    }),

  getMyWorkbookPublication: protectedProcedure
    .input(z.object({ workbookId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const [pub] = await db
        .select()
        .from(studyWorkbookPublications)
        .where(
          and(
            eq(studyWorkbookPublications.workbookId, input.workbookId),
            eq(studyWorkbookPublications.ownerId, ctx.userId)
          )
        )
        .limit(1);

      return pub ?? null;
    }),

  updateWorkbookPublication: protectedProcedure
    .input(
      z.object({
        workbookId: z.string().uuid(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        difficulty: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [pub] = await db
        .select()
        .from(studyWorkbookPublications)
        .where(
          and(
            eq(studyWorkbookPublications.workbookId, input.workbookId),
            eq(studyWorkbookPublications.ownerId, ctx.userId),
            eq(studyWorkbookPublications.status, 'published')
          )
        )
        .limit(1);

      if (!pub) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '공개 중인 문제집을 찾을 수 없습니다.' });
      }

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (input.title) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.difficulty !== undefined) updateData.difficulty = input.difficulty;
      if (input.tags !== undefined) updateData.tags = input.tags;

      await db
        .update(studyWorkbookPublications)
        .set(updateData)
        .where(eq(studyWorkbookPublications.id, pub.id));

      return { ...pub, ...updateData };
    }),

  listPublicWorkbooks: protectedProcedure
    .input(
      z.object({
        keyword: z.string().optional(),
        category: z.string().optional(),
        difficulty: z.string().optional(),
        sort: z.enum(['latest', 'rating', 'popularity', 'forks', 'likes', 'reviews']).default('latest'),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const conditions = [
        eq(studyWorkbookPublications.visibility, 'public'),
        eq(studyWorkbookPublications.status, 'published'),
      ];

      if (input.keyword) {
        conditions.push(sql`${studyWorkbookPublications.title} ILIKE '%' || ${input.keyword} || '%' OR ${studyWorkbookPublications.description} ILIKE '%' || ${input.keyword} || '%'`);
      }
      if (input.category) {
        conditions.push(eq(studyWorkbookPublications.category, input.category));
      }
      if (input.difficulty) {
        conditions.push(eq(studyWorkbookPublications.difficulty, input.difficulty));
      }

      let orderByClause = desc(studyWorkbookPublications.publishedAt);
      if (input.sort === 'rating') {
        orderByClause = desc(sql`${avg(studyWorkbookReviews.rating)}`);
      } else if (input.sort === 'popularity') {
        orderByClause = desc(
          sql`COUNT(DISTINCT ${studyWorkbookLikes.id}) * 2 + COUNT(DISTINCT ${studyWorkbookReviews.id}) * 3 + COALESCE(AVG(${studyWorkbookReviews.rating}), 0) * 10 + COUNT(DISTINCT ${studyWorkbookForks.id}) * 5`
        );
      } else if (input.sort === 'forks') {
        orderByClause = desc(sql`COUNT(DISTINCT ${studyWorkbookForks.id})`);
      } else if (input.sort === 'likes') {
        orderByClause = desc(sql`COUNT(DISTINCT ${studyWorkbookLikes.id})`);
      } else if (input.sort === 'reviews') {
        orderByClause = desc(sql`COUNT(DISTINCT ${studyWorkbookReviews.id})`);
      }

      const items = await db
        .select({
          id: studyWorkbookPublications.id,
          workbookId: studyWorkbookPublications.workbookId,
          title: studyWorkbookPublications.title,
          description: studyWorkbookPublications.description,
          category: studyWorkbookPublications.category,
          difficulty: studyWorkbookPublications.difficulty,
          tags: studyWorkbookPublications.tags,
          questionCount: count(studyQuestions.id),
          avgRating: avg(studyWorkbookReviews.rating),
          reviewCount: count(studyWorkbookReviews.id),
          likeCount: count(studyWorkbookLikes.id),
          forkCount: sql<number>`COUNT(DISTINCT ${studyWorkbookForks.id})`,
          publishedAt: studyWorkbookPublications.publishedAt,
        })
        .from(studyWorkbookPublications)
        .leftJoin(studyWorkbooks, eq(studyWorkbookPublications.workbookId, studyWorkbooks.id))
        .leftJoin(studyQuestions, eq(studyWorkbooks.id, studyQuestions.workbookId))
        .leftJoin(studyWorkbookReviews, eq(studyWorkbookPublications.id, studyWorkbookReviews.publicationId))
        .leftJoin(studyWorkbookLikes, eq(studyWorkbookPublications.id, studyWorkbookLikes.publicationId))
        .leftJoin(studyWorkbookForks, eq(studyWorkbookPublications.id, studyWorkbookForks.sourcePublicationId))
        .where(and(...conditions))
        .groupBy(studyWorkbookPublications.id)
        .orderBy(orderByClause)
        .limit(input.limit)
        .offset(input.offset);

      return { items };
    }),

  getPublicWorkbookDetail: protectedProcedure
    .input(z.object({ publicationId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const [publication] = await db
        .select()
        .from(studyWorkbookPublications)
        .where(
          and(
            eq(studyWorkbookPublications.id, input.publicationId),
            eq(studyWorkbookPublications.visibility, 'public'),
            eq(studyWorkbookPublications.status, 'published')
          )
        )
        .limit(1);

      if (!publication) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '공개된 문제집을 찾을 수 없습니다.' });
      }

      const [stats] = await db
        .select({
          questionCount: count(studyQuestions.id),
          avgRating: avg(studyWorkbookReviews.rating),
          reviewCount: count(studyWorkbookReviews.id),
          likeCount: count(studyWorkbookLikes.id),
        })
        .from(studyWorkbooks)
        .leftJoin(studyQuestions, eq(studyWorkbooks.id, studyQuestions.workbookId))
        .leftJoin(
          studyWorkbookReviews,
          and(eq(studyWorkbookPublications.id, studyWorkbookReviews.publicationId), eq(studyWorkbooks.id, studyWorkbookReviews.workbookId))
        )
        .leftJoin(
          studyWorkbookLikes,
          eq(studyWorkbookPublications.id, studyWorkbookLikes.publicationId)
        )
        .where(eq(studyWorkbooks.id, publication.workbookId));

      const recentReviews = await db
        .select()
        .from(studyWorkbookReviews)
        .where(eq(studyWorkbookReviews.publicationId, input.publicationId))
        .orderBy(desc(studyWorkbookReviews.createdAt))
        .limit(5);

      const [isLiked] = await db
        .select()
        .from(studyWorkbookLikes)
        .where(
          and(
            eq(studyWorkbookLikes.userId, ctx.userId),
            eq(studyWorkbookLikes.publicationId, input.publicationId)
          )
        )
        .limit(1);

      const [inLibrary] = await db
        .select()
        .from(studyUserLibrary)
        .where(
          and(
            eq(studyUserLibrary.userId, ctx.userId),
            eq(studyUserLibrary.sourcePublicationId, input.publicationId)
          )
        )
        .limit(1);

      const [myReview] = await db
        .select()
        .from(studyWorkbookReviews)
        .where(
          and(
            eq(studyWorkbookReviews.userId, ctx.userId),
            eq(studyWorkbookReviews.publicationId, input.publicationId)
          )
        )
        .limit(1);

      return {
        publication,
        questionCount: stats?.questionCount ?? 0,
        avgRating: stats?.avgRating ?? null,
        reviewCount: stats?.reviewCount ?? 0,
        likeCount: stats?.likeCount ?? 0,
        recentReviews,
        isLiked: !!isLiked,
        isInLibrary: !!inLibrary,
        myReview: myReview ?? null,
      };
    }),

  addPublicWorkbookToMyLibrary: protectedProcedure
    .input(z.object({ publicationId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const [pub] = await db
        .select()
        .from(studyWorkbookPublications)
        .where(
          and(
            eq(studyWorkbookPublications.id, input.publicationId),
            eq(studyWorkbookPublications.visibility, 'public'),
            eq(studyWorkbookPublications.status, 'published')
          )
        )
        .limit(1);

      if (!pub) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '공개된 문제집을 찾을 수 없습니다.' });
      }

      await db
        .insert(studyUserLibrary)
        .values({
          userId: ctx.userId,
          workbookId: pub.workbookId,
          sourcePublicationId: input.publicationId,
        })
        .onConflictDoNothing();

      return { added: true };
    }),

  removePublicWorkbookFromMyLibrary: protectedProcedure
    .input(z.object({ publicationId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(studyUserLibrary)
        .where(
          and(
            eq(studyUserLibrary.userId, ctx.userId),
            eq(studyUserLibrary.sourcePublicationId, input.publicationId)
          )
        );

      return { removed: true };
    }),

  listMyAddedPublicWorkbooks: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20), offset: z.number().min(0).default(0) }))
    .query(async ({ input, ctx }) => {
      const items = await db
        .select()
        .from(studyUserLibrary)
        .innerJoin(
          studyWorkbookPublications,
          eq(studyUserLibrary.sourcePublicationId, studyWorkbookPublications.id)
        )
        .where(eq(studyUserLibrary.userId, ctx.userId))
        .orderBy(desc(studyUserLibrary.addedAt))
        .limit(input.limit)
        .offset(input.offset);

      return {
        items: items.map((row) => row.study_workbook_publications),
      };
    }),

  checkLibraryStatus: protectedProcedure
    .input(z.object({ publicationId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const [inLibrary] = await db
        .select()
        .from(studyUserLibrary)
        .where(
          and(
            eq(studyUserLibrary.userId, ctx.userId),
            eq(studyUserLibrary.sourcePublicationId, input.publicationId)
          )
        )
        .limit(1);

      const [liked] = await db
        .select()
        .from(studyWorkbookLikes)
        .where(
          and(
            eq(studyWorkbookLikes.userId, ctx.userId),
            eq(studyWorkbookLikes.publicationId, input.publicationId)
          )
        )
        .limit(1);

      const [myReview] = await db
        .select()
        .from(studyWorkbookReviews)
        .where(
          and(
            eq(studyWorkbookReviews.userId, ctx.userId),
            eq(studyWorkbookReviews.publicationId, input.publicationId)
          )
        )
        .limit(1);

      return {
        inLibrary: !!inLibrary,
        liked: !!liked,
        myReview: myReview ?? null,
      };
    }),

  likeWorkbook: protectedProcedure
    .input(z.object({ publicationId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const [existing] = await db
        .select()
        .from(studyWorkbookLikes)
        .where(
          and(
            eq(studyWorkbookLikes.userId, ctx.userId),
            eq(studyWorkbookLikes.publicationId, input.publicationId)
          )
        )
        .limit(1);

      if (existing) {
        await db
          .delete(studyWorkbookLikes)
          .where(eq(studyWorkbookLikes.id, existing.id));
        return { liked: false };
      } else {
        await db
          .insert(studyWorkbookLikes)
          .values({
            userId: ctx.userId,
            publicationId: input.publicationId,
          });
        return { liked: true };
      }
    }),

  reviewWorkbook: protectedProcedure
    .input(
      z.object({
        publicationId: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [existing] = await db
        .select()
        .from(studyWorkbookReviews)
        .where(
          and(
            eq(studyWorkbookReviews.userId, ctx.userId),
            eq(studyWorkbookReviews.publicationId, input.publicationId)
          )
        )
        .limit(1);

      const [pub] = await db
        .select({
          workbookId: studyWorkbookPublications.workbookId,
          ownerId: studyWorkbookPublications.ownerId,
        })
        .from(studyWorkbookPublications)
        .where(eq(studyWorkbookPublications.id, input.publicationId))
        .limit(1);

      if (!pub) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '공개된 문제집을 찾을 수 없습니다.' });
      }

      let isNew = false;
      if (existing) {
        await db
          .update(studyWorkbookReviews)
          .set({ rating: input.rating, comment: input.comment, updatedAt: new Date() })
          .where(eq(studyWorkbookReviews.id, existing.id));
      } else {
        isNew = true;
        await db
          .insert(studyWorkbookReviews)
          .values({
            workbookId: pub.workbookId,
            publicationId: input.publicationId,
            userId: ctx.userId,
            rating: input.rating,
            comment: input.comment,
          });

        await awardStudyReward({
          userId: ctx.userId,
          eventType: 'review_created',
          sourceType: 'workbook_review',
          sourceId: input.publicationId,
          reason: '문제집 리뷰 작성',
          idempotencyKey: `review:${ctx.userId}:${input.publicationId}`,
        });

        // Create notification to publication owner (non-blocking)
        if (pub.ownerId !== ctx.userId) {
          createStudyNotification({
            userId: pub.ownerId,
            type: 'workbook_review',
            title: '문제집에 리뷰가 달렸어요',
            message: `${input.rating}⭐ "${input.comment?.substring(0, 50) || '좋아요'}"`,
            sourceType: 'publication',
            sourceId: input.publicationId,
            actorId: ctx.userId,
            idempotencyKey: `workbook_review:${input.publicationId}:${ctx.userId}`,
          }).catch((err) => {
            console.error('Failed to create workbook_review notification:', err);
          });
        }
      }

      const [review] = await db
        .select()
        .from(studyWorkbookReviews)
        .where(
          and(
            eq(studyWorkbookReviews.userId, ctx.userId),
            eq(studyWorkbookReviews.publicationId, input.publicationId)
          )
        )
        .limit(1);

      return { isNew, review };
    }),

  reportWorkbook: protectedProcedure
    .input(
      z.object({
        publicationId: z.string().uuid(),
        reason: z.string().min(1).max(100),
        detail: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [pub] = await db
        .select({ workbookId: studyWorkbookPublications.workbookId })
        .from(studyWorkbookPublications)
        .where(eq(studyWorkbookPublications.id, input.publicationId))
        .limit(1);

      if (!pub) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '공개된 문제집을 찾을 수 없습니다.' });
      }

      const [existing] = await db
        .select()
        .from(studyReports)
        .where(
          and(
            eq(studyReports.reporterId, ctx.userId),
            eq(studyReports.targetId, pub.workbookId)
          )
        )
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '이미 신고한 문제집입니다.',
        });
      }

      const [report] = await db
        .insert(studyReports)
        .values({
          targetType: 'workbook',
          targetId: pub.workbookId,
          reporterId: ctx.userId,
          reason: input.reason,
          detail: input.detail,
          status: 'open',
        })
        .returning();

      return { reported: true, reportId: report.id };
    }),

  // ──────────────────────────────────────────────────────────────────────
  // P10: Workbook Fork and Revision
  // ──────────────────────────────────────────────────────────────────────

  forkPublicWorkbook: protectedProcedure
    .input(
      z.object({
        publicationId: z.string().uuid(),
        newTitle: z.string().min(1).max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [pub] = await db
        .select()
        .from(studyWorkbookPublications)
        .where(eq(studyWorkbookPublications.id, input.publicationId))
        .limit(1);

      if (!pub) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '공개된 문제집을 찾을 수 없습니다.' });
      }

      if (pub.visibility !== 'public' || pub.status !== 'published') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '공개된 문제집만 fork할 수 있습니다.',
        });
      }

      const [sourceWorkbook] = await db
        .select()
        .from(studyWorkbooks)
        .where(eq(studyWorkbooks.id, pub.workbookId))
        .limit(1);

      if (!sourceWorkbook) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '원본 문제집을 찾을 수 없습니다.' });
      }

      // Create new forked workbook
      const [newWorkbook] = await db
        .insert(studyWorkbooks)
        .values({
          subjectId: sourceWorkbook.subjectId,
          uploadedBy: ctx.userId,
          originalFilename: input.newTitle || `${sourceWorkbook.originalFilename} (Fork)`,
          storageBucket: sourceWorkbook.storageBucket,
          storagePath: `${sourceWorkbook.storagePath}.fork.${Date.now()}`,
          fileHash: sourceWorkbook.fileHash,
          status: 'imported',
          metadata: {
            ...sourceWorkbook.metadata,
            forkedFrom: pub.workbookId,
            forkedFromPublicationId: input.publicationId,
          },
        })
        .returning();

      // Map old concept IDs to new ones
      const conceptMap = new Map<string, string>();
      const allConcepts = await db
        .select()
        .from(studyConcepts)
        .where(eq(studyConcepts.workbookId, pub.workbookId));

      for (const concept of allConcepts) {
        const [newConcept] = await db
          .insert(studyConcepts)
          .values({
            workbookId: newWorkbook.id,
            subjectId: concept.subjectId,
            parentId: concept.parentId ? conceptMap.get(concept.parentId) : null,
            externalId: concept.externalId,
            parentExternalId: concept.parentExternalId,
            title: concept.title,
            description: concept.description,
            orderIndex: concept.orderIndex,
            metadata: concept.metadata,
          })
          .returning();
        conceptMap.set(concept.id, newConcept.id);
      }

      // Map old seed IDs to new ones
      const seedMap = new Map<string, string>();
      const allSeeds = await db
        .select()
        .from(studySeeds)
        .where(eq(studySeeds.workbookId, pub.workbookId));

      for (const seed of allSeeds) {
        const [newSeed] = await db
          .insert(studySeeds)
          .values({
            workbookId: newWorkbook.id,
            subjectId: seed.subjectId,
            conceptId: seed.conceptId ? conceptMap.get(seed.conceptId) : null,
            externalId: seed.externalId,
            title: seed.title,
            content: seed.content,
            metadata: seed.metadata,
          })
          .returning();
        seedMap.set(seed.id, newSeed.id);
      }

      // Map old question IDs to new ones
      const questionMap = new Map<string, string>();
      const allQuestions = await db
        .select()
        .from(studyQuestions)
        .where(eq(studyQuestions.workbookId, pub.workbookId));

      for (const question of allQuestions) {
        const [newQuestion] = await db
          .insert(studyQuestions)
          .values({
            workbookId: newWorkbook.id,
            subjectId: question.subjectId,
            conceptId: question.conceptId ? conceptMap.get(question.conceptId) : null,
            seedId: question.seedId ? seedMap.get(question.seedId) : null,
            externalId: question.externalId,
            questionNo: question.questionNo,
            type: question.type,
            prompt: question.prompt,
            choices: question.choices,
            answer: question.answer,
            explanation: question.explanation,
            difficulty: question.difficulty,
            sourceSheet: question.sourceSheet,
            reviewStatus: question.reviewStatus,
            isActive: question.isActive,
            isHidden: question.isHidden,
            rowHash: question.rowHash,
            raw: question.raw,
          })
          .returning();
        questionMap.set(question.id, newQuestion.id);
      }

      // Copy exam sets and items with remapped question IDs
      const allExamSets = await db
        .select()
        .from(studyExamSets)
        .where(eq(studyExamSets.workbookId, pub.workbookId));

      for (const examSet of allExamSets) {
        const [newExamSet] = await db
          .insert(studyExamSets)
          .values({
            workbookId: newWorkbook.id,
            subjectId: examSet.subjectId,
            externalId: examSet.externalId,
            title: examSet.title,
            description: examSet.description,
            totalQuestions: examSet.totalQuestions,
            metadata: examSet.metadata,
          })
          .returning();

        const examSetItems = await db
          .select()
          .from(studyExamSetItems)
          .where(eq(studyExamSetItems.setId, examSet.id));

        for (const item of examSetItems) {
          const newQuestionId = questionMap.get(item.questionId);
          if (newQuestionId) {
            await db.insert(studyExamSetItems).values({
              setId: newExamSet.id,
              questionId: newQuestionId,
              position: item.position,
              points: item.points,
              metadata: item.metadata,
            });
          }
        }
      }

      // Record fork relationship
      await db.insert(studyWorkbookForks).values({
        sourceWorkbookId: pub.workbookId,
        sourcePublicationId: input.publicationId,
        forkedWorkbookId: newWorkbook.id,
        forkedBy: ctx.userId,
      });

      // Award fork reward
      const idempotencyKey = `fork:${ctx.userId}:${newWorkbook.id}`;
      await awardStudyReward({
        userId: ctx.userId,
        eventType: 'workbook_forked',
        sourceType: 'workbook_fork',
        sourceId: newWorkbook.id,
        reason: `문제집 Fork: ${pub.title}`,
        idempotencyKey,
      });

      // Create notification to publication owner (non-blocking)
      if (pub.ownerId !== ctx.userId) {
        createStudyNotification({
          userId: pub.ownerId,
          type: 'workbook_forked',
          title: '문제집이 복사되었어요',
          message: `"${pub.title}"이 복사되었습니다`,
          sourceType: 'publication',
          sourceId: input.publicationId,
          actorId: ctx.userId,
          idempotencyKey: `workbook_forked:${input.publicationId}:${newWorkbook.id}`,
        }).catch((err) => {
          console.error('Failed to create workbook_forked notification:', err);
        });
      }

      // Evaluate and award badges (non-blocking)
      evaluateAndAwardBadges(ctx.userId).catch((err) => {
        console.error('Badge evaluation failed:', err);
      });

      return {
        forkedWorkbookId: newWorkbook.id,
        title: newWorkbook.originalFilename,
      };
    }),

  getWorkbookForkInfo: protectedProcedure
    .input(z.object({ workbookId: z.string().uuid() }))
    .query(async ({ input }) => {
      const [fork] = await db
        .select()
        .from(studyWorkbookForks)
        .where(eq(studyWorkbookForks.forkedWorkbookId, input.workbookId))
        .limit(1);

      if (!fork) {
        return null;
      }

      const [pub] = await db
        .select()
        .from(studyWorkbookPublications)
        .where(eq(studyWorkbookPublications.id, fork.sourcePublicationId))
        .limit(1);

      if (!pub) {
        return null;
      }

      return {
        sourceWorkbookId: fork.sourceWorkbookId,
        sourcePublicationId: fork.sourcePublicationId,
        sourceTitle: pub.title,
        sourceCategory: pub.category,
        sourceDifficulty: pub.difficulty,
        forkedAt: fork.forkedAt,
      };
    }),

  listWorkbookForks: protectedProcedure
    .input(
      z.object({
        publicationId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const forks = await db
        .select()
        .from(studyWorkbookForks)
        .where(eq(studyWorkbookForks.sourcePublicationId, input.publicationId))
        .orderBy(desc(studyWorkbookForks.forkedAt))
        .limit(input.limit)
        .offset(input.offset);

      const forkCount = await db
        .select({ count: count() })
        .from(studyWorkbookForks)
        .where(eq(studyWorkbookForks.sourcePublicationId, input.publicationId));

      return {
        items: forks,
        total: forkCount[0]?.count ?? 0,
      };
    }),

  getSourceAttribution: protectedProcedure
    .input(z.object({ workbookId: z.string().uuid() }))
    .query(async ({ input }) => {
      const [fork] = await db
        .select()
        .from(studyWorkbookForks)
        .where(eq(studyWorkbookForks.forkedWorkbookId, input.workbookId))
        .limit(1);

      if (!fork) {
        return null;
      }

      const [pub] = await db
        .select()
        .from(studyWorkbookPublications)
        .where(eq(studyWorkbookPublications.id, fork.sourcePublicationId))
        .limit(1);

      if (!pub) {
        return null;
      }

      return {
        publicationId: pub.id,
        sourceTitle: pub.title,
        sourceCategory: pub.category,
        sourceDifficulty: pub.difficulty,
        forkedAt: fork.forkedAt,
      };
    }),

  // ──────────────────────────────────────────────────────────────────────
  // P11: Ranking and Recommendation
  // ──────────────────────────────────────────────────────────────────────

  listRankedWorkbooks: protectedProcedure
    .input(
      z.object({
        sort: z.enum(['latest', 'rating', 'popularity', 'forks', 'likes', 'reviews']).default('latest'),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const conditions = [
        eq(studyWorkbookPublications.visibility, 'public'),
        eq(studyWorkbookPublications.status, 'published'),
      ];

      let orderByClause = desc(studyWorkbookPublications.publishedAt);
      if (input.sort === 'rating') {
        orderByClause = desc(sql`${avg(studyWorkbookReviews.rating)}`);
      } else if (input.sort === 'popularity') {
        orderByClause = desc(
          sql`COUNT(DISTINCT ${studyWorkbookLikes.id}) * 2 + COUNT(DISTINCT ${studyWorkbookReviews.id}) * 3 + COALESCE(AVG(${studyWorkbookReviews.rating}), 0) * 10 + COUNT(DISTINCT ${studyWorkbookForks.id}) * 5`
        );
      } else if (input.sort === 'forks') {
        orderByClause = desc(sql`COUNT(DISTINCT ${studyWorkbookForks.id})`);
      } else if (input.sort === 'likes') {
        orderByClause = desc(sql`COUNT(DISTINCT ${studyWorkbookLikes.id})`);
      } else if (input.sort === 'reviews') {
        orderByClause = desc(sql`COUNT(DISTINCT ${studyWorkbookReviews.id})`);
      }

      const items = await db
        .select({
          id: studyWorkbookPublications.id,
          workbookId: studyWorkbookPublications.workbookId,
          title: studyWorkbookPublications.title,
          description: studyWorkbookPublications.description,
          category: studyWorkbookPublications.category,
          difficulty: studyWorkbookPublications.difficulty,
          tags: studyWorkbookPublications.tags,
          questionCount: count(studyQuestions.id),
          avgRating: avg(studyWorkbookReviews.rating),
          reviewCount: count(studyWorkbookReviews.id),
          likeCount: count(studyWorkbookLikes.id),
          forkCount: sql<number>`COUNT(DISTINCT ${studyWorkbookForks.id})`,
          publishedAt: studyWorkbookPublications.publishedAt,
        })
        .from(studyWorkbookPublications)
        .leftJoin(studyWorkbooks, eq(studyWorkbookPublications.workbookId, studyWorkbooks.id))
        .leftJoin(studyQuestions, eq(studyWorkbooks.id, studyQuestions.workbookId))
        .leftJoin(studyWorkbookReviews, eq(studyWorkbookPublications.id, studyWorkbookReviews.publicationId))
        .leftJoin(studyWorkbookLikes, eq(studyWorkbookPublications.id, studyWorkbookLikes.publicationId))
        .leftJoin(studyWorkbookForks, eq(studyWorkbookPublications.id, studyWorkbookForks.sourcePublicationId))
        .where(and(...conditions))
        .groupBy(studyWorkbookPublications.id)
        .orderBy(orderByClause)
        .limit(input.limit)
        .offset(input.offset);

      return { items };
    }),

  getWeeklyXpLeaderboard: protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const leaderboard = await db
        .select({
          userId: studyRewardEvents.userId,
          weeklyXp: sql<number>`SUM(${studyRewardEvents.xp})`,
        })
        .from(studyRewardEvents)
        .where(sql`${studyRewardEvents.createdAt} >= ${sevenDaysAgo}`)
        .groupBy(studyRewardEvents.userId)
        .orderBy(desc(sql`SUM(${studyRewardEvents.xp})`))
        .limit(20);

      const items: Array<{ rank: number; userId: string; displayName: string; level: number; weeklyXp: number }> = [];

      for (let i = 0; i < leaderboard.length; i++) {
        const row = leaderboard[i];
        const [profile] = await db
          .select({ displayName: profiles.displayName })
          .from(profiles)
          .where(eq(profiles.id, row.userId))
          .limit(1);

        const [progress] = await db
          .select({ level: studyUserProgress.level })
          .from(studyUserProgress)
          .where(eq(studyUserProgress.userId, row.userId))
          .limit(1);

        if (profile) {
          items.push({
            rank: i + 1,
            userId: row.userId,
            displayName: profile.displayName,
            level: progress?.level ?? 1,
            weeklyXp: row.weeklyXp,
          });
        }
      }

      let myRank: number | undefined;
      let myWeeklyXp: number | undefined;

      const [myStats] = await db
        .select({
          weeklyXp: sql<number>`SUM(${studyRewardEvents.xp})`,
        })
        .from(studyRewardEvents)
        .where(
          and(
            sql`${studyRewardEvents.createdAt} >= ${sevenDaysAgo}`,
            eq(studyRewardEvents.userId, ctx.userId)
          )
        )
        .groupBy(studyRewardEvents.userId);

      if (myStats) {
        myWeeklyXp = myStats.weeklyXp;
        myRank = items.findIndex((item) => item.userId === ctx.userId) + 1 || undefined;
      }

      return {
        items,
        myRank,
        myWeeklyXp,
      };
    }),

  getWeeklySolvedLeaderboard: protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const leaderboard = await db
        .select({
          userId: studyAttempts.userId,
          solvedCount: sql<number>`COUNT(*)`,
        })
        .from(studyAttempts)
        .where(sql`${studyAttempts.submittedAt} >= ${sevenDaysAgo}`)
        .groupBy(studyAttempts.userId)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(20);

      const items: Array<{ rank: number; userId: string; displayName: string; level: number; solvedCount: number }> = [];

      for (let i = 0; i < leaderboard.length; i++) {
        const row = leaderboard[i];
        const [profile] = await db
          .select({ displayName: profiles.displayName })
          .from(profiles)
          .where(eq(profiles.id, row.userId))
          .limit(1);

        const [progress] = await db
          .select({ level: studyUserProgress.level })
          .from(studyUserProgress)
          .where(eq(studyUserProgress.userId, row.userId))
          .limit(1);

        if (profile) {
          items.push({
            rank: i + 1,
            userId: row.userId,
            displayName: profile.displayName,
            level: progress?.level ?? 1,
            solvedCount: row.solvedCount,
          });
        }
      }

      let myRank: number | undefined;
      let mySolvedCount: number | undefined;

      const [myStats] = await db
        .select({
          solvedCount: sql<number>`COUNT(*)`,
        })
        .from(studyAttempts)
        .where(
          and(
            sql`${studyAttempts.submittedAt} >= ${sevenDaysAgo}`,
            eq(studyAttempts.userId, ctx.userId)
          )
        )
        .groupBy(studyAttempts.userId);

      if (myStats) {
        mySolvedCount = myStats.solvedCount;
        myRank = items.findIndex((item) => item.userId === ctx.userId) + 1 || undefined;
      }

      return {
        items,
        myRank,
        mySolvedCount,
      };
    }),

  getRecommendedWorkbooks: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(10).default(5),
      })
    )
    .query(async ({ input, ctx }) => {
      const items = await db
        .select({
          id: studyWorkbookPublications.id,
          workbookId: studyWorkbookPublications.workbookId,
          title: studyWorkbookPublications.title,
          description: studyWorkbookPublications.description,
          category: studyWorkbookPublications.category,
          difficulty: studyWorkbookPublications.difficulty,
          tags: studyWorkbookPublications.tags,
          questionCount: count(studyQuestions.id),
          avgRating: avg(studyWorkbookReviews.rating),
          reviewCount: count(studyWorkbookReviews.id),
          likeCount: count(studyWorkbookLikes.id),
          forkCount: sql<number>`COUNT(DISTINCT ${studyWorkbookForks.id})`,
          publishedAt: studyWorkbookPublications.publishedAt,
        })
        .from(studyWorkbookPublications)
        .leftJoin(studyWorkbooks, eq(studyWorkbookPublications.workbookId, studyWorkbooks.id))
        .leftJoin(studyQuestions, eq(studyWorkbooks.id, studyQuestions.workbookId))
        .leftJoin(studyWorkbookReviews, eq(studyWorkbookPublications.id, studyWorkbookReviews.publicationId))
        .leftJoin(studyWorkbookLikes, eq(studyWorkbookPublications.id, studyWorkbookLikes.publicationId))
        .leftJoin(studyWorkbookForks, eq(studyWorkbookPublications.id, studyWorkbookForks.sourcePublicationId))
        .where(
          and(
            eq(studyWorkbookPublications.visibility, 'public'),
            eq(studyWorkbookPublications.status, 'published'),
            sql`${studyWorkbookPublications.id} NOT IN (SELECT ${studyUserLibrary.sourcePublicationId} FROM ${studyUserLibrary} WHERE ${eq(studyUserLibrary.userId, ctx.userId)})`
          )
        )
        .groupBy(studyWorkbookPublications.id)
        .orderBy(
          desc(
            sql`COUNT(DISTINCT ${studyWorkbookLikes.id}) * 2 + COUNT(DISTINCT ${studyWorkbookReviews.id}) * 3 + COALESCE(AVG(${studyWorkbookReviews.rating}), 0) * 10 + COUNT(DISTINCT ${studyWorkbookForks.id}) * 5`
          )
        )
        .limit(input.limit);

      return { items };
    }),

  // ──────────────────────────────────────────────────────────────────────
  // P12: Discussion, Comments, and Moderation
  // ──────────────────────────────────────────────────────────────────────

  createComment: protectedProcedure
    .input(
      z.object({
        targetType: z.enum(['publication', 'question']),
        targetId: z.string().uuid(),
        body: z.string().min(1).max(2000),
        parentCommentId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validate publication is public/published
      if (input.targetType === 'publication') {
        const [pub] = await db
          .select()
          .from(studyWorkbookPublications)
          .where(
            and(
              eq(studyWorkbookPublications.id, input.targetId),
              eq(studyWorkbookPublications.visibility, 'public'),
              eq(studyWorkbookPublications.status, 'published')
            )
          )
          .limit(1);

        if (!pub) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '공개된 문제집을 찾을 수 없습니다.',
          });
        }
      }

      // Validate question exists
      if (input.targetType === 'question') {
        const [question] = await db
          .select()
          .from(studyQuestions)
          .where(eq(studyQuestions.id, input.targetId))
          .limit(1);

        if (!question) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '문항을 찾을 수 없습니다.' });
        }
      }

      // Validate parent comment if provided
      let parentComment: (typeof studyComments.$inferSelect) | null = null;
      if (input.parentCommentId) {
        const [parent] = await db
          .select()
          .from(studyComments)
          .where(eq(studyComments.id, input.parentCommentId))
          .limit(1);

        if (!parent) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '댓글을 찾을 수 없습니다.' });
        }

        // Enforce 1-level nesting: parent's parent must be null
        if (parent.parentCommentId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '대댓글에 대한 댓글은 작성할 수 없습니다.',
          });
        }

        parentComment = parent;
      }

      const [comment] = await db
        .insert(studyComments)
        .values({
          targetType: input.targetType,
          targetId: input.targetId,
          authorId: ctx.userId,
          body: input.body,
          parentCommentId: input.parentCommentId,
          status: 'active',
        })
        .returning();

      // Award XP
      await awardStudyReward({
        userId: ctx.userId,
        eventType: 'comment_created',
        sourceType: 'study_comment',
        sourceId: comment.id,
        idempotencyKey: `comment_created:${comment.id}`,
      });

      // Create notifications (non-blocking)
      // 1. Reply notification to parent comment author
      if (parentComment) {
        createStudyNotification({
          userId: parentComment.authorId,
          type: 'comment_reply',
          title: '새로운 대댓글',
          message: `"${input.body.substring(0, 50)}"에 대댓글이 달렸어요`,
          sourceType: 'comment',
          sourceId: comment.id,
          actorId: ctx.userId,
          idempotencyKey: `comment_reply:${parentComment.id}:${comment.id}`,
        }).catch((err) => {
          console.error('Failed to create comment_reply notification:', err);
        });
      }

      // 2. Publication comment notification to owner
      if (input.targetType === 'publication') {
        const [pub] = await db
          .select({ ownerId: studyWorkbookPublications.ownerId })
          .from(studyWorkbookPublications)
          .where(eq(studyWorkbookPublications.id, input.targetId))
          .limit(1);

        if (pub && pub.ownerId !== ctx.userId) {
          createStudyNotification({
            userId: pub.ownerId,
            type: 'workbook_comment',
            title: '문제집에 댓글이 달렸어요',
            message: `"${input.body.substring(0, 50)}"`,
            sourceType: 'publication',
            sourceId: input.targetId,
            actorId: ctx.userId,
            idempotencyKey: `workbook_comment:${input.targetId}:${comment.id}`,
          }).catch((err) => {
            console.error('Failed to create workbook_comment notification:', err);
          });
        }
      }

      // Evaluate and award badges (non-blocking)
      evaluateAndAwardBadges(ctx.userId).catch((err) => {
        console.error('Badge evaluation failed:', err);
      });

      return comment;
    }),

  listCommentsByTarget: protectedProcedure
    .input(
      z.object({
        targetType: z.enum(['publication', 'question']),
        targetId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const comments = await db
        .select({
          id: studyComments.id,
          targetType: studyComments.targetType,
          targetId: studyComments.targetId,
          authorId: studyComments.authorId,
          body: studyComments.body,
          parentCommentId: studyComments.parentCommentId,
          status: studyComments.status,
          likeCount: studyComments.likeCount,
          createdAt: studyComments.createdAt,
          updatedAt: studyComments.updatedAt,
          authorDisplayName: profiles.displayName,
        })
        .from(studyComments)
        .leftJoin(profiles, eq(studyComments.authorId, profiles.id))
        .where(
          and(
            eq(studyComments.targetType, input.targetType),
            eq(studyComments.targetId, input.targetId)
          )
        )
        .orderBy(asc(studyComments.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Build nested structure with replies
      const topLevel = comments.filter((c) => !c.parentCommentId);
      const replies = comments.filter((c) => c.parentCommentId);

      const topLevelWithReplies = topLevel.map((comment) => ({
        ...comment,
        isAuthor: comment.authorId === ctx.userId,
        replies: replies.filter((r) => r.parentCommentId === comment.id).map((r) => ({
          ...r,
          isAuthor: r.authorId === ctx.userId,
        })),
      }));

      const total = await db
        .select({ count: count() })
        .from(studyComments)
        .where(
          and(
            eq(studyComments.targetType, input.targetType),
            eq(studyComments.targetId, input.targetId)
          )
        );

      return {
        items: topLevelWithReplies,
        total: total[0]?.count ?? 0,
      };
    }),

  updateMyComment: protectedProcedure
    .input(z.object({ commentId: z.string().uuid(), body: z.string().min(1).max(2000) }))
    .mutation(async ({ input, ctx }) => {
      const [comment] = await db
        .select()
        .from(studyComments)
        .where(eq(studyComments.id, input.commentId))
        .limit(1);

      if (!comment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '댓글을 찾을 수 없습니다.' });
      }

      if (comment.authorId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '본인의 댓글만 수정할 수 있습니다.',
        });
      }

      if (comment.status !== 'active') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '활성 댓글만 수정할 수 있습니다.',
        });
      }

      const [updated] = await db
        .update(studyComments)
        .set({ body: input.body, updatedAt: new Date() })
        .where(eq(studyComments.id, input.commentId))
        .returning();

      return updated;
    }),

  deleteMyComment: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const [comment] = await db
        .select()
        .from(studyComments)
        .where(eq(studyComments.id, input.commentId))
        .limit(1);

      if (!comment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '댓글을 찾을 수 없습니다.' });
      }

      if (comment.authorId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '본인의 댓글만 삭제할 수 있습니다.',
        });
      }

      await db.update(studyComments).set({ status: 'deleted' }).where(eq(studyComments.id, input.commentId));

      return { deleted: true };
    }),

  toggleCommentLike: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const [comment] = await db
        .select()
        .from(studyComments)
        .where(eq(studyComments.id, input.commentId))
        .limit(1);

      if (!comment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '댓글을 찾을 수 없습니다.' });
      }

      const [existing] = await db
        .select()
        .from(studyCommentLikes)
        .where(and(eq(studyCommentLikes.commentId, input.commentId), eq(studyCommentLikes.userId, ctx.userId)))
        .limit(1);

      let liked = false;
      if (existing) {
        await db
          .delete(studyCommentLikes)
          .where(
            and(
              eq(studyCommentLikes.commentId, input.commentId),
              eq(studyCommentLikes.userId, ctx.userId)
            )
          );

        await db
          .update(studyComments)
          .set({ likeCount: sql`${studyComments.likeCount} - 1` })
          .where(eq(studyComments.id, input.commentId));
      } else {
        await db.insert(studyCommentLikes).values({ commentId: input.commentId, userId: ctx.userId });

        await db
          .update(studyComments)
          .set({ likeCount: sql`${studyComments.likeCount} + 1` })
          .where(eq(studyComments.id, input.commentId));

        liked = true;
      }

      const [updatedComment] = await db
        .select({ likeCount: studyComments.likeCount })
        .from(studyComments)
        .where(eq(studyComments.id, input.commentId));

      return { liked, likeCount: updatedComment?.likeCount ?? 0 };
    }),

  reportComment: protectedProcedure
    .input(z.object({ commentId: z.string().uuid(), reason: z.string().min(1).max(100), detail: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const [comment] = await db
        .select()
        .from(studyComments)
        .where(eq(studyComments.id, input.commentId))
        .limit(1);

      if (!comment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '댓글을 찾을 수 없습니다.' });
      }

      const [report] = await db
        .insert(studyReports)
        .values({
          targetType: 'comment',
          targetId: input.commentId,
          reporterId: ctx.userId,
          reason: input.reason,
          detail: input.detail,
          status: 'open',
        })
        .returning();

      return { reported: true, reportId: report.id };
    }),

  reportQuestion: protectedProcedure
    .input(z.object({ questionId: z.string().uuid(), reason: z.string().min(1).max(100), detail: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const [question] = await db
        .select()
        .from(studyQuestions)
        .where(eq(studyQuestions.id, input.questionId))
        .limit(1);

      if (!question) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '문항을 찾을 수 없습니다.' });
      }

      const [report] = await db
        .insert(studyReports)
        .values({
          targetType: 'question',
          targetId: input.questionId,
          reporterId: ctx.userId,
          reason: input.reason,
          detail: input.detail,
          status: 'open',
        })
        .returning();

      return { reported: true, reportId: report.id };
    }),

  listReportsForAdmin: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50), offset: z.number().min(0).default(0) }))
    .query(async ({ input, ctx }) => {
      // Check if user is admin
      const [profile] = await db.select().from(profiles).where(eq(profiles.id, ctx.userId)).limit(1);

      if (!profile || profile.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '관리자만 접근할 수 있습니다.',
        });
      }

      const reports = await db
        .select({
          id: studyReports.id,
          targetType: studyReports.targetType,
          targetId: studyReports.targetId,
          reason: studyReports.reason,
          detail: studyReports.detail,
          status: studyReports.status,
          reporterDisplayName: profiles.displayName,
          createdAt: studyReports.createdAt,
        })
        .from(studyReports)
        .leftJoin(profiles, eq(studyReports.reporterId, profiles.id))
        .orderBy(desc(studyReports.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const total = await db.select({ count: count() }).from(studyReports);

      return {
        items: reports,
        total: total[0]?.count ?? 0,
      };
    }),

  createAiGenerationJob: protectedProcedure
    .input(z.object({
      jobId: z.string().uuid(),
      fileName: z.string(),
      fileSize: z.number().int().positive(),
      extractedText: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const job = await db.insert(studyAiGenerationJobs).values({
        id: input.jobId,
        userId: ctx.userId,
        sourceType: 'pdf',
        sourceFileName: input.fileName,
        sourceFileSize: input.fileSize,
        status: 'extracting',
        progress: 0,
        extractedTextPreview: input.extractedText.substring(0, 500),
      }).returning();

      return job[0];
    }),

  getAiGenerationJob: protectedProcedure
    .input(z.object({ jobId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const job = await db.query.studyAiGenerationJobs.findFirst({
        where: and(
          eq(studyAiGenerationJobs.id, input.jobId),
          eq(studyAiGenerationJobs.userId, ctx.userId)
        ),
      });

      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'AI generation job을 찾을 수 없습니다.' });
      }

      return job;
    }),

  listMyAiGenerationJobs: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const jobs = await db.select()
        .from(studyAiGenerationJobs)
        .where(eq(studyAiGenerationJobs.userId, ctx.userId))
        .orderBy(desc(studyAiGenerationJobs.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const total = await db.select({ count: count() })
        .from(studyAiGenerationJobs)
        .where(eq(studyAiGenerationJobs.userId, ctx.userId));

      return {
        items: jobs,
        total: total[0]?.count ?? 0,
      };
    }),

  getGeneratedWorkbookPreview: protectedProcedure
    .input(z.object({ jobId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const job = await db.query.studyAiGenerationJobs.findFirst({
        where: and(
          eq(studyAiGenerationJobs.id, input.jobId),
          eq(studyAiGenerationJobs.userId, ctx.userId)
        ),
      });

      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'AI generation job을 찾을 수 없습니다.' });
      }

      if (job.status === 'pending' || job.status === 'extracting' || job.status === 'generating') {
        return {
          status: job.status,
          progress: job.progress,
          payload: null,
        };
      }

      if (job.status === 'failed') {
        return {
          status: 'failed',
          progress: job.progress,
          error: job.errorPayload,
          payload: null,
        };
      }

      return {
        status: job.status,
        progress: 100,
        payload: job.resultPayload,
      };
    }),

  updateAiGenerationJobStatus: protectedProcedure
    .input(z.object({
      jobId: z.string().uuid(),
      status: z.enum(['pending', 'extracting', 'generating', 'ready', 'failed', 'cancelled']),
      progress: z.number().int().min(0).max(100),
      resultPayload: z.record(z.unknown()).optional(),
      errorPayload: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const job = await db.query.studyAiGenerationJobs.findFirst({
        where: eq(studyAiGenerationJobs.id, input.jobId),
      });

      if (!job || job.userId !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'AI generation job을 찾을 수 없습니다.' });
      }

      const updated = await db.update(studyAiGenerationJobs)
        .set({
          status: input.status,
          progress: input.progress,
          resultPayload: input.resultPayload,
          errorPayload: input.errorPayload,
        })
        .where(eq(studyAiGenerationJobs.id, input.jobId))
        .returning();

      return updated[0];
    }),

  createWorkbookFromAiDraft: protectedProcedure
    .input(z.object({
      jobId: z.string().uuid(),
      selectedQuestionIds: z.array(z.string()).optional(),
      title: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const job = await db.query.studyAiGenerationJobs.findFirst({
        where: eq(studyAiGenerationJobs.id, input.jobId),
      });

      if (!job || job.userId !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'AI generation job을 찾을 수 없습니다.' });
      }

      if (job.status !== 'ready') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '생성이 완료되지 않은 작업입니다.' });
      }

      if (job.appliedWorkbookId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '이미 문제은행으로 저장된 작업입니다.' });
      }

      // Use server action to apply draft
      // For now, we'll implement a simplified version inline
      const { randomUUID } = await import('node:crypto');
      const workbookId = randomUUID();

      const draft = job.resultPayload?.draft as any;
      if (!draft) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '생성된 초안을 찾을 수 없습니다.' });
      }

      try {
        // Create workbook
        const [workbook] = await db
          .insert(studyWorkbooks)
          .values({
            id: workbookId,
            uploadedBy: ctx.userId,
            originalFilename: input.title || draft.workbook.title,
            storageBucket: 'study-workbooks',
            storagePath: `ai-draft/${ctx.userId}/${workbookId}`,
            status: 'uploaded',
            metadata: {
              aiGenerated: true,
              aiJobId: input.jobId,
              needsReview: true,
              description: input.description || draft.workbook.description,
            },
          })
          .returning();

        if (!workbook) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '문제은행 생성에 실패했습니다.' });
        }

        // Create concepts
        const conceptIdMap = new Map<string, string>();
        if (draft.concepts?.length > 0) {
          const concepts = await db
            .insert(studyConcepts)
            .values(
              draft.concepts.map((c: any) => ({
                workbookId,
                externalId: c.externalId,
                title: c.title,
                description: c.description,
                orderIndex: c.orderIndex || 0,
                metadata: { aiGenerated: true },
              }))
            )
            .returning({ id: studyConcepts.id, externalId: studyConcepts.externalId });

          concepts.forEach((c) => conceptIdMap.set(c.externalId, c.id));
        }

        // Create seeds
        const seedIdMap = new Map<string, string>();
        if (draft.seeds?.length > 0) {
          const seeds = await db
            .insert(studySeeds)
            .values(
              draft.seeds.map((s: any) => ({
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
        const selectedIds = input.selectedQuestionIds ? new Set(input.selectedQuestionIds) : undefined;
        const questionIdMap = new Map<string, string>();
        if (draft.questions?.length > 0) {
          const questionsToInsert = selectedIds
            ? draft.questions.filter((q: any) => selectedIds.has(q.externalId))
            : draft.questions;

          if (questionsToInsert.length > 0) {
            const questions = await db
              .insert(studyQuestions)
              .values(
                questionsToInsert.map((q: any) => ({
                  workbookId,
                  conceptId: q.conceptExternalId ? conceptIdMap.get(q.conceptExternalId) : undefined,
                  seedId: q.seedExternalId ? seedIdMap.get(q.seedExternalId) : undefined,
                  externalId: q.externalId,
                  questionNo: q.questionNo,
                  type: q.type,
                  prompt: q.prompt,
                  choices: q.choices,
                  answer: q.answer,
                  explanation: q.explanation,
                  difficulty: q.difficulty,
                  sourceSheet: '05_정식문제은행',
                  reviewStatus: 'draft',
                  isActive: true,
                  isHidden: false,
                  raw: q,
                  metadata: { aiGenerated: true, needsReview: true },
                }))
              )
              .returning({ id: studyQuestions.id, externalId: studyQuestions.externalId });

            questions.forEach((q) => questionIdMap.set(q.externalId, q.id));
          }
        }

        // Create exam sets
        if (draft.examSets?.length > 0) {
          for (const set of draft.examSets) {
            const [examSet] = await db
              .insert(studyExamSets)
              .values({
                workbookId,
                externalId: set.externalId,
                title: set.title,
                description: set.description,
                totalQuestions: set.items?.length ?? 0,
                metadata: { aiGenerated: true },
              })
              .returning({ id: studyExamSets.id });

            if (examSet && set.items?.length > 0) {
              await db
                .insert(studyExamSetItems)
                .values(
                  set.items
                    .filter((item: any) => questionIdMap.has(item.externalQuestionId))
                    .map((item: any) => ({
                      setId: examSet.id,
                      questionId: questionIdMap.get(item.externalQuestionId)!,
                      position: item.position,
                      points: item.points || '1',
                      metadata: {},
                    }))
                );
            }
          }
        }

        // Update job
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
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `문제은행 생성 실패: ${error.message}`,
        });
      }
    }),

  updateQuestionReviewStatus: protectedProcedure
    .input(z.object({
      questionId: z.string().uuid(),
      status: z.enum(['approved', 'needs_fix', 'rejected', 'draft']),
    }))
    .mutation(async ({ input, ctx }) => {
      const question = await db.query.studyQuestions.findFirst({
        where: eq(studyQuestions.id, input.questionId),
      });

      if (!question) {
        throw new TRPCError({ code: 'NOT_FOUND', message: '문제를 찾을 수 없습니다.' });
      }

      const workbook = await db.query.studyWorkbooks.findFirst({
        where: eq(studyWorkbooks.id, question.workbookId),
      });

      if (!workbook || workbook.uploadedBy !== ctx.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: '이 문제를 수정할 권한이 없습니다.' });
      }

      await db
        .update(studyQuestions)
        .set({ reviewStatus: input.status })
        .where(eq(studyQuestions.id, input.questionId));

      return { success: true };
    }),

  // ──────────────────────────────────────────────────────────────────────
  // GROWTH-1: Badges and Learning Analytics
  // ──────────────────────────────────────────────────────────────────────

  getMyBadges: protectedProcedure.query(async ({ ctx }) => {
    const badges = await db
      .select({
        id: studyBadges.id,
        code: studyBadges.code,
        title: studyBadges.title,
        description: studyBadges.description,
        icon: studyBadges.icon,
        category: studyBadges.category,
        earnedAt: studyUserBadges.earnedAt,
      })
      .from(studyUserBadges)
      .innerJoin(studyBadges, eq(studyUserBadges.badgeId, studyBadges.id))
      .where(eq(studyUserBadges.userId, ctx.userId))
      .orderBy(desc(studyUserBadges.earnedAt));

    return badges;
  }),

  getBadgeCollection: protectedProcedure.query(async ({ ctx }) => {
    const allBadges = await db
      .select({
        id: studyBadges.id,
        code: studyBadges.code,
        title: studyBadges.title,
        description: studyBadges.description,
        icon: studyBadges.icon,
        category: studyBadges.category,
        conditionType: studyBadges.conditionType,
        conditionValue: studyBadges.conditionValue,
      })
      .from(studyBadges)
      .where(eq(studyBadges.isActive, true))
      .orderBy(asc(studyBadges.category), asc(studyBadges.createdAt));

    const earned = await db
      .select({ badgeId: studyUserBadges.badgeId, earnedAt: studyUserBadges.earnedAt })
      .from(studyUserBadges)
      .where(eq(studyUserBadges.userId, ctx.userId));

    const earnedMap = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));

    return allBadges.map((badge) => ({
      ...badge,
      earned: earnedMap.has(badge.id),
      earnedAt: earnedMap.get(badge.id),
    }));
  }),

  getLearningAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Heatmap: attempts by date for past 30 days
    const heatmapRaw = await db
      .select({
        date: sql<string>`DATE(${studyAttempts.submittedAt})`,
        count: count(),
        correct: count(sql`CASE WHEN ${studyAttempts.isCorrect} = true THEN 1 END`),
      })
      .from(studyAttempts)
      .where(and(eq(studyAttempts.userId, ctx.userId), sql`${studyAttempts.submittedAt} >= ${thirtyDaysAgo}`))
      .groupBy(sql`DATE(${studyAttempts.submittedAt})`)
      .orderBy(sql`DATE(${studyAttempts.submittedAt})`);

    // Type accuracy
    const typeAccuracyRaw = await db
      .select({
        type: sql<string>`COALESCE(${studyQuestions.type}, 'unknown')`,
        total: count(),
        correct: count(sql`CASE WHEN ${studyAttempts.isCorrect} = true THEN 1 END`),
      })
      .from(studyAttempts)
      .leftJoin(studyQuestions, eq(studyAttempts.questionId, studyQuestions.id))
      .where(eq(studyAttempts.userId, ctx.userId))
      .groupBy(studyQuestions.type);

    // Concept accuracy (top 20)
    const conceptAccuracyRaw = await db
      .select({
        conceptId: studyConcepts.id,
        title: studyConcepts.title,
        total: count(),
        correct: count(sql`CASE WHEN ${studyAttempts.isCorrect} = true THEN 1 END`),
      })
      .from(studyAttempts)
      .leftJoin(studyQuestions, eq(studyAttempts.questionId, studyQuestions.id))
      .leftJoin(studyConcepts, eq(studyQuestions.conceptId, studyConcepts.id))
      .where(eq(studyAttempts.userId, ctx.userId))
      .groupBy(studyConcepts.id, studyConcepts.title)
      .orderBy(desc(count()))
      .limit(20);

    // Weak concepts: lowest accuracy
    const weakConceptsRaw = await db
      .select({
        conceptId: studyConcepts.id,
        title: studyConcepts.title,
        total: count(),
        correct: count(sql`CASE WHEN ${studyAttempts.isCorrect} = true THEN 1 END`),
      })
      .from(studyAttempts)
      .leftJoin(studyQuestions, eq(studyAttempts.questionId, studyQuestions.id))
      .leftJoin(studyConcepts, eq(studyQuestions.conceptId, studyConcepts.id))
      .where(eq(studyAttempts.userId, ctx.userId))
      .groupBy(studyConcepts.id, studyConcepts.title)
      .having(sql`count(*) >= 5`)
      .orderBy(
        sql`CAST(CAST(count(CASE WHEN ${studyAttempts.isCorrect} = true THEN 1 END) AS FLOAT) / COUNT(*) AS FLOAT) ASC`
      )
      .limit(5);

    // Wrong note mastery
    const wrongNoteCounts = await db
      .select({
        status: studyWrongNotes.status,
        count: count(),
      })
      .from(studyWrongNotes)
      .where(eq(studyWrongNotes.userId, ctx.userId))
      .groupBy(studyWrongNotes.status);

    const wrongNoteMap = new Map(wrongNoteCounts.map((w) => [w.status, w.count]));
    const totalWrongNotes = Array.from(wrongNoteMap.values()).reduce((a, b) => a + b, 0);
    const masteredWrongNotes = wrongNoteMap.get('mastered') || 0;

    // Recent summary
    const last7DaysStats = await db
      .select({
        total: count(),
        correct: count(sql`CASE WHEN ${studyAttempts.isCorrect} = true THEN 1 END`),
      })
      .from(studyAttempts)
      .where(and(eq(studyAttempts.userId, ctx.userId), sql`${studyAttempts.submittedAt} >= ${sevenDaysAgo}`));

    const last30DaysStats = await db
      .select({
        total: count(),
        correct: count(sql`CASE WHEN ${studyAttempts.isCorrect} = true THEN 1 END`),
      })
      .from(studyAttempts)
      .where(and(eq(studyAttempts.userId, ctx.userId), sql`${studyAttempts.submittedAt} >= ${thirtyDaysAgo}`));

    return {
      heatmap: heatmapRaw.map((h) => ({
        date: h.date,
        count: h.count,
        correct: h.correct,
      })),
      typeAccuracy: typeAccuracyRaw.map((t) => ({
        type: t.type,
        total: t.total,
        correct: t.correct,
        accuracy: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
      })),
      conceptAccuracy: conceptAccuracyRaw
        .filter((c) => c.title)
        .map((c) => ({
          conceptId: c.conceptId,
          title: c.title!,
          total: c.total,
          correct: c.correct,
          accuracy: c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0,
        })),
      weakConcepts: weakConceptsRaw
        .filter((w) => w.title)
        .map((w) => ({
          conceptId: w.conceptId,
          title: w.title!,
          accuracy: w.total > 0 ? Math.round((w.correct / w.total) * 100) : 0,
          total: w.total,
        })),
      wrongNoteMastery: {
        total: totalWrongNotes,
        mastered: masteredWrongNotes,
        reviewing: wrongNoteMap.get('reviewing') || 0,
        open: wrongNoteMap.get('open') || 0,
        masteryRate: totalWrongNotes > 0 ? Math.round((masteredWrongNotes / totalWrongNotes) * 100) : 0,
      },
      recentSummary: {
        last7DaysAttempts: last7DaysStats[0]?.total || 0,
        last30DaysAttempts: last30DaysStats[0]?.total || 0,
        last7DaysAccuracy: last7DaysStats[0]?.total ? Math.round(((last7DaysStats[0].correct || 0) / last7DaysStats[0].total) * 100) : 0,
        last30DaysAccuracy: last30DaysStats[0]?.total ? Math.round(((last30DaysStats[0].correct || 0) / last30DaysStats[0].total) * 100) : 0,
      },
    };
  }),

  // ──────────────────────────────────────────────────────────────────────
  // NOTIFY-1: In-App Notifications
  // ──────────────────────────────────────────────────────────────────────

  listMyNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      const whereCondition = input.unreadOnly
        ? and(eq(studyNotifications.userId, ctx.userId), isNull(studyNotifications.readAt))
        : eq(studyNotifications.userId, ctx.userId);

      const notifications = await db
        .select({
          id: studyNotifications.id,
          type: studyNotifications.type,
          title: studyNotifications.title,
          message: studyNotifications.message,
          sourceType: studyNotifications.sourceType,
          sourceId: studyNotifications.sourceId,
          actorId: studyNotifications.actorId,
          readAt: studyNotifications.readAt,
          metadata: studyNotifications.metadata,
          createdAt: studyNotifications.createdAt,
        })
        .from(studyNotifications)
        .where(whereCondition)
        .orderBy(desc(studyNotifications.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const total = await db
        .select({ count: count() })
        .from(studyNotifications)
        .where(whereCondition);

      const unreadCount = await db
        .select({ count: count() })
        .from(studyNotifications)
        .where(and(eq(studyNotifications.userId, ctx.userId), isNull(studyNotifications.readAt)));

      return {
        notifications,
        total: total[0]?.count || 0,
        unreadCount: unreadCount[0]?.count || 0,
        hasMore: (input.offset + input.limit) < (total[0]?.count || 0),
      };
    }),

  getUnreadNotificationCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await getUnreadNotificationCount(ctx.userId);
    return count;
  }),

  markNotificationRead: protectedProcedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const result = await markNotificationRead(input.notificationId);
      return { success: result };
    }),

  markAllNotificationsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await markAllNotificationsRead(ctx.userId);
    return { success: result };
  }),
});
