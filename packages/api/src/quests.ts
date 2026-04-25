import { db, studyQuests, studyUserQuestProgress } from '@repo/db';
import { and, eq, gte, lte, isNull } from 'drizzle-orm';
import type { QuestMetric } from '@repo/types';
import { awardStudyReward } from './gamification.js';

// Quest metric mapping from reward events
const METRIC_MAPPING: Record<string, QuestMetric[]> = {
  question_attempt: ['solve_questions', 'earn_xp'],
  question_correct_bonus: ['correct_answers', 'earn_xp'],
  wrong_note_review_success: ['review_wrong_notes', 'earn_xp'],
  exam_completed: ['complete_exams', 'earn_xp'],
};

// Initial quest definitions
export const INITIAL_QUESTS = [
  // Daily Quests
  {
    type: 'daily' as const,
    code: 'daily_solve_5',
    title: '오늘 5문제 풀기',
    description: '5개의 문제를 풀어 기초 학습을 완성하세요.',
    metric: 'solve_questions' as const,
    targetValue: 5,
    rewardXp: 30,
    rewardPoints: 30,
  },
  {
    type: 'daily' as const,
    code: 'daily_correct_3',
    title: '오늘 정답 3개 맞히기',
    description: '3개의 문제를 정답으로 풀어 학습 효과를 확인하세요.',
    metric: 'correct_answers' as const,
    targetValue: 3,
    rewardXp: 20,
    rewardPoints: 20,
  },
  {
    type: 'daily' as const,
    code: 'daily_review_2',
    title: '오늘 오답 2개 복습하기',
    description: '2개의 오답을 복습하여 약점을 극복하세요.',
    metric: 'review_wrong_notes' as const,
    targetValue: 2,
    rewardXp: 25,
    rewardPoints: 25,
  },
  // Weekly Quests
  {
    type: 'weekly' as const,
    code: 'weekly_solve_50',
    title: '이번 주 50문제 풀기',
    description: '50개의 문제를 풀어 꾸준한 학습을 이어가세요.',
    metric: 'solve_questions' as const,
    targetValue: 50,
    rewardXp: 150,
    rewardPoints: 150,
  },
  {
    type: 'weekly' as const,
    code: 'weekly_exam_2',
    title: '이번 주 모의고사 2회 완료',
    description: '2개의 모의고사를 완료하여 종합 실력을 점검하세요.',
    metric: 'complete_exams' as const,
    targetValue: 2,
    rewardXp: 120,
    rewardPoints: 120,
  },
  {
    type: 'weekly' as const,
    code: 'weekly_study_5days',
    title: '이번 주 5일 학습하기',
    description: '5일 이상 연속으로 학습하여 성실함을 보이세요.',
    metric: 'study_days' as const,
    targetValue: 5,
    rewardXp: 100,
    rewardPoints: 100,
  },
  // Monthly Quests
  {
    type: 'monthly' as const,
    code: 'monthly_solve_300',
    title: '이번 달 300문제 풀기',
    description: '300개의 문제를 풀어 최고 수준의 학습량을 달성하세요.',
    metric: 'solve_questions' as const,
    targetValue: 300,
    rewardXp: 500,
    rewardPoints: 500,
  },
  {
    type: 'monthly' as const,
    code: 'monthly_earn_1000xp',
    title: '이번 달 1000 XP 획득',
    description: '1000 XP를 획득하여 전체적인 성장을 이루세요.',
    metric: 'earn_xp' as const,
    targetValue: 1000,
    rewardXp: 300,
    rewardPoints: 300,
  },
];

