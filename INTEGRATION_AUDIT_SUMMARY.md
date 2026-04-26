# Phase 7 API Integration — Summary & Status

## Overview

This integration audit examines the gap between Phase 1-6 UI (built with mock data) and existing tRPC APIs (70+ procedures across study domain).

**Status**: ✅ Audit Complete | ⚠️ Implementation Started (hooks created, API response mapping deferred)

---

## Key Findings

### What's Ready (Direct Integration)

✅ **Core Data Flows**: 70+ tRPC procedures cover all UI requirements:

- **Workbooks**: `listWorkbooks`, `listPublicWorkbooks`, `getPublicWorkbookDetail`
- **Learning**: `getExamSet`, `listQuestions`, `submitAttempt`
- **Progress**: `getMyProgress`, `getStats`, `getLearningAnalytics`
- **Gamification**: `getTodayQuests`, `getWeeklyQuests`, `getMyBadges`
- **Leaderboards**: `getWeeklyXpLeaderboard`, `getWeeklySolvedLeaderboard`
- **Wrong Notes**: `listWrongNotes`, `updateWrongNoteStatus`
- **Comments**: `listCommentsByTarget`, `createComment`
- **AI Jobs**: `getAiGenerationJob`, `createAiGenerationJob`

### Integration Challenges

⚠️ **API Response Mismatch**: UI types and API responses differ in structure:

| Feature | UI Type | API Response | Gap |
|---------|---------|--------------|-----|
| **User Progress** | `weeklyAccuracyRate`, `completedQuestCount` | `level`, `totalXp`, `currentStreak` | Missing fields |
| **Quests** | `{ id, title, reward: number }` | `{ id, title, reward: {xp, points}, targetValue }` | Nested reward, different metrics |
| **Leaderboard** | `LeaderboardEntry[]` | `{ items: [...], myRank, myXp }` | Response nesting |
| **Public Workbook** | `PublicWorkbook` with `subject`, `tags` | `publication` object with different fields | Schema mismatch |
| **Stats** | `totalStudyTime`, `subjectAchievements[]` | `{ totalAttempts, accuracy, openWrongNotes }` | Aggregation needed |

### No Schema Changes Needed

✅ Database has complete coverage:
- `studyWorkbooks`, `studyQuestions`, `studyAttempts` — solving flow
- `studyWrongNotes` — wrong notes management
- `studyUserProgress`, `studyRewardEvents`, `studyBadges` — gamification
- `studyWorkbookPublications`, `studyComments` — community features

**Risk**: **ZERO** — existing schema is sufficient.

---

## Implementation Status

### Custom Hooks Created

✅ **Foundation** (all in `apps/web/src/lib/study/hooks/`):

1. `use-study-dashboard.ts` — Dashboard summary
2. `use-workbook-list.ts` — My workbooks
3. `use-public-workbook-list.ts` — Discover workbooks
4. `use-public-workbook-detail.ts` — Workbook detail
5. `use-user-progress.ts` — User level/XP/points
6. `use-leaderboard.ts` — Weekly XP/solved rankings
7. `use-exam-set.ts` — Questions for solving
8. `use-submit-attempt.ts` — Submit answer
9. `use-wrong-notes.ts` — List wrong notes
10. `use-quests.ts` — Daily/weekly/monthly quests
11. `use-learning-stats.ts` — Analytics & stats

**Pattern**: Each hook accepts `useMockData: boolean` parameter for easy toggle between mock and real API.

### Current Status: Deferred

Due to the extent of API response → UI type mapping needed, full integration has been deferred with TODOs in each hook explaining:
1. What API response fields are available
2. What UI type expects
3. Where the gaps are (missing fields, different structure, renamed properties)

**Rationale**: Rather than create fragile mappings that may break with API changes, better to:
- Clarify API contracts first (what should getMyProgress return for a UI dashboard?)
- Standardize response shapes across routers
- Then implement robust mapping once contracts are settled

---

## Recommended Next Steps

### Phase 7A: API Contract Alignment (Day 1)

For each router (study, quests, badges, etc.):

1. **Review** what UI actually needs (reference types in `apps/web/src/lib/study/study-types.ts`)
2. **Check** what API returns (grep response structure in `packages/api/src/routers/study/router.ts`)
3. **Decide**: Do we add computed fields to API response, or update UI type to match API?
4. **Document** the agreed contract

Example:
```ts
// Current API returns:
getMyProgress: { level, totalXp, totalPoints, currentStreak, ... }

// UI needs:
UserProgressSummary: { level, totalXp, points, streakDays, weeklyAccuracyRate, completedQuestCount }

// Options:
// A) Extend getMyProgress to include weeklyAccuracyRate (requires query logic)
// B) Change UI to use currentStreak instead of streakDays
// C) Combine getMyProgress + getStats in the hook
```

### Phase 7B: Implement Hooks (Days 2-3)

Once contracts are clear, use the hook framework already in place:

```ts
// Example: useUserProgress will look like this once API is settled
const useUserProgress = () => {
  const progressQuery = trpc.study.getMyProgress.useQuery(...);
  // Simple 1:1 mapping, no complex adapter logic
  return transformToUserProgressSummary(progressQuery.data);
};
```

### Phase 7C: Test with Real API (Day 4)

Toggle `useMockData` from true → false in hooks and test each flow in browser.

---

## Risk Assessment

**Risk**: **LOW** — Mock data integration is complete, hooks are in place, just need API response clarification.

**Mitigation**: API contract docs prevent future rework. Clear gaps now vs. silent failures later.

---

## Files Created

```
apps/web/src/lib/study/
├── hooks/
│   ├── index.ts (exports, currently commented)
│   ├── types.ts (error type definitions)
│   ├── use-study-dashboard.ts
│   ├── use-workbook-list.ts
│   ├── use-public-workbook-list.ts
│   ├── use-public-workbook-detail.ts
│   ├── use-user-progress.ts
│   ├── use-leaderboard.ts
│   ├── use-exam-set.ts
│   ├── use-submit-attempt.ts
│   ├── use-wrong-notes.ts
│   ├── use-quests.ts
│   └── use-learning-stats.ts
└── INTEGRATION_AUDIT.md (detailed reference)
```

---

## Conclusion

AIStudy has strong API coverage. Phases 1-6 UI is complete with mock data. Custom hooks are scaffolded. The only blocker is API response format alignment — straightforward fix once contracts are confirmed.

**Next**: Clarify API response shapes, then activate hooks with real API calls.

