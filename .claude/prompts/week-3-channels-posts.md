# Week 3: Channels + Posts CRUD with Image Upload

> **For Claude Code / Codex**: Copy entire prompt below and paste into Claude Code chat

---

## 🎯 Objective

Full CRUD for channels and posts, infinite scroll feed, image uploads to Supabase Storage.

**User Stories**:
1. View list of channels, join/leave channels
2. Create post (text + optional title, channel selection)
3. Infinite scroll feed with posts
4. Upload images with posts
5. Delete own posts
6. Anonymous mode toggle per post

---

## 📋 Implementation Plan

### Phase 1: Backend (tRPC API)

**File**: `packages/api/src/routers/channels.ts` (new)

```typescript
// Procedures:
// - getList(limit?, offset?) -> { items: Channel[], hasMore: boolean } (public)
// - getById(id: string) -> Channel (public)
// - create(name, description, slug) -> Channel (protectedProcedure)
// - join(channelId) -> { success: boolean } (protectedProcedure)
// - leave(channelId) -> { success: boolean } (protectedProcedure)
```

**File**: `packages/api/src/routers/posts.ts` (expand existing)

Add/modify:
```typescript
// - getFeed(channelId?, sort, limit, offset, cursor?) -> { items, hasMore } (public)
// - getById(id) -> Post with author info (public, but hide author if anonymous)
// - create(channelId, title?, content, isAnonymous, mediaUrls[]) -> Post (protectedProcedure)
// - delete(id) -> { success } (protectedProcedure, owner only)
// - incrementViewCount(id) -> void (public, fire-and-forget)
```

**Logic**:
- Hot score: Already in schema, pre-calculate for now (Phase 2: pg_cron)
- Anonymous: If `isAnonymous=true`, generate `anonAlias` (e.g., "익명토끼")
- Image URLs: Already passed from frontend (uploaded to Storage)

---

### Phase 2: Database

**Status**: ✓ Schema already has channels, posts, channel_members

**Verify**:
- [ ] `pnpm db:push` completes without errors
- [ ] `pnpm db:studio` shows tables created

---

### Phase 3: Frontend

**Main Layout**:

1. **`apps/web/src/app/(main)/layout.tsx`** (modify)
   - Add sidebar with channel list
   - Channel list: scrollable, join/leave buttons
   - "Create channel" button (optional for Week 3)
   - Main content area with feed

2. **`apps/web/src/components/Sidebar.tsx`** (new)
   - `trpc.channels.getList.useQuery()` → list channels
   - For each channel: name + join/leave button
   - Click to set active channel filter in feed
   - Loading skeleton

3. **`apps/web/src/app/(main)/feed/page.tsx`** (new)
   - Post creation form (floating button or modal)
   - Post list with infinite scroll
   - Sort buttons: Hot / New / Top
   - Empty state if no posts

**Feed Components**:

