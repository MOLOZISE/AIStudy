import { db, studyRewardEvents, studyUserProgress } from '@repo/db';
import { eq, sql } from 'drizzle-orm';
import type { StudyRewardEventType } from '@repo/types';

// Policy includes base rewards + quest rewards are added dynamically
export const STUDY_REWARD_POLICY: Record<string, { xp: number; points: number }> = {
  question_attempt: { xp: 5, points: 5 },
  question_correct_bonus: { xp: 2, points: 2 },
  wrong_note_review_success: { xp: 8, points: 8 },
  wrong_note_marked_mastered: { xp: 5, points: 5 },
  exam_completed: { xp: 30, points: 30 },
  workbook_created: { xp: 20, points: 20 },
  workbook_published: { xp: 30, points: 30 },
  workbook_forked: { xp: 15, points: 15 },
  comment_created: { xp: 3, points: 3 },
  review_created: { xp: 10, points: 10 },
  daily_quest_completed: { xp: 0, points: 0 }, // Dynamic from quest
  weekly_quest_completed: { xp: 0, points: 0 }, // Dynamic from quest
  monthly_quest_completed: { xp: 0, points: 0 }, // Dynamic from quest
};

export function calculateLevel(totalXp: number): number {
  return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}

export function getNextLevelProgress(totalXp: number): { currentLevel: number; nextLevel: number; currentXp: number; nextLevelXp: number; progress: number } {
  const currentLevel = calculateLevel(totalXp);
  const nextLevel = currentLevel + 1;

  // XP needed to reach current level: (currentLevel - 1)^2 * 100
  const currentLevelXp = Math.max(0, (currentLevel - 1) ** 2 * 100);
  // XP needed to reach next level: nextLevel^2 * 100
  const nextLevelXp = nextLevel ** 2 * 100;

  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
  const progress = Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100);

  return {
    currentLevel,
    nextLevel,
    currentXp: xpInCurrentLevel,
    nextLevelXp: xpNeededForNextLevel,
    progress,
  };
}

async function ensureUserProgress(userId: string): Promise<void> {
  const existing = await db
    .select()
    .from(studyUserProgress)
    .where(eq(studyUserProgress.userId, userId))
    .limit(1);

  if (!existing.length) {
    await db.insert(studyUserProgress).values({
      userId,
      level: 1,
      totalXp: 0,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export async function awardStudyReward(input: {
  userId: string;
  eventType: StudyRewardEventType | 'daily_quest_completed' | 'weekly_quest_completed' | 'monthly_quest_completed';
  sourceType: string;
  sourceId?: string;
  reason?: string;
  idempotencyKey: string;
}): Promise<{ success: boolean; isNew: boolean }> {
  // Check for idempotency
  const existing = await db
    .select()
    .from(studyRewardEvents)
    .where(eq(studyRewardEvents.idempotencyKey, input.idempotencyKey))
    .limit(1);

  if (existing.length) {
    // Already awarded, silently skip
    return { success: true, isNew: false };
  }

  const policy = STUDY_REWARD_POLICY[input.eventType];
  if (!policy) {
    // Unknown event type, skip silently
    return { success: false, isNew: false };
  }

  try {
    await ensureUserProgress(input.userId);

    // Insert reward event
    await db.insert(studyRewardEvents).values({
      userId: input.userId,
      eventType: input.eventType,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      points: policy.points,
      xp: policy.xp,
      reason: input.reason,
      idempotencyKey: input.idempotencyKey,
      createdAt: new Date(),
    });

    // Update user progress
    await db
      .update(studyUserProgress)
      .set({
        totalXp: sql`${studyUserProgress.totalXp} + ${policy.xp}`,
        totalPoints: sql`${studyUserProgress.totalPoints} + ${policy.points}`,
        level: sql`${sql`GREATEST(1, FLOOR(SQRT((${studyUserProgress.totalXp} + ${policy.xp}) / 100.0)) + 1)`}`,
        updatedAt: new Date(),
      })
      .where(eq(studyUserProgress.userId, input.userId));

    return { success: true, isNew: true };
  } catch (error) {
    console.error('Failed to award reward:', error);
    // Don't throw - reward failure shouldn't break the main flow
    return { success: false, isNew: false };
  }
}

export async function updateStudyStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
  try {
    await ensureUserProgress(userId);

    const [progress] = await db
      .select()
      .from(studyUserProgress)
      .where(eq(studyUserProgress.userId, userId))
      .limit(1);

    if (!progress) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastStudyDate = progress.lastStudyDate ? new Date(progress.lastStudyDate) : null;
    if (lastStudyDate) {
      lastStudyDate.setHours(0, 0, 0, 0);
    }

    let newCurrentStreak = progress.currentStreak;
    let newLongestStreak = progress.longestStreak;

    if (!lastStudyDate) {
      // First study
      newCurrentStreak = 1;
      newLongestStreak = 1;
    } else {
      const daysDiff = Math.floor((today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Same day, no change
        return { currentStreak: progress.currentStreak, longestStreak: progress.longestStreak };
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        newCurrentStreak = progress.currentStreak + 1;
        newLongestStreak = Math.max(newCurrentStreak, progress.longestStreak);
      } else {
        // Gap in streak, reset to 1
        newCurrentStreak = 1;
      }
    }

    await db
      .update(studyUserProgress)
      .set({
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastStudyDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(studyUserProgress.userId, userId));

    return { currentStreak: newCurrentStreak, longestStreak: newLongestStreak };
  } catch (error) {
    console.error('Failed to update streak:', error);
    return { currentStreak: 0, longestStreak: 0 };
  }
}

export async function getMyProgress(userId: string) {
  await ensureUserProgress(userId);

  const [progress] = await db
    .select()
    .from(studyUserProgress)
    .where(eq(studyUserProgress.userId, userId))
    .limit(1);

  if (!progress) {
    return null;
  }

  const levelInfo = getNextLevelProgress(progress.totalXp);

  return {
    ...progress,
    ...levelInfo,
  };
}

export async function listRecentRewardEvents(userId: string, limit: number = 10) {
  const events = await db
    .select()
    .from(studyRewardEvents)
    .where(eq(studyRewardEvents.userId, userId))
    .orderBy(sql`${studyRewardEvents.createdAt} DESC`)
    .limit(limit);

  return events;
}
