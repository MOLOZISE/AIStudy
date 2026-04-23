# Week 6: Polish, Sorting, Search, Report Feature + Final Deploy

> **For Claude Code / Codex**: Copy entire prompt below and paste into Claude Code chat

---

## 🎯 Objective

Add missing features (search, report), optimize performance, ensure mobile responsiveness, deploy Phase 1 MVP.

**Deliverables**:
1. Hot/New/Top post sorting working correctly
2. Full-text search for posts
3. Report feature (spam, hate, inappropriate)
4. Image lazy loading optimization
5. Mobile responsive (375px+)
6. Deployed to Vercel

---

## 📋 Implementation Plan

### Phase 1: Backend (tRPC API)

**File**: `packages/api/src/routers/search.ts` (new)

```typescript
// Procedures:
// - searchPosts(q: string, limit?, offset?) -> { items: Post[], hasMore } (public)
// - searchUsers(q: string, limit?) -> User[] (public)
```

**Logic**:
- Simple ILIKE search on `posts.content` and `posts.title`
- Case-insensitive, supports partial matching
- Example: "react" finds "React is awesome" and "learn react"
- (Phase 2: pgvector for semantic search)

**File**: `packages/api/src/routers/reports.ts` (new)

```typescript
// Procedures:
// - createReport(targetType, targetId, reason, description?) -> { success } (protected)
// - getReports() -> Report[] (admin only, not yet implemented)
// - updateReportStatus(reportId, status) -> { success } (admin only)
```

**Hot Score Calculation** (in posts router):

Pre-calculate hot_score using Wilson Score formula:
```typescript
const calculateHotScore = (post: Post): number => {
  const upvotes = post.upvote_count;
  const downvotes = post.downvote_count;
  const comments = post.comment_count;
  
  // Wilson Score
  const n = upvotes + downvotes;
  const wilsonScore = n === 0
    ? 0
    : (upvotes / n) - 1.96 * Math.sqrt((upvotes * downvotes) / (n * n * n));
  
  // Time decay (hours since post)
  const hoursSince = (Date.now() - post.created_at) / 3600000;
  const decay = Math.pow(hoursSince + 2, 1.5);
  
  // Engagement bonus
  const engagement = Math.log10(Math.max(comments * 2 + post.view_count * 0.1, 1));
  
  return (wilsonScore + engagement) / decay;
};
```

---

### Phase 2: Frontend - Search

1. **`apps/web/src/components/SearchBar.tsx`** (new)
   - Input field in header
   - Autocomplete suggestions (show as user types)
   - Debounce 300ms to avoid excessive requests
   - On search: navigate to `/search?q=...`

2. **`apps/web/src/app/(main)/search/page.tsx`** (new)
   - Display search results (posts + users)
   - Pagination or infinite scroll
   - Show "No results" if empty
   - Highlight search term in results
   - Filter tabs: Posts / Users (optional)

3. **Update header**:
   - Add SearchBar component
   - Mobile: collapsible search icon

---

### Phase 3: Frontend - Report

1. **`apps/web/src/components/ReportButton.tsx`** (reusable)
   - "Report" button/icon on posts/comments
   - Click → modal with form

2. **`apps/web/src/components/ReportModal.tsx`** (new)
   - Form fields:
     - Reason (dropdown): Spam / Hate / Inappropriate / Other
     - Description (textarea, optional)
   - Submit button
   - Success: "Thank you for reporting"
   - Uses `trpc.reports.createReport.useMutation()`

3. **Update PostCard & CommentTree**:
   - Add ReportButton component
   - Report icon (flag or ⋯ menu)

---

### Phase 4: Frontend - Performance

1. **Image Lazy Loading** (already using Next.js Image, verify):
   - All images use `<Image loading="lazy" />`
   - Responsive `srcSet` for different screen sizes
   - Placeholder blur hash (optional)

2. **Infinite Scroll Optimization**:
   - Debounce scroll event (150ms)
   - Cancel redundant requests
   - Cache previous pages

3. **Code Splitting** (Next.js App Router auto-does this):
   - Verify no large imports at top-level
   - Dynamic imports for modals if needed

---

### Phase 5: Frontend - Mobile Responsive

**Breakpoints**:
- 375px (iPhone SE)
- 667px (iPhone 8)
- 812px (iPhone 13)
- 1024px (iPad)

**Key Adjustments**:
- Sidebar → hamburger menu on mobile (< 768px)
- Vote/reaction buttons → remain accessible (min 44px touch target)
- Comment tree indentation → reduce padding on mobile
- Search bar → collapse to icon on mobile
- Images → full width, aspect ratio preserved

**Test**:
```bash
# Chrome DevTools:
# 1. Toggle device toolbar (Ctrl+Shift+M)
# 2. Test at iPhone 12 (390px), iPhone SE (375px)
# 3. Test in landscape orientation
# 4. Check all buttons are touch-friendly (44px+)
```

---

### Phase 6: Final QA & Deployment

**Vercel Setup**:
1. Env vars configured:
   - ✓ `NEXT_PUBLIC_SUPABASE_URL`
   - ✓ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✓ `DATABASE_URL`
2. Build succeeds locally: `pnpm build`
3. No TypeScript errors: `pnpm type-check`
4. No lint errors: `pnpm lint`

**Pre-Deploy Checklist**:
- [ ] Signup/login flow works
- [ ] Create post + image → appears in feed
- [ ] Upvote/downvote + reactions → work
- [ ] Create comment/reply → appear in realtime
- [ ] Notification bell shows count → click goes to post
- [ ] Search finds posts
- [ ] Report feature submits
- [ ] Delete post/comment → removes from UI
- [ ] Logout → redirects to login
- [ ] Mobile: test at 375px
  - [ ] Sidebar accessible
  - [ ] Vote buttons clickable
  - [ ] Images load
  - [ ] Comments readable
