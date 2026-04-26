# Phase 7 — API Integration Audit Report

## Executive Summary

AIStudy UI Phase 1-6 is built with 20+ mock data fixtures. Existing tRPC routers have 70+ procedures covering workbooks, questions, attempts, wrong notes, quests, badges, leaderboards, and more. **Integration is straightforward**: most UI screens can be connected to existing APIs with minimal changes.

**Key Finding**: No schema changes needed. UI types align with existing DB tables. Custom hooks will decouple mock data from API calls, enabling seamless migration.

---

## Mock Data Usage Audit

### Dashboard & Main Views

| Mock Data | Type | UI Component | Existing API | Status |
|-----------|------|--------------|--------------|--------|
| `mockDashboardSummary` | DashboardSummary | `/study/page.tsx` | ✅ `getMyProgress` + `getTodayQuests` | Ready |
| `mockUserProgress` | UserProgressSummary | MyPage, Points | ✅ `getMyProgress` + `getGrowthSummary` | Ready |
| `mockQuests` | QuestItem[] | Quests page | ✅ `getTodayQuests`, `getWeeklyQuests`, `getMonthlyQuests` | Ready |

### Workbook Management

| Mock Data | Type | UI Component | Existing API | Status |
|-----------|------|--------------|--------------|--------|
| `mockWorkbookListItems` | WorkbookListItem[] | `/study/workbooks` | ✅ `listWorkbooks` | Ready |
| `mockPublicWorkbooks` | PublicWorkbook[] | `/study/discover` | ✅ `listPublicWorkbooks` | Ready |
| `mockWorkbookDetail` | WorkbookDetail | `/study/workbooks/[id]` | ✅ `getPublicWorkbookDetail` | Ready |
| `mockWorkbookRating` | WorkbookRating | Workbook detail rating panel | ✅ `reviewWorkbook`, `likeWorkbook` | Ready |

### Question & Solving

| Mock Data | Type | UI Component | Existing API | Status |
|-----------|------|--------------|--------------|--------|
| `mockSolveQuestions` | SolveQuestion[] | `/study/workbooks/[id]/solve` | ✅ `getExamSet` or `listQuestions` | Ready |
| `mockAttemptResult` | AttemptResult | `/study/workbooks/[id]/results/[attemptId]` | ✅ `submitAttempt` returns result | Ready |
| `mockGeneratedQuestions` | GeneratedQuestion[] | Generation preview | ⚠️ `getGeneratedWorkbookPreview` | Minor Mapping |

### Wrong Notes & Review

| Mock Data | Type | UI Component | Existing API | Status |
|-----------|------|--------------|--------------|--------|
| `mockWrongNotes` | WrongNote[] | `/study/wrong-notes` | ✅ `listWrongNotes` | Ready |
| (WrongNote detail) | WrongNote | Wrong note detail panel | ✅ `listWrongNotes` returns full object | Ready |

### Gamification & User Progress

| Mock Data | Type | UI Component | Existing API | Status |
|-----------|------|--------------|--------------|--------|
| `mockBadges` | Badge[] | `/study/mypage/badges` | ✅ `getMyBadges` + `getBadgeCollection` | Ready |
| `mockPointHistory` | PointTransaction[] | `/study/mypage/points` | ✅ `listRecentRewardEvents` | Minor Mapping |
| `mockLearningStats` | LearningStats | `/study/mypage/stats` | ✅ `getStats` + `getLearningAnalytics` | Ready |
| `mockLeaderboardEntries` | LeaderboardEntry[] | `/study/mypage/ranking` | ✅ `getWeeklyXpLeaderboard` + `getWeeklySolvedLeaderboard` | Ready |

### Community & Comments

| Mock Data | Type | UI Component | Existing API | Status |
|-----------|------|--------------|--------------|--------|
| `mockCommunityPosts` | CommunityPost[] | `/study/community` | ⚠️ No post list API yet | **MISSING** |
| `mockCommentPreviews` | CommentPreview[] | Workbook detail comments | ✅ `listCommentsByTarget` | Ready |

### AI Generation & Jobs

| Mock Data | Type | UI Component | Existing API | Status |
|-----------|------|--------------|--------------|--------|
| `mockGenerationJob` | GenerationJob | `/study/generate/progress/[jobId]` | ✅ `getAiGenerationJob` | Ready |
| (Job creation) | — | Generation PDF upload | ✅ `createAiGenerationJob` | Ready |

### Workbook History

| Mock Data | Type | UI Component | Existing API | Status |
|-----------|------|--------------|--------------|--------|
| `mockWorkbookHistory` | WorkbookHistoryEvent[] | `/study/mypage/history` | ⚠️ No dedicated history API | **TODO** |

---

## Integration Mapping