4. **`apps/web/src/components/PostCreateModal.tsx`** (new)
   - Form fields:
     - Title (optional, max 300 chars)
     - Content (required, max 10000 chars)
     - Channel select (dropdown of user's joined channels)
     - Image upload (multipart, show preview)
     - Anonymous toggle checkbox
   - Submit: `trpc.posts.create.useMutation()`
   - Show loading spinner during upload
   - Success: close modal, add post to feed

5. **`apps/web/src/components/PostCard.tsx`** (new)
   - Display:
     - Author name (or "익명" if anonymous)
     - Title (if exists)
     - Content (truncate if long)
     - Image (if exists, use Next.js Image with lazy load)
     - Stats: upvote count, comment count, views
     - Posted time (e.g., "2 hours ago")
   - Click → navigate to `/posts/[postId]`
   - Delete button (if author)

6. **`apps/web/src/components/InfinitePostList.tsx`** (new)
   - Use Intersection Observer on last item
   - `useQuery` with `offset` for pagination
   - Load more when user scrolls to bottom
   - Show "Loading..." while fetching
   - Handle "no more posts" state

7. **`apps/web/src/app/(main)/posts/[postId]/page.tsx`** (new)
   - Full post view
   - Comments section (empty for now)
   - Delete button (if owner)

**Image Upload**:

8. **`apps/web/src/lib/storage.ts`** (new)
   - Function: `uploadPostImage(file, postId)` → URL
   - Uses `supabase.storage.from('posts').upload()`
   - Path: `posts/${postId}/${filename}`
   - Return public URL
   - Handle errors (size, format)

9. **`apps/web/src/components/ImageUpload.tsx`** (reusable)
   - File input with preview
   - Show image before submit
   - Remove button if needed
   - Drag-drop support (nice-to-have)

---

## ✅ Acceptance Criteria

- [ ] View list of channels
- [ ] Join/leave channel updates sidebar
- [ ] Create post: fills form, uploads image, shows in feed
- [ ] Feed infinite scroll: load more on scroll to bottom
- [ ] Anonymous post: shows "익명" instead of name
- [ ] Delete post: only author can delete, disappears from feed
- [ ] Image uploads: preview before post, loads in feed
- [ ] Sort: Hot/New/Top changes feed order
- [ ] No TypeScript errors: `pnpm type-check` passes
- [ ] No console errors in browser
- [ ] Mobile responsive

---

## 🔍 Reference Files

**Existing patterns**:
- `packages/api/src/routers/posts.ts` - tRPC router example
- `packages/db/src/schema/index.ts` - posts, channels, channel_members tables
- `apps/web/src/lib/supabase.ts` - Supabase client (use for Storage)

**Study these before starting**:
- Week 2 auth implementation (session persistence)
- How `useQuery` with offset works (pagination pattern)

---

## 📝 Detailed Task Breakdown

### Step 1: Backend Channels Router (30 min)
```bash
# Create channels.ts with getList, getById, create, join, leave procedures
# Register in routers/index.ts
# Test with curl or tRPC Postman
```

### Step 2: Extend Posts Router (30 min)
```bash
# Add getList (getFeed), create (with mediaUrls), delete
# Keep existing getById
# Ensure anonymous logic works
```

### Step 3: Frontend Main Layout (45 min)
```bash
# Build (main)/layout with sidebar
# Sidebar: channel list fetching
# Main content area for feed
```

### Step 4: Post Creation Flow (1 hour)
```bash
# Build PostCreateModal
# Image upload function (storage.ts)
# Test: create post → see in feed
```

### Step 5: Infinite Scroll Feed (1 hour)
```bash
# Build InfinitePostList with Intersection Observer
# PostCard component
# Sort buttons (hot/new/top)
# Test: scroll, load more posts
```

### Step 6: Polish & Test (45 min)
```bash
# Mobile responsive
# Error handling
# Loading states
# Empty states
# pnpm type-check & lint
```

---

## 🧪 Manual Testing Checklist

1. **Channel List**:
   - [ ] Load `/feed`, see list of channels in sidebar
   - [ ] Click channel name, filter feed by that channel
   - [ ] Join channel, appears in "My Channels"
   - [ ] Leave channel, disappears

2. **Post Creation**:
   - [ ] Open create modal
   - [ ] Fill title, content, select channel
   - [ ] Upload image, see preview
   - [ ] Toggle anonymous
   - [ ] Submit
   - [ ] Post appears in feed immediately

3. **Infinite Scroll**:
   - [ ] Feed shows 20 posts
   - [ ] Scroll to bottom
   - [ ] Automatically load next 20
   - [ ] No duplicate posts
   - [ ] "No more posts" when at end

4. **Feed Sorting**:
   - [ ] Click "Hot" → sorted by hot_score
   - [ ] Click "New" → sorted by created_at DESC
   - [ ] Click "Top" → sorted by upvote_count DESC

5. **Anonymous Posts**:
   - [ ] Create post with anonymous=true
   - [ ] Shows author as "익명" (not your name)
   - [ ] Can still delete (you know it's yours via DB)

6. **Images**:
   - [ ] Upload image with post
   - [ ] Image displays in feed with lazy load
   - [ ] Image displays on detail page
   - [ ] DevTools: image is from Supabase Storage URL

---

## Git Workflow

```bash
git commit -m "feat: implement channels + posts CRUD (Week 3)

- Channels: list, create, join/leave
- Posts: full CRUD, infinite scroll feed
- Image upload to Supabase Storage
- Anonymous post support
- Hot/new/top sorting
- Responsive UI

Completes Week 3 checklist.
"
```

---

## 🚀 Success Metrics

- **Code**: `pnpm type-check` + `pnpm lint` pass
- **Functionality**: All acceptance criteria met
- **UX**: Smooth scrolling, no janky loading
- **Mobile**: Works at 375px width

---

## Next: Week 4

Once Week 3 complete:
- [ ] All posts render correctly
- [ ] Infinite scroll works without bugs
- [ ] Images load properly
- **Ready for**: Week 4 - Votes + Comments

---

**Estimation**: 3-4 hours with Claude Code  
**Key Challenge**: Infinite scroll pagination logic (study cursor-based pagination if needed)