- [ ] Desktop: test at 1920px
  - [ ] No weird stretching
  - [ ] Layout clean

**Deploy**:
```bash
git push origin main
# Vercel detects push
# Runs: pnpm build
# Deploys to https://company-community.vercel.app
# Check deployment succeeded in Vercel dashboard
```

**Post-Deploy Verification**:
- [ ] Live site loads
- [ ] Can signup/login
- [ ] Can create post
- [ ] Search works
- [ ] No 500 errors (check Vercel logs)

---

## ✅ Acceptance Criteria

- [ ] Hot sorting: posts ordered by Wilson Score + time decay
- [ ] New sorting: posts ordered by creation date (descending)
- [ ] Top sorting: posts ordered by upvote count (descending)
- [ ] Search: find posts by keyword in title/content
- [ ] Report: submit report, no errors
- [ ] Images: lazy load (verify with DevTools Network tab)
- [ ] Mobile: fully responsive at 375px+
  - [ ] All text readable
  - [ ] Buttons/links are 44px+ touch targets
  - [ ] No horizontal scroll
- [ ] Desktop: looks good at 1920px
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Deployed to Vercel
- [ ] Live site works (signup → feed → post → comment)

---

## 📝 Detailed Task Breakdown

### Step 1: Hot Score Backend (30 min)
- Implement hot score calculation
- Add to posts.getFeed query sorting
- Test: create posts, upvote some, check order changes

### Step 2: Search Backend (20 min)
- Create search.ts router
- searchPosts procedure
- Register in routers/index.ts

### Step 3: Search Frontend (45 min)
- SearchBar component
- /search page
- Results display
- Mobile collapsible search

### Step 4: Report Feature (30 min)
- ReportButton component
- ReportModal component
- Integrate into PostCard & comments
- Backend endpoint

### Step 5: Mobile Responsive (1 hour)
- Review all components
- Adjust padding/margin for mobile
- Test on actual device or DevTools
- Hamburger menu for sidebar (if needed)

### Step 6: Performance & Optimization (30 min)
- Verify lazy loading
- Check bundle size
- Run Lighthouse
- Fix any issues

### Step 7: Final QA & Deploy (1 hour)
- Run full checklist
- Local build test
- Push to main
- Verify live deployment
- Test in production

---

## 🧪 Manual Testing Checklist

### Sorting
- [ ] Load `/feed`, see posts in order
- [ ] Click "Hot" button
- [ ] Posts reorder by hot score
- [ ] Click "New"
- [ ] Posts reorder by creation date (newest first)
- [ ] Click "Top"
- [ ] Posts reorder by upvote count (highest first)

### Search
- [ ] In header, type "react"
- [ ] See suggestions appear
- [ ] Press Enter
- [ ] Navigate to `/search?q=react`
- [ ] See matching posts
- [ ] Click result, go to post detail

### Report
- [ ] On any post, click "Report" (button or menu)
- [ ] Modal opens
- [ ] Select reason (Spam, Hate, etc.)
- [ ] Add description
- [ ] Click Submit
- [ ] See success message "Thanks for reporting"

### Mobile (375px)
- [ ] Open site on iPhone (or DevTools)
- [ ] All text readable (no squishing)
- [ ] Can tap vote buttons (no mis-taps)
- [ ] Images display correctly
- [ ] Comments indentation clear
- [ ] Search bar works (icon or visible)
- [ ] Sidebar toggleable (menu icon)

### Performance
- [ ] Open DevTools → Network
- [ ] Scroll feed
- [ ] Images load lazily (see "lazy" in Network)
- [ ] No large JS bundles
- [ ] Page load < 3s
- [ ] Lighthouse score > 80

### Post-Deploy
- [ ] Visit https://company-community.vercel.app
- [ ] Signup works
- [ ] Can create post
- [ ] Can search
- [ ] No errors in console
- [ ] Mobile responsive on actual phone

---

## Git Workflow

```bash
git commit -m "feat: search, report, sorting, performance & mobile polish (Week 6)

- Hot/new/top post sorting (Wilson Score algorithm)
- Full-text search for posts & users
- Report feature (spam, hate, inappropriate)
- Image lazy loading (Next.js Image)
- Mobile responsive (375px+)
- Performance optimization (Lighthouse > 80)
- Final QA checklist passed
- Deployed to Vercel

Completes Phase 1 MVP - All 6 weeks done!
"
git push origin main
```

---

## 📊 Success Metrics

- **Code Quality**: All tests pass, no TS/lint errors
- **Performance**: Lighthouse > 80, Core Web Vitals green
- **Functionality**: All acceptance criteria met
- **Mobile**: Fully responsive, touch-friendly
- **Deployment**: Live on Vercel, no 500 errors

---

## 🎉 Phase 1 Complete!

Once deployed successfully:
- [ ] Document lessons learned
- [ ] Collect user feedback (if testing with team)
- [ ] Plan Phase 2 roadmap
- [ ] Celebrate! 🚀

### Phase 2 Preview (Future):
- Follow system + Trust scores
- DM system
- Video uploads
- Expo native mobile app
- pgvector semantic search

---

**Estimation**: 5-6 hours with Claude Code  
**Focus**: Mobile responsiveness (most time-consuming)  
**Celebration**: This is the final week! Deploy to Vercel and celebrate MVP completion.

