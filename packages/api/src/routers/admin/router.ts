import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { and, desc, eq, inArray, count } from 'drizzle-orm';
import {
  db,
  profiles,
  studyReports,
  studyComments,
  studyQuestions,
  studyWorkbookPublications,
  studyQuests,
  studyAiGenerationJobs,
} from '@repo/db';
import { protectedProcedure, router } from '../../trpc.js';

const requireAdmin = async (userId: string) => {
  const user = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  });

  if (!user || user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin 권한이 필요합니다.',
    });
  }

  return user;
};

export const adminRouter = router({
  // Admin Overview
  getAdminOverview: protectedProcedure.query(async ({ ctx }) => {
    await requireAdmin(ctx.userId);

    const [reportsOpen] = await db
      .select({ count: count() })
      .from(studyReports)
      .where(eq(studyReports.status, 'open'));

    const [reportsReviewing] = await db
      .select({ count: count() })
      .from(studyReports)
      .where(eq(studyReports.status, 'reviewing'));

    const [publishedWorkbooks] = await db
      .select({ count: count() })
      .from(studyWorkbookPublications)
      .where(eq(studyWorkbookPublications.status, 'published'));

    const [reportedWorkbooks] = await db
      .select({ count: count() })
      .from(studyWorkbookPublications)
      .where(eq(studyWorkbookPublications.status, 'reported'));

    const [activeQuests] = await db
      .select({ count: count() })
      .from(studyQuests)
      .where(eq(studyQuests.isActive, true));

    const [aiJobsPending] = await db
      .select({ count: count() })
      .from(studyAiGenerationJobs)
      .where(
        inArray(studyAiGenerationJobs.status, [
          'pending',
          'extracting',
          'generating',
        ])
      );

    const [aiJobsFailed] = await db
      .select({ count: count() })
      .from(studyAiGenerationJobs)
      .where(eq(studyAiGenerationJobs.status, 'failed'));

    const [aiJobsReady] = await db
      .select({ count: count() })
      .from(studyAiGenerationJobs)
      .where(eq(studyAiGenerationJobs.status, 'ready'));

    const [questionsNeedsReview] = await db
      .select({ count: count() })
      .from(studyQuestions)
      .where(inArray(studyQuestions.reviewStatus, ['draft', 'needs_fix']));

    const [commentsReported] = await db
      .select({ count: count() })
      .from(studyComments)
      .where(eq(studyComments.status, 'reported'));

    return {
      reportsOpenCount: reportsOpen?.count ?? 0,
      reportsReviewingCount: reportsReviewing?.count ?? 0,
      publishedWorkbookCount: publishedWorkbooks?.count ?? 0,
      reportedWorkbookCount: reportedWorkbooks?.count ?? 0,
      activeQuestCount: activeQuests?.count ?? 0,
      aiJobsPendingCount: aiJobsPending?.count ?? 0,
      aiJobsFailedCount: aiJobsFailed?.count ?? 0,
      aiJobsReadyCount: aiJobsReady?.count ?? 0,
      questionsNeedsReviewCount: questionsNeedsReview?.count ?? 0,
      commentsReportedCount: commentsReported?.count ?? 0,
    };
  }),

  // Reports Management
  listReportsForAdmin: protectedProcedure
    .input(
      z.object({
        status: z.enum(['open', 'reviewing', 'resolved', 'rejected']).optional(),
        targetType: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      await requireAdmin(ctx.userId);

      const where = and(
        input.status ? eq(studyReports.status, input.status) : undefined,
        input.targetType ? eq(studyReports.targetType, input.targetType) : undefined
      );

      const [reports, countResult] = await Promise.all([
        db
          .select({
            id: studyReports.id,
            targetType: studyReports.targetType,
            targetId: studyReports.targetId,
            reason: studyReports.reason,
            detail: studyReports.detail,
            reporterId: studyReports.reporterId,
            status: studyReports.status,
            createdAt: studyReports.createdAt,
          })
          .from(studyReports)
          .where(where)
          .orderBy(desc(studyReports.createdAt))
          .limit(input.limit)
          .offset(input.offset),
        db
          .select({ count: count() })
          .from(studyReports)
          .where(where),
      ]);

      return {
        items: reports,
        total: countResult[0]?.count ?? 0,
      };
    }),

  getReportDetail: protectedProcedure
    .input(z.object({ reportId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      await requireAdmin(ctx.userId);

      const report = await db.query.studyReports.findFirst({
        where: eq(studyReports.id, input.reportId),
      });

      if (!report) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '신고를 찾을 수 없습니다.',
        });
      }

      return report;
    }),

  updateReportStatus: protectedProcedure
    .input(
      z.object({
        reportId: z.string().uuid(),
        status: z.enum(['open', 'reviewing', 'resolved', 'rejected']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await requireAdmin(ctx.userId);

      await db
        .update(studyReports)
        .set({ status: input.status })
        .where(eq(studyReports.id, input.reportId));

      return { success: true };
    }),

  // Comments Moderation
  hideComment: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await requireAdmin(ctx.userId);

      await db
        .update(studyComments)
        .set({ status: 'hidden' })
        .where(eq(studyComments.id, input.commentId));

      return { success: true };
    }),

  // Workbooks Moderation
  hidePublication: protectedProcedure
    .input(z.object({ publicationId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await requireAdmin(ctx.userId);

      await db
        .update(studyWorkbookPublications)
        .set({ status: 'hidden' })
        .where(eq(studyWorkbookPublications.id, input.publicationId));

      return { success: true };
    }),

  // Questions QC Admin
  listQuestionsForQc: protectedProcedure
    .input(
      z.object({
        reviewStatus: z
          .enum(['approved', 'needs_fix', 'rejected', 'draft'])
          .optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      await requireAdmin(ctx.userId);

      const where = input.reviewStatus
        ? eq(studyQuestions.reviewStatus, input.reviewStatus)
        : undefined;

      const [questions, countResult] = await Promise.all([
        db
          .select({
            id: studyQuestions.id,
            workbookId: studyQuestions.workbookId,
            prompt: studyQuestions.prompt,
            reviewStatus: studyQuestions.reviewStatus,
            raw: studyQuestions.raw,
            createdAt: studyQuestions.createdAt,
          })
          .from(studyQuestions)
          .where(where)
          .orderBy(desc(studyQuestions.createdAt))
          .limit(input.limit)
          .offset(input.offset),
        db
          .select({ count: count() })
          .from(studyQuestions)
          .where(where),
      ]);

      return {
        items: questions,
        total: countResult[0]?.count ?? 0,
      };
    }),

  // Quests Admin
  listQuestsForAdmin: protectedProcedure.query(async ({ ctx }) => {
    await requireAdmin(ctx.userId);

    return await db
      .select()
      .from(studyQuests)
      .orderBy(desc(studyQuests.createdAt));
  }),

  createQuest: protectedProcedure
    .input(
      z.object({
        type: z.enum(['daily', 'weekly', 'monthly']),
        code: z.string().min(1),
        title: z.string().min(1),
        description: z.string().optional(),
        metric: z.enum([
          'solve_questions',
          'correct_answers',
          'review_wrong_notes',
          'complete_exams',
          'earn_xp',
          'study_days',
        ]),
        targetValue: z.number().min(1),
        rewardXp: z.number().min(0),
        rewardPoints: z.number().min(0),
        startsAt: z.date(),
        endsAt: z.date(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await requireAdmin(ctx.userId);

      const [quest] = await db
        .insert(studyQuests)
        .values({
          type: input.type,
          code: input.code,
          title: input.title,
          description: input.description,
          metric: input.metric,
          targetValue: input.targetValue,
          rewardXp: input.rewardXp,
          rewardPoints: input.rewardPoints,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          isActive: true,
          createdBy: ctx.userId,
        })
        .returning();

      return quest;
    }),

  updateQuestActive: protectedProcedure
    .input(
      z.object({
        questId: z.string().uuid(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await requireAdmin(ctx.userId);

      await db
        .update(studyQuests)
        .set({ isActive: input.isActive })
        .where(eq(studyQuests.id, input.questId));

      return { success: true };
    }),

  // AI Jobs Monitoring
  listAiJobsForAdmin: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(['pending', 'extracting', 'generating', 'ready', 'failed', 'cancelled'])
          .optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      await requireAdmin(ctx.userId);

      const where = input.status
        ? eq(studyAiGenerationJobs.status, input.status)
        : undefined;

      const [jobs, countResult, userMap] = await Promise.all([
        db
          .select({
            id: studyAiGenerationJobs.id,
            userId: studyAiGenerationJobs.userId,
            sourceFileName: studyAiGenerationJobs.sourceFileName,
            status: studyAiGenerationJobs.status,
            progress: studyAiGenerationJobs.progress,
            errorPayload: studyAiGenerationJobs.errorPayload,
            appliedWorkbookId: studyAiGenerationJobs.appliedWorkbookId,
            createdAt: studyAiGenerationJobs.createdAt,
          })
          .from(studyAiGenerationJobs)
          .where(where)
          .orderBy(desc(studyAiGenerationJobs.createdAt))
          .limit(input.limit)
          .offset(input.offset),
        db
          .select({ count: count() })
          .from(studyAiGenerationJobs)
          .where(where),
        db
          .select({
            id: profiles.id,
            displayName: profiles.displayName,
          })
          .from(profiles),
      ]);

      const userNameMap = new Map(userMap.map((u) => [u.id, u.displayName]));

      const itemsWithNames = jobs.map((job) => ({
        ...job,
        userDisplayName: userNameMap.get(job.userId) ?? '알 수 없음',
      }));

      return {
        items: itemsWithNames,
        total: countResult[0]?.count ?? 0,
      };
    }),
});