### Ready (Direct Connection)

These can be connected immediately to existing APIs with 1:1 mapping:

1. **Dashboard** → `getMyProgress` + `getTodayQuests`
2. **My Workbooks** → `listWorkbooks`
3. **Public Workbooks** → `listPublicWorkbooks`
4. **Workbook Detail** → `getPublicWorkbookDetail`
5. **Solving** → `getExamSet` + `submitAttempt`
6. **Attempt Results** → From `submitAttempt` response
7. **Wrong Notes** → `listWrongNotes`
8. **User Progress** → `getMyProgress` + `getGrowthSummary`
9. **Badges** → `getMyBadges` + `getBadgeCollection`
10. **Learning Stats** → `getStats` + `getLearningAnalytics`
11. **Leaderboards** → `getWeeklyXpLeaderboard` + `getWeeklySolvedLeaderboard`
12. **Quests** → `getTodayQuests`, `getWeeklyQuests`, `getMonthlyQuests`
13. **Comments** → `listCommentsByTarget`
14. **AI Generation Jobs** → `getAiGenerationJob` + `createAiGenerationJob`

### Minor Mapping (Adapter Pattern)

These require lightweight adapter functions to reshape API responses:

1. **Point History** — `listRecentRewardEvents` → adapt to `PointTransaction[]` format
2. **Generated Questions** — `getGeneratedWorkbookPreview` → adapt to `GeneratedQuestion[]` format
3. **Workbook Rating** — `reviewWorkbook` + `likeWorkbook` → combine into `WorkbookRating`

### Missing (TODO)

1. **Community Posts List** — No public API for community post feed. Proposal: Add `listCommunityPosts` procedure
2. **Workbook History** — No dedicated history API. Proposal: Use workbook audit trail or add `listMyWorkbookHistory` procedure

---

## Custom Hook Architecture

All UI components will use custom hooks instead of direct mock data imports. This enables:
- Easy mock → API switch (set `useMockData: boolean`)
- Consistent error/loading states
- Type-safe data transitions
- Clean separation of concerns

### Hook List & Implementation Priority

#### Priority 1 (Core user flows)

- `useStudyDashboard()` — Dashboard summary + today's quests
- `useWorkbookList()` — My workbooks list
- `usePublicWorkbookList()` — Discover/Browse public workbooks
- `usePublicWorkbookDetail()` — Workbook detail page
- `useUserProgress()` — User level, XP, points, badges

#### Priority 2 (Learning flows)

- `useExamSet()` — Questions for solving
- `useSubmitAttempt()` — Submit answer mutation
- `useAttemptResult()` — View attempt results
- `useWrongNotes()` — List wrong notes
- `useWrongNoteDetail()` — Single wrong note

#### Priority 3 (Gamification)

- `useQuests()` — Today/Weekly/Monthly quests
- `useLeaderboard()` — Weekly XP and solved leaderboards
- `useUserBadges()` — User's badge collection
- `useLearningStats()` — Analytics and per-subject stats
- `usePointHistory()` — Recent reward events

#### Priority 4 (AI & Community)

- `useGenerationJob()` — AI job status
- `useCommunityPosts()` — Post feed (TODO API)
- `useWorkbookHistory()` — User's workbook activity (TODO API)

---

## Implementation Plan

### Phase 7A: Core Hooks (Days 1-2)

Create 6 high-impact hooks covering dashboard, workbooks, and user progress:

```ts
// apps/web/src/lib/study/hooks/use-study-dashboard.ts
// apps/web/src/lib/study/hooks/use-workbook-list.ts
// apps/web/src/lib/study/hooks/use-public-workbook-list.ts
// apps/web/src/lib/study/hooks/use-public-workbook-detail.ts
// apps/web/src/lib/study/hooks/use-user-progress.ts
// apps/web/src/lib/study/hooks/use-leaderboard.ts
```

Each hook:
- Accepts optional `useMockData: boolean` param
- Returns `{ data, isLoading, error }` state
- Uses tRPC query/mutation when `useMockData=false`
- Falls back to mock data when `useMockData=true`

### Phase 7B: Learning Hooks (Days 3-4)

```ts
// apps/web/src/lib/study/hooks/use-exam-set.ts
// apps/web/src/lib/study/hooks/use-submit-attempt.ts
// apps/web/src/lib/study/hooks/use-attempt-result.ts
// apps/web/src/lib/study/hooks/use-wrong-notes.ts
```

### Phase 7C: Gamification Hooks (Day 5)

```ts
// apps/web/src/lib/study/hooks/use-quests.ts
// apps/web/src/lib/study/hooks/use-user-badges.ts
// apps/web/src/lib/study/hooks/use-learning-stats.ts
// apps/web/src/lib/study/hooks/use-point-history.ts
```

