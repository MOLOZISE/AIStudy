import { db, studyNotifications } from '@repo/db';
import { eq, isNull, and } from 'drizzle-orm';

export type StudyNotificationType =
  | 'comment_reply'
  | 'workbook_comment'
  | 'workbook_review'
  | 'workbook_liked'
  | 'workbook_forked'
  | 'badge_earned'
  | 'quest_completed'
  | 'report_resolved'
  | 'ai_job_ready'
  | 'ai_job_failed';

export interface CreateStudyNotificationInput {
  userId: string;
  type: StudyNotificationType;
  title: string;
  message?: string;
  sourceType?: string;
  sourceId?: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey: string;
}

export async function createStudyNotification(input: CreateStudyNotificationInput): Promise<{ success: boolean; isNew: boolean }> {
  try {
    // Skip self-notification
    if (input.actorId && input.userId === input.actorId) {
      return { success: true, isNew: false };
    }

    // Check idempotency
    const existing = await db
      .select()
      .from(studyNotifications)
      .where(eq(studyNotifications.idempotencyKey, input.idempotencyKey))
      .limit(1);

    if (existing.length) {
      return { success: true, isNew: false };
    }

    // Create notification
    await db.insert(studyNotifications).values({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      actorId: input.actorId,
      metadata: input.metadata || {},
      idempotencyKey: input.idempotencyKey,
      createdAt: new Date(),
    });

    return { success: true, isNew: true };
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Non-blocking - don't propagate errors
    return { success: false, isNew: false };
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const result = await db
      .select()
      .from(studyNotifications)
      .where(and(eq(studyNotifications.userId, userId), isNull(studyNotifications.readAt)));

    return result.length;
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
}

export async function markNotificationRead(notificationId: string): Promise<boolean> {
  try {
    await db
      .update(studyNotifications)
      .set({ readAt: new Date() })
      .where(eq(studyNotifications.id, notificationId));

    return true;
  } catch (error) {
    console.error('Failed to mark notification read:', error);
    return false;
  }
}

export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  try {
    await db
      .update(studyNotifications)
      .set({ readAt: new Date() })
      .where(eq(studyNotifications.userId, userId));

    return true;
  } catch (error) {
    console.error('Failed to mark all notifications read:', error);
    return false;
  }
}
