# Week 5: Realtime Comments + Notifications

> **For Claude Code / Codex**: Copy entire prompt below and paste into Claude Code chat

---

## 🎯 Objective

Live comment updates via Supabase Realtime + notification system for comments, votes, mentions.

**User Stories**:
1. Open post detail → new comments appear instantly without refresh
2. Get notified when someone replies to your comment
3. Get notified when someone upvotes your post/comment
4. Notification inbox shows unread count badge
5. Click notification → goes to post/comment
6. Mark notification as read

---

## 📋 Implementation Plan

### Phase 1: Backend (tRPC API)

**File**: `packages/api/src/routers/notifications.ts` (new)

```typescript
// Procedures:
// - getList(limit?, offset?, unreadOnly?) -> Notification[] (protected)
// - markAsRead(id) -> { success } (protected)
// - markAllAsRead() -> { success } (protected)
// - getUnreadCount() -> { count: number } (protected)
```

**Database Triggers** (SQL in `packages/db/migrations/`):

Add to Supabase (via SQL Editor or migration file):

```sql
-- Trigger: new comment → notify post author
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.author_id != (SELECT author_id FROM posts WHERE id = NEW.post_id) THEN
    INSERT INTO notifications (recipient_id, actor_id, type, target_type, target_id, message)
    VALUES (
      (SELECT author_id FROM posts WHERE id = NEW.post_id),
      NEW.author_id,
      'comment',
      'post',
      NEW.post_id,
      'Someone replied to your post'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_notification
AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

-- Trigger: new upvote → notify target author
CREATE OR REPLACE FUNCTION notify_on_upvote()
RETURNS TRIGGER AS $$
DECLARE
  target_author_id UUID;
  target_title TEXT;
BEGIN
  IF NEW.vote_type = 'up' THEN
    IF NEW.target_type = 'post' THEN
      SELECT author_id, title INTO target_author_id, target_title FROM posts WHERE id = NEW.target_id;
      IF target_author_id != NEW.user_id THEN
        INSERT INTO notifications (recipient_id, actor_id, type, target_type, target_id, message)
        VALUES (
          target_author_id,
          NEW.user_id,
          'vote',
          'post',
          NEW.target_id,
          'Someone upvoted your post: ' || COALESCE(target_title, 'Untitled')
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER upvote_notification
AFTER INSERT ON votes
FOR EACH ROW EXECUTE FUNCTION notify_on_upvote();
```

---

### Phase 2: Frontend - Realtime Comments

**File**: `apps/web/src/lib/realtime.ts` (new)

```typescript
import { useEffect } from 'react';
import { supabase } from './supabase';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeComments(postId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`post:${postId}:comments`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          // New comment arrived → invalidate query → refetch
          queryClient.invalidateQueries({
            queryKey: ['comments', postId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);
}
```

**Update Post Detail Page**:

```typescript
// In apps/web/src/app/(main)/posts/[postId]/page.tsx
'use client';

export default function PostDetail({ params }) {
  useRealtimeComments(params.postId); // ← Add this hook
  
  const { data: comments } = trpc.comments.getList.useQuery({
    postId: params.postId,
  });

  return (
    <div>
      {/* Post content */}
      <CommentTree comments={comments} />
    </div>
  );
}
```

---

### Phase 3: Frontend - Notifications

1. **`apps/web/src/components/NotificationBell.tsx`** (new)
   - Bell icon in header
   - Badge with unread count (e.g., "3")
   - Click → dropdown showing last 5 notifications
   - "View all" link → `/notifications`
   - Realtime: update count as notifications arrive

2. **`apps/web/src/app/(main)/notifications/page.tsx`** (new)
   - Full notifications page
   - List all notifications (paginated)
   - Checkbox to mark as read / mark all as read
   - Filter: unread / all
   - Click notification → navigate to post/comment

3. **`apps/web/src/components/NotificationItem.tsx`** (reusable)
   - Display: actor avatar, message, time
   - Bold if unread
   - Click → mark as read + navigate to target

4. **Update header**:
   - Add NotificationBell component
   - Position in top-right corner

---

## 🎯 Real-time Flow Diagram

```
User A creates comment on Post X
  ↓
Supabase trigger fires → INSERT into notifications
  ↓
Supabase Realtime broadcasts to subscribed clients
  ↓
User X (post author) sees notification badge update
  ↓
User X clicks notification → navigates to Post X
```

---