### Phase 7D: Community & Generation Hooks (Day 6)

```ts
// apps/web/src/lib/study/hooks/use-generation-job.ts
// apps/web/src/lib/study/hooks/use-community-posts.ts (with TODO note)
// apps/web/src/lib/study/hooks/use-workbook-history.ts (with TODO note)
```

### Phase 7E: UI Integration (Days 7-8)

Replace mock data imports in pages with custom hooks. Example refactor:

**Before:**
```tsx
import { mockWorkbookListItems } from '@/lib/study/mock-data';

export default function WorkbooksPage() {
  return <WorkbookList workbooks={mockWorkbookListItems} />;
}
```

**After:**
```tsx
import { useWorkbookList } from '@/lib/study/hooks';

export default function WorkbooksPage() {
  const { data: workbooks, isLoading, error } = useWorkbookList({ useMockData: false });
  
  if (isLoading) return <SkeletonList count={5} />;
  if (error) return <EmptyState title="Error loading workbooks" />;
  
  return <WorkbookList workbooks={workbooks} />;
}
```

---

## Risk Assessment

### No Schema Changes

✅ Existing DB schema covers all UI requirements:
- `studyWorkbooks`, `studyQuestions`, `studyAttempts` for solving flow
- `studyWrongNotes` for wrong notes
- `studyUserProgress`, `studyRewardEvents`, `studyBadges` for gamification
- `studyWorkbookPublications`, `studyWorkbookLikes`, `studyWorkbookReviews` for community

**Risk**: **NONE** — No DB migrations needed.

### API Gaps (Minor)

1. **Community Post Feed** — No existing `listCommunityPosts` procedure
   - **Fix**: Add optional procedure if community feature is prioritized
   - **Fallback**: Keep mock data or return empty list

2. **Workbook History** — No audit trail API
   - **Fix**: Add optional `listMyWorkbookHistory` procedure querying workbook `updatedAt` 
   - **Fallback**: Keep mock data in UI

**Risk**: **LOW** — Gaps are for secondary features (community, history). Core learning flows are fully supported.

### Hook Implementation Complexity

- Hooks follow standard React patterns
- Type safety enforced via existing tRPC types
- Mock ↔ API toggling via single boolean flag
- **Risk**: **LOW** — Straightforward implementation

---

## Integration Validation Checklist

- [ ] All 6 Priority 1 hooks created and tested
- [ ] Pages updated to use hooks (not direct mock imports)
- [ ] Mock data still available in `mock-data.ts` (for fallback)
- [ ] `useMockData` toggle works (via env var or hook param)
- [ ] Type-check passes: `pnpm type-check`
- [ ] Build passes: `pnpm build`
- [ ] No regressions in existing pages

---

## Next Steps

1. **Review** this audit with stakeholder
2. **Prioritize** which hooks to implement (recommend Priority 1-3 = 80% value)
3. **Proceed** with Phase 7A—7C implementation
4. **Defer** community posts and history to Phase 8 (optional)

---

## Appendix: Existing tRPC Procedures (Relevant to UI)

### Workbooks
- `listWorkbooks` — My workbooks
- `getWorkbook` — Workbook metadata
- `publishWorkbook` — Make public
- `listPublicWorkbooks` — Browse public
- `getPublicWorkbookDetail` — Workbook detail

### Questions & Solving
- `listQuestions` — Questions in workbook
- `getQuestion` — Single question
- `getExamSet` — Exam/practice set
- `submitAttempt` — Record answer
- `submitExamSet` — Bulk submission

### Wrong Notes
- `listWrongNotes` — User's wrong notes
- `updateWrongNoteStatus` — Update status
- `getWrongNoteStats` — Analytics

### User Progress
- `getMyProgress` — Current level, XP, points
- `getGrowthSummary` — XP/point graphs
- `getStats` — Study time, accuracy, count
- `getLearningAnalytics` — Detailed analytics

### Gamification
- `getTodayQuests` — Today's quests
- `getWeeklyQuests` — Weekly quests
- `getMonthlyQuests` — Monthly quests
- `claimQuestReward` — Claim reward
- `getMyBadges` — Earned badges
- `getBadgeCollection` — All badges with progress

### Leaderboards
- `getWeeklyXpLeaderboard` — XP ranking
- `getWeeklySolvedLeaderboard` — Solved count ranking

### AI Generation
- `createAiGenerationJob` — Start job
- `getAiGenerationJob` — Job status
- `listMyAiGenerationJobs` — Job list
- `getGeneratedWorkbookPreview` — Preview

### Comments
- `listCommentsByTarget` — Comments on post/workbook
- `createComment` — Post comment
- `toggleCommentLike` — Like/unlike

