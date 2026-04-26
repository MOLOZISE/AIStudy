'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import Link from 'next/link';

const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
  comment_reply: '💬',
  workbook_comment: '💭',
  workbook_review: '⭐',
  workbook_liked: '❤️',
  workbook_forked: '🔄',
  badge_earned: '🎖️',
  quest_completed: '✅',
  report_resolved: '📋',
  ai_job_ready: '🤖',
  ai_job_failed: '❌',
};

function getNotificationLink(notification: any): string {
  switch (notification.type) {
    case 'badge_earned':
      return '/study/profile';
    case 'quest_completed':
      return '/study/quests';
    case 'ai_job_ready':
    case 'ai_job_failed':
      return '/study/generate';
    case 'workbook_comment':
    case 'workbook_review':
    case 'workbook_forked':
      if (notification.sourceId && notification.sourceType === 'publication') {
        return `/study/discover/${notification.sourceId}`;
      }
      return '/study/notifications';
    case 'comment_reply':
      if (notification.metadata?.targetType === 'publication' && notification.metadata?.targetId) {
        return `/study/discover/${notification.metadata.targetId}`;
      }
      return '/study/notifications';
    default:
      return '/study/notifications';
  }
}

function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return dateObj.toLocaleDateString('ko-KR');
}

export function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, isLoading, refetch } = trpc.study.listMyNotifications.useQuery({
    limit: 50,
    unreadOnly,
  });
  const markReadMutation = trpc.study.markNotificationRead.useMutation({
    onSuccess: () => refetch(),
  });
  const markAllReadMutation = trpc.study.markAllNotificationsRead.useMutation({
    onSuccess: () => refetch(),
  });

  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">알림을 불러오는 중입니다...</div>;
  }

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">
            {unreadCount > 0 && <span className="font-semibold text-slate-900">읽지 않은 알림 {unreadCount}개</span>}
            {unreadCount === 0 && <span className="text-slate-500">모두 읽음</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              unreadOnly
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            읽지 않음만
          </button>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-50"
            >
              전체 읽음
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">아직 {unreadOnly ? '읽지 않은' : ''} 알림이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const link = getNotificationLink(notif);
            const isRead = notif.readAt != null;
            const icon = NOTIFICATION_TYPE_ICONS[notif.type] || '📢';

            return (
              <Link
                key={notif.id}
                href={link}
                onClick={async (e) => {
                  if (!isRead) {
                    e.preventDefault();
                    await markReadMutation.mutateAsync({ notificationId: notif.id });
                    window.location.href = link;
                  }
                }}
              >
                <div
                  className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                    isRead
                      ? 'border-slate-200 bg-white hover:bg-slate-50'
                      : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0 pt-1">{icon}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isRead ? 'text-slate-900' : 'text-blue-900'}`}>
                          {notif.title}
                        </p>
                        {notif.message && (
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                        )}
                      </div>
                      {!isRead && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{formatTime(notif.createdAt)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
