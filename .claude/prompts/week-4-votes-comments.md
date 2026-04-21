# Week 4: Votes + Reactions + Hierarchical Comments

> **For Claude Code / Codex**: Copy entire prompt below and paste into Claude Code chat

---

## 🎯 Objective

Interactive features: upvotes/downvotes, emoji reactions, nested comments (2 levels).

**User Stories**:
1. Upvote/downvote posts and comments
2. React with emoji (6 types: like, heart, laugh, wow, sad, angry)
3. Create comments on posts
4. Reply to comments (nested under parent)
5. Vote on comments (upvote only)

---

## 📋 Implementation Plan

### Phase 1: Backend (tRPC API)

**File**: `packages/api/src/routers/votes.ts` (new)

```typescript
// Procedures:
// - vote(targetType: 'post'|'comment', targetId, voteType: 'up'|'down') -> { success } (protected)
// - removeVote(targetType, targetId) -> { success } (protected)
// - getVoteScore(targetType, targetId) -> { upvotes, downvotes, userVote? } (public)
```

**File**: `packages/api/src/routers/reactions.ts` (new)

```typescript
// Procedures:
// - addReaction(postId|commentId, emoji: ReactionEmoji) -> { success } (protected)
// - removeReaction(postId|commentId, emoji) -> { success } (protected)
// - getReactions(postId|commentId) -> { [emoji]: count }[] (public)
```

**File**: `packages/api/src/routers/comments.ts` (new)

```typescript
// Procedures:
// - getList(postId) -> Comment[] (hierarchical tree) (public)
// - create(postId, parentId?, content, isAnonymous) -> Comment (protected)
// - delete(id) -> { success } (protected, owner only)
// - updateCommentCount(postId) -> void (internal)
```

**Logic**:
- Votes: UNIQUE(userId, targetType, targetId) prevents duplicates
- Vote updates post.upvote_count / downvote_count in real-time
- Comments: Assign `anonNumber` per post (consistency: same user = same number)
- Hierarchical: depth 0 (top-level), depth 1 (reply to post), depth 2 (reply to comment)
- Max depth: 2 (no deeper nesting)

---

### Phase 2: Database

**Status**: ✓ Schema has votes, reactions, comments

**Verify**:
- [ ] `votes` table has UNIQUE(user_id, target_type, target_id)
- [ ] `comments` table has `depth`, `parent_id`, `anon_number` fields
- [ ] Trigger to update `post.comment_count` on comment insert/delete

---

### Phase 3: Frontend

**Vote Components**:

1. **`apps/web/src/components/VoteButtons.tsx`** (reusable)
   - Input: targetType, targetId, currentVotes
   - Display: up arrow, score, down arrow
   - Toggle logic:
     - Click up: if already up, remove vote; else set to up
     - Click down: same logic
   - Highlight button if user has voted that direction
   - Call `trpc.votes.vote.useMutation()` / `trpc.votes.removeVote.useMutation()`
   - Disable if not logged in (show tooltip)
   - Optimistic update (instant UI feedback)

2. **Update `PostCard.tsx`**:
   - Add VoteButtons component
   - Display vote count

3. **Update Post Detail Page**:
   - Add VoteButtons at top

**Reaction Components**:

4. **`apps/web/src/components/ReactionPicker.tsx`** (reusable)
   - Display 6 emoji buttons: 👍 ❤️ 😂 😮 😢 😠
   - Show count next to each
   - Click to toggle (add/remove)
   - Highlight if user has reacted
   - Call `trpc.reactions.addReaction.useMutation()` / `removeReaction.useMutation()`
   - Show "Add reaction" tooltip on hover

5. **Update `PostCard.tsx`** & **Post Detail**:
   - Add ReactionPicker component
   - Display reactions below post

**Comment Components**:

6. **`apps/web/src/components/CommentTree.tsx`** (new, displays all comments)
   - Input: comments[] (pre-sorted by depth + createdAt)
   - Render as tree:
     - Depth 0: full width
     - Depth 1 (reply to post): indent 20px
     - Depth 2 (reply to comment): indent 40px
   - Each comment shows:
     - Author (or "익명1", "익명2" consistent per post)
     - Content
     - VoteButtons (upvote only on comments)
     - "Reply" button → show reply form
     - Delete button (if author)
     - Posted time
   - Visual separation (border-left or background tint for nested)

7. **`apps/web/src/components/CommentForm.tsx`** (reusable)
   - Textarea: content (max 2000 chars)
   - Anonymous toggle
   - Reply to comment label (if replying to comment)
   - Submit button
   - Cancel button (if reply form)
   - Uses `trpc.comments.create.useMutation()`