## ✅ Acceptance Criteria

- [ ] Open post detail, other user creates comment → appears instantly (no refresh)
- [ ] Notification bell shows unread count
- [ ] When comment added to your post → notification appears
- [ ] When upvote added to your post → notification appears
- [ ] Notification page shows all notifications
- [ ] Mark notification as read → no longer bold
- [ ] Click notification → goes to correct post
- [ ] Refresh page → notifications persisted (from DB)
- [ ] No TypeScript errors, no console errors

---

## 🔍 Reference Files

**Study patterns**:
- `apps/web/src/lib/supabase.ts` - Supabase client
- Week 4 comments components - tree structure

---

## 📝 Detailed Task Breakdown

### Step 1: Database Triggers (20 min)
- Copy trigger SQL above
- Paste into Supabase SQL Editor
- Test: create comment → check notifications table

### Step 2: Notifications Router (20 min)
- Create notifications.ts tRPC router
- getList, markAsRead, getUnreadCount procedures
- Register in index.ts

### Step 3: Realtime Hook (30 min)
- Create realtime.ts with useRealtimeComments hook
- Test: open post in 2 browsers, comment in one → appears in other

### Step 4: Notification Bell (30 min)
- Build NotificationBell component
- Real-time unread count via useQuery + Realtime
- Dropdown showing last notifications

### Step 5: Notification Page (30 min)
- Build `/notifications` page
- NotificationItem component
- Mark as read / filter logic

### Step 6: Integration (20 min)
- Add NotificationBell to header
- Update header layout

### Step 7: Polish (20 min)
- Mobile responsive
- Error handling
- Toast notifications on new notifications (optional)
- Type check & lint

---

## 🧪 Manual Testing Checklist

1. **Realtime Comments**:
   - [ ] Open post detail in Browser A
   - [ ] Open same post in Browser B
   - [ ] In B, create comment
   - [ ] In A, comment appears instantly (no refresh needed)
   - [ ] Comment shows correct author / content

2. **Notifications**:
   - [ ] Create comment on User B's post
   - [ ] User B sees notification bell badge (+1)
   - [ ] Click bell, see notification dropdown
   - [ ] Click notification, goes to your post

3. **Unread Count**:
   - [ ] Multiple comments on your posts
   - [ ] Bell badge shows "3" (or whatever count)
   - [ ] Click one notification
   - [ ] Badge still shows "2" (only marked clicked as read)
   - [ ] Click "Mark all as read"
   - [ ] Badge disappears

4. **Notification Page**:
   - [ ] Visit `/notifications`
   - [ ] See list of all notifications
   - [ ] Click one, mark as read + navigate to post
   - [ ] Filter toggle: show unread only
   - [ ] Pagination works (scroll, load more)

5. **Realtime Bell Update** (advanced):
   - [ ] Have notification page open in one tab
   - [ ] In another tab, create comment on friend's post (which you didn't author)
   - [ ] In first tab, bell badge updates immediately
   - [ ] (This tests Supabase Realtime with multiple channels)

---

## Git Workflow

```bash
git commit -m "feat: realtime comments + notifications (Week 5)

- Supabase Realtime: live comment updates on post detail
- Notification system: comment reply, upvote, mention
- DB triggers: auto-create notifications
- Notification bell in header with unread badge
- Full notifications page with filtering
- Mark as read / mark all as read

Completes Week 5 checklist.
"
```

---

## ⚠️ Common Gotchas

| Issue | Solution |
|-------|----------|
| Realtime not working | Check Supabase project has Realtime enabled (Settings → Realtime) |
| Notifications not creating | Check triggers are created in Supabase SQL Editor |
| Duplicate notifications | Add WHERE clause to trigger to prevent self-notifications |
| Bell doesn't update | Ensure useQuery + Realtime subscription are both active |

---

## 🚀 Success Metrics

- **Realtime**: New comments visible < 1s
- **Notifications**: Badge updates automatically
- **Code**: All TypeScript checks pass
- **Mobile**: Bell accessible and functional

---

## Next: Week 6

Once Week 5 complete:
- [ ] Realtime subscriptions working
- [ ] Notifications creating automatically
- [ ] No duplicate notifications
- **Ready for**: Week 6 - Polish & Deploy (final week!)

---

**Estimation**: 3-4 hours with Claude Code  
**Key Challenge**: Getting Supabase Realtime subscriptions to work correctly (test thoroughly)

