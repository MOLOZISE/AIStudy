import { db, studyBadges, studyUserBadges, studyAttempts, studyWrongNotes, studyUserProgress, studyWorkbookPublications, studyWorkbookForks, studyComments } from '@repo/db';
import { eq, and, count, sql } from 'drizzle-orm';
import { awardStudyReward } from './gamification.js';
import { createStudyNotification } from './notifications.js';

export interface BadgeDefinition {
  code: string;
  title: string;
  description?: string;
  icon?: string;
  category: string;
  conditionType: string;
  conditionValue: number;
  rewardXp: number;
  rewardPoints: number;
}

export const DEFAULT_BADGES: BadgeDefinition[] = [
  {
    code: 'first_solve',
    title: '첫 풀이',
    description: '첫 문제를 풀이했어요!',
    icon: '🎯',
    category: 'progress',
    conditionType: 'total_attempts',
    conditionValue: 1,
    rewardXp: 10,
    rewardPoints: 10,
  },
  {
    code: 'solve_10',
    title: '10문제 달성',
    description: '10문제를 풀이했어요!',
    icon: '📚',
    category: 'progress',
    conditionType: 'total_attempts',
    conditionValue: 10,
    rewardXp: 25,
    rewardPoints: 25,
  },
  {
    code: 'solve_100',
    title: '100문제 달성',
    description: '100문제를 풀이했어요!',
    icon: '🏆',
    category: 'progress',
    conditionType: 'total_attempts',
    conditionValue: 100,
    rewardXp: 50,
    rewardPoints: 50,
  },
  {
    code: 'first_correct',
    title: '첫 정답',
    description: '첫 정답을 맞혔어요!',
    icon: '✨',
    category: 'mastery',
    conditionType: 'correct_attempts',
    conditionValue: 1,
    rewardXp: 15,
    rewardPoints: 15,
  },
  {
    code: 'correct_10',
    title: '10정답 달성',
    description: '10개의 정답을 얻었어요!',
    icon: '⭐',
    category: 'mastery',
    conditionType: 'correct_attempts',
    conditionValue: 10,
    rewardXp: 30,
    rewardPoints: 30,
  },
  {
    code: 'streak_3',
    title: '3일 연속 학습',
    description: '3일 연속으로 문제를 풀었어요!',
    icon: '🔥',
    category: 'streak',
    conditionType: 'current_streak',
    conditionValue: 3,
    rewardXp: 20,
    rewardPoints: 20,
  },
  {
    code: 'streak_7',
    title: '7일 연속 학습',
    description: '7일 연속으로 문제를 풀었어요!',
    icon: '🌟',
    category: 'streak',
    conditionType: 'current_streak',
    conditionValue: 7,
    rewardXp: 40,
    rewardPoints: 40,
  },
  {
    code: 'first_wrong_mastered',
    title: '첫 오답 정복',
    description: '첫 오답을 정복했어요!',
    icon: '💪',
    category: 'mastery',
    conditionType: 'mastered_wrong_notes',
    conditionValue: 1,
    rewardXp: 25,
    rewardPoints: 25,
  },
  {
    code: 'first_workbook_published',
    title: '첫 문제집 공개',
    description: '첫 문제집을 공개했어요!',
    icon: '📖',
    category: 'social',
    conditionType: 'published_workbook_count',
    conditionValue: 1,
    rewardXp: 30,
    rewardPoints: 30,
  },
  {
    code: 'first_fork',
    title: '첫 문제집 복사',
    description: '첫 문제집을 복사했어요!',
    icon: '🔄',
    category: 'social',
    conditionType: 'fork_count',
    conditionValue: 1,
    rewardXp: 15,
    rewardPoints: 15,
  },
  {
    code: 'first_comment',
    title: '첫 댓글 작성',
    description: '첫 댓글을 작성했어요!',
    icon: '💬',
    category: 'social',
    conditionType: 'comment_count',
    conditionValue: 1,
    rewardXp: 10,
    rewardPoints: 10,
  },
];