8. **Update `apps/web/src/app/(main)/posts/[postId]/page.tsx`**:
   - Replace empty comments section with:
     - "Add comment" form (top level)
     - CommentTree component below

---

## ✅ Acceptance Criteria

- [ ] Upvote post → count increases, button highlights
- [ ] Downvote post → count decreases
- [ ] Remove vote → reverts to original
- [ ] Vote on comment → works same as post
- [ ] Add emoji reaction → displays under post
- [ ] Remove emoji → reaction disappears
- [ ] Create comment → appears in tree at top level
- [ ] Reply to post comment → nested properly (indent)
- [ ] Reply to reply → nested 2 levels deep
- [ ] Anonymous comment → shows "익명1", "익명2" (consistent per post)
- [ ] Delete own comment → removed from tree
- [ ] Upvote comment only (no downvote) → works
- [ ] No TypeScript errors, no console errors
- [ ] Mobile responsive

---

## 🔍 Reference Files

**Study patterns**:
- `packages/api/src/routers/posts.ts` - How to structure mutations
- `packages/db/src/schema/index.ts` - votes, reactions, comments tables
- Week 3 PostCard component - reusable component pattern

---

## 📝 Detailed Task Breakdown

### Step 1: Vote Backend (30 min)
- Create votes.ts router
- vote/removeVote mutations
- Register in index.ts

### Step 2: Vote Frontend (45 min)
- Build VoteButtons component
- Integrate into PostCard
- Test: upvote → count updates

### Step 3: Reaction Backend (20 min)
- Create reactions.ts router
- addReaction/removeReaction mutations

### Step 4: Reaction Frontend (30 min)
- Build ReactionPicker component
- Integrate into PostCard
- Test: add emoji → displays

### Step 5: Comment Backend (30 min)
- Create comments.ts router
- create mutation (handle anonNumber logic)
- getList query (return hierarchical tree)

### Step 6: Comment Frontend (1.5 hours)
- Build CommentTree component
- Build CommentForm component
- Integrate into post detail page
- Test: create comment, reply to comment, delete

### Step 7: Polish (30 min)
- Mobile responsive
- Error handling
- Optimistic updates
- Type check & lint

---

## 🧪 Manual Testing Checklist

1. **Votes**:
   - [ ] On post detail page, click upvote
   - [ ] Count increases, button highlights
   - [ ] Click again, reverts
   - [ ] Click downvote, changes to down
   - [ ] Vote on comment, works same
   - [ ] Not logged in → tooltip "Sign in to vote"

2. **Reactions**:
   - [ ] Hover emoji buttons, see tooltip
   - [ ] Click like, displays under post with count "1"
   - [ ] Click heart, displays "❤️ 1"
   - [ ] Click heart again, removes reaction
   - [ ] Multiple users react → count increases

3. **Comments**:
   - [ ] On post detail, see "Add comment" form
   - [ ] Fill content, click submit
   - [ ] Comment appears at top of tree
   - [ ] Author shows your name (or "익명" if checked)
   - [ ] Delete button works if your comment

4. **Nested Comments**:
   - [ ] Click "Reply" on a comment
   - [ ] Reply form appears (indented or modal)
   - [ ] Fill content, click submit
   - [ ] Reply appears nested under parent
   - [ ] Verify anonNumber: reply to same post shows "익명1" both times

5. **Comment Voting**:
   - [ ] In comment tree, see upvote button (no downvote)
   - [ ] Upvote comment, count increases
   - [ ] Works for nested comments too

6. **Mobile**:
   - [ ] Vote/reaction buttons accessible at 375px
   - [ ] Comment tree indentation clear (don't collapse)
   - [ ] Reply form doesn't overflow

---

## Git Workflow

```bash
git commit -m "feat: implement votes, reactions, hierarchical comments (Week 4)

- Upvote/downvote on posts & comments
- Emoji reactions (6 types)
- Hierarchical comments (2 levels)
- Anonymous comment numbering (consistency)
- Real-time vote/reaction updates
- Full comment tree with nesting UI

Completes Week 4 checklist.
"
```

---

## 🚀 Success Metrics

- **Code**: All TypeScript checks pass
- **UX**: Votes/reactions update instantly (optimistic)
- **Data**: Anonymous comment numbers consistent per post
- **Mobile**: Fully responsive at 375px+

---

## Next: Week 5

Once Week 4 complete:
- [ ] All voting works correctly
- [ ] Comments fully nested & functional
- [ ] No race conditions on vote/reaction
- **Ready for**: Week 5 - Realtime Comments + Notifications

---

**Estimation**: 4-5 hours with Claude Code  
**Key Challenge**: Anonymous comment numbering (same user per post = same "익명N")