async function ensureUserQuestProgress(userId: string, questId: string): Promise<void> {
  const existing = await db
    .select()
    .from(studyUserQuestProgress)
    .where(and(eq(studyUserQuestProgress.userId, userId), eq(studyUserQuestProgress.questId, questId)))
    .limit(1);

  if (!existing.length) {
    await db.insert(studyUserQuestProgress).values({
      userId,
      questId,
      currentValue: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export async function updateQuestProgressFromRewardEvent(userId: string, eventType: string, eventXp: number): Promise<void> {
  try {
    const relevantMetrics = METRIC_MAPPING[eventType] || [];

    // Get active quests for this user
    const now = new Date();
    const quests = await db
      .select()
      .from(studyQuests)
      .where(
        and(
          eq(studyQuests.isActive, true),
          gte(studyQuests.startsAt, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)), // Last 30 days to cover monthly
          lte(studyQuests.endsAt, now)
        )
      );

    for (const quest of quests) {
      // Check if this metric applies to this quest
      let increment = 0;

      const questMetric = quest.metric as QuestMetric;
      if (relevantMetrics.includes(questMetric)) {
        if (questMetric === 'earn_xp') {
          increment = eventXp;
        } else if (eventType === 'question_attempt' && questMetric === 'solve_questions') {
          increment = 1;
        } else if (eventType === 'question_correct_bonus' && questMetric === 'correct_answers') {
          increment = 1;
        } else if (eventType === 'wrong_note_review_success' && questMetric === 'review_wrong_notes') {
          increment = 1;
        } else if (eventType === 'exam_completed' && questMetric === 'complete_exams') {
          increment = 1;
        }
      }

      if (increment > 0) {
        await ensureUserQuestProgress(userId, quest.id);

        const [progress] = await db
          .select()
          .from(studyUserQuestProgress)
          .where(
            and(
              eq(studyUserQuestProgress.userId, userId),
              eq(studyUserQuestProgress.questId, quest.id)
            )
          )
          .limit(1);

        const newValue = (progress?.currentValue ?? 0) + increment;
        const completedNow = !progress?.completedAt && newValue >= quest.targetValue;

        await db
          .update(studyUserQuestProgress)
          .set({
            currentValue: newValue,
            completedAt: completedNow ? new Date() : progress?.completedAt,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(studyUserQuestProgress.userId, userId),
              eq(studyUserQuestProgress.questId, quest.id)
            )
          );
      }
    }
  } catch (error) {
    console.error('Failed to update quest progress:', error);
    // Non-blocking - don't throw
  }
}

export async function claimQuestRewardInternal(userId: string, questId: string): Promise<boolean> {
  try {
    const [progress] = await db
      .select()
      .from(studyUserQuestProgress)
      .where(
        and(
          eq(studyUserQuestProgress.userId, userId),
          eq(studyUserQuestProgress.questId, questId),
          isNull(studyUserQuestProgress.claimedAt)
        )
      )
      .limit(1);

    if (!progress || !progress.completedAt) {
      return false;
    }

    const [quest] = await db
      .select()
      .from(studyQuests)
      .where(eq(studyQuests.id, questId))
      .limit(1);

    if (!quest) {
      return false;
    }

    // Award the quest reward
    const questEventType = `${quest.type}_quest_completed`;
    const result = await awardStudyReward({
      userId,
      eventType: questEventType as 'daily_quest_completed' | 'weekly_quest_completed' | 'monthly_quest_completed',
      sourceType: 'quest',
      sourceId: questId,
      reason: `Quest completed: ${quest.title}`,
      idempotencyKey: `quest_reward:${userId}:${questId}`,
    });

    if (result.success) {
      // Mark as claimed
      await db
        .update(studyUserQuestProgress)
        .set({
          claimedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(studyUserQuestProgress.userId, userId),
            eq(studyUserQuestProgress.questId, questId)
          )
        );
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to claim quest reward:', error);
    return false;
  }
}

export async function getTodayQuests(userId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const quests = await db
    .select({
      quest: studyQuests,
      progress: studyUserQuestProgress,
    })
    .from(studyQuests)
    .leftJoin(
      studyUserQuestProgress,
      and(
        eq(studyUserQuestProgress.userId, userId),
        eq(studyUserQuestProgress.questId, studyQuests.id)
      )
    )
    .where(
      and(
        eq(studyQuests.type, 'daily'),
        eq(studyQuests.isActive, true),
        gte(studyQuests.startsAt, startOfDay),
        lte(studyQuests.endsAt, endOfDay)
      )
    );

  return quests.map(({ quest, progress }) => ({
    ...quest,
    currentValue: progress?.currentValue ?? 0,
    completedAt: progress?.completedAt,
    claimedAt: progress?.claimedAt,
    isCompleted: (progress?.currentValue ?? 0) >= quest.targetValue,
    isClaimed: !!progress?.claimedAt,
  }));
}

export async function getWeeklyQuests(userId: string) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const quests = await db
    .select({
      quest: studyQuests,
      progress: studyUserQuestProgress,
    })
    .from(studyQuests)
    .leftJoin(
      studyUserQuestProgress,
      and(
        eq(studyUserQuestProgress.userId, userId),
        eq(studyUserQuestProgress.questId, studyQuests.id)
      )
    )
    .where(
      and(
        eq(studyQuests.type, 'weekly'),
        eq(studyQuests.isActive, true),
        gte(studyQuests.startsAt, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
      )
    );

  return quests.map(({ quest, progress }) => ({
    ...quest,
    currentValue: progress?.currentValue ?? 0,
    completedAt: progress?.completedAt,
    claimedAt: progress?.claimedAt,
    isCompleted: (progress?.currentValue ?? 0) >= quest.targetValue,
    isClaimed: !!progress?.claimedAt,
  }));
}

export async function getMonthlyQuests(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const quests = await db
    .select({
      quest: studyQuests,
      progress: studyUserQuestProgress,
    })
    .from(studyQuests)
    .leftJoin(
      studyUserQuestProgress,
      and(
        eq(studyUserQuestProgress.userId, userId),
        eq(studyUserQuestProgress.questId, studyQuests.id)
      )
    )
    .where(
      and(
        eq(studyQuests.type, 'monthly'),
        eq(studyQuests.isActive, true),
        gte(studyQuests.startsAt, startOfMonth),
        lte(studyQuests.endsAt, endOfMonth)
      )
    );

  return quests.map(({ quest, progress }) => ({
    ...quest,
    currentValue: progress?.currentValue ?? 0,
    completedAt: progress?.completedAt,
    claimedAt: progress?.claimedAt,
    isCompleted: (progress?.currentValue ?? 0) >= quest.targetValue,
    isClaimed: !!progress?.claimedAt,
  }));
}

export async function getQuestSummary(userId: string) {
  const [today] = await Promise.all([getTodayQuests(userId)]);

  const totalQuests = today.length;
  const completedQuests = today.filter((q) => q.isCompleted).length;
  const claimedQuests = today.filter((q) => q.isClaimed).length;

  return {
    totalQuests,
    completedQuests,
    claimedQuests,
    quests: today,
  };
}