export async function ensureDefaultBadges(): Promise<void> {
  try {
    const existing = await db
      .select({ code: studyBadges.code })
      .from(studyBadges)
      .where(eq(studyBadges.isActive, true));

    const existingCodes = new Set(existing.map((b) => b.code));

    const toInsert = DEFAULT_BADGES.filter((badge) => !existingCodes.has(badge.code));

    if (toInsert.length === 0) {
      return;
    }

    await db.insert(studyBadges).values(
      toInsert.map((badge) => ({
        code: badge.code,
        title: badge.title,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        conditionType: badge.conditionType,
        conditionValue: badge.conditionValue,
        rewardXp: badge.rewardXp,
        rewardPoints: badge.rewardPoints,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  } catch (error) {
    console.error('Failed to ensure default badges:', error);
  }
}

interface UserStats {
  totalAttempts: number;
  correctAttempts: number;
  masteredWrongNotes: number;
  currentStreak: number;
  publishedWorkbookCount: number;
  forkCount: number;
  commentCount: number;
}

async function getUserStats(userId: string): Promise<UserStats> {
  try {
    const [attemptStats] = await db
      .select({
        total: count(),
        correct: count(sql`CASE WHEN ${studyAttempts.isCorrect} = true THEN 1 END`),
      })
      .from(studyAttempts)
      .where(eq(studyAttempts.userId, userId));

    const [wrongNoteStats] = await db
      .select({
        mastered: count(),
      })
      .from(studyWrongNotes)
      .where(and(eq(studyWrongNotes.userId, userId), eq(studyWrongNotes.status, 'mastered')));

    const [progressData] = await db
      .select({
        currentStreak: studyUserProgress.currentStreak,
      })
      .from(studyUserProgress)
      .where(eq(studyUserProgress.userId, userId));

    const [pubStats] = await db
      .select({
        published: count(),
      })
      .from(studyWorkbookPublications)
      .where(eq(studyWorkbookPublications.ownerId, userId));

    const [forkStats] = await db
      .select({
        forked: count(),
      })
      .from(studyWorkbookForks)
      .where(eq(studyWorkbookForks.forkedBy, userId));

    const [commentStats] = await db
      .select({
        comments: count(),
      })
      .from(studyComments)
      .where(eq(studyComments.authorId, userId));

    return {
      totalAttempts: attemptStats?.total ?? 0,
      correctAttempts: attemptStats?.correct ?? 0,
      masteredWrongNotes: wrongNoteStats?.mastered ?? 0,
      currentStreak: progressData?.currentStreak ?? 0,
      publishedWorkbookCount: pubStats?.published ?? 0,
      forkCount: forkStats?.forked ?? 0,
      commentCount: commentStats?.comments ?? 0,
    };
  } catch (error) {
    console.error('Failed to get user stats:', error);
    return {
      totalAttempts: 0,
      correctAttempts: 0,
      masteredWrongNotes: 0,
      currentStreak: 0,
      publishedWorkbookCount: 0,
      forkCount: 0,
      commentCount: 0,
    };
  }
}

export async function evaluateAndAwardBadges(userId: string): Promise<void> {
  try {
    // Ensure default badges exist
    await ensureDefaultBadges();

    // Get user stats
    const stats = await getUserStats(userId);

    // Get active badges
    const badges = await db
      .select()
      .from(studyBadges)
      .where(eq(studyBadges.isActive, true));

    // Get already earned badges
    const earnedBadges = await db
      .select({ badgeId: studyUserBadges.badgeId })
      .from(studyUserBadges)
      .where(eq(studyUserBadges.userId, userId));

    const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badgeId));

    for (const badge of badges) {
      // Skip if already earned
      if (earnedBadgeIds.has(badge.id)) {
        continue;
      }

      let conditionMet = false;

      // Check conditions
      switch (badge.conditionType) {
        case 'total_attempts':
          conditionMet = stats.totalAttempts >= badge.conditionValue;
          break;
        case 'correct_attempts':
          conditionMet = stats.correctAttempts >= badge.conditionValue;
          break;
        case 'current_streak':
          conditionMet = stats.currentStreak >= badge.conditionValue;
          break;
        case 'mastered_wrong_notes':
          conditionMet = stats.masteredWrongNotes >= badge.conditionValue;
          break;
        case 'published_workbook_count':
          conditionMet = stats.publishedWorkbookCount >= badge.conditionValue;
          break;
        case 'fork_count':
          conditionMet = stats.forkCount >= badge.conditionValue;
          break;
        case 'comment_count':
          conditionMet = stats.commentCount >= badge.conditionValue;
          break;
      }

      if (conditionMet) {
        try {
          // Insert badge award
          await db.insert(studyUserBadges).values({
            userId,
            badgeId: badge.id,
            earnedAt: new Date(),
            createdAt: new Date(),
          });

          // Award XP/points if badge has rewards
          if (badge.rewardXp > 0 || badge.rewardPoints > 0) {
            const idempotencyKey = `badge_reward:${userId}:${badge.code}`;
            await awardStudyReward({
              userId,
              eventType: 'question_correct_bonus',
              sourceType: 'badge',
              sourceId: badge.id,
              reason: `Badge earned: ${badge.title}`,
              idempotencyKey,
            });
          }

          // Create notification for badge earned (non-blocking)
          createStudyNotification({
            userId,
            type: 'badge_earned',
            title: `🎖️ 뱃지 획득!`,
            message: `"${badge.title}" 뱃지를 획득했어요!`,
            sourceType: 'badge',
            sourceId: badge.id,
            idempotencyKey: `badge_earned:${userId}:${badge.code}`,
          }).catch((err) => {
            console.error(`Failed to create badge notification for ${badge.code}:`, err);
          });
        } catch (error) {
          // Skip duplicate badge error (already earned in this session)
          if ((error as any).message?.includes('duplicate')) {
            continue;
          }
          console.error(`Failed to award badge ${badge.code}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Failed to evaluate and award badges:', error);
    // Non-blocking - don't propagate errors
  }
}
