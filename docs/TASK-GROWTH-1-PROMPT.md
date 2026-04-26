# Task GROWTH-1: Badges, Achievements, and Learning Analytics

**Priority**: MEDIUM 🟡  
**Duration**: 10-12 hours  
**Risk**: Medium (schema change, new feature, gamification system)  
**Related**: AUDIT-1 findings, KNOWN_ISSUES.md

## Goal

Complete the gamification and learning analytics experience by:
1. Implementing badge system (UI + backend)
2. Creating achievement engine for auto-awarding badges
3. Enhancing stats/analytics pages with meaningful visualizations
4. Displaying badges on user profile

## Current State

**What works**:
- XP/points system ✅
- Quests (daily/weekly/monthly) ✅
- Streaks ✅
- Leaderboards ✅
- Basic stats cards ✅

**What's missing**:
- Badge/achievement system ❌
- Badge schema (`study_badges`, `study_user_badges`) ❌
- Achievement engine (detecting badge conditions) ❌
- Learning analytics (heatmap, concept mastery, weak areas) ❌
- Badge display on profile ❌

## Part 1: Badge System (Database + Backend)

### 1.1 Create Badge Tables

**File**: `packages/db/src/schema/study.ts`

**Add two tables**:

```typescript
export const studyBadges = pgTable(
  'study_badges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 80 }).notNull().unique(), // 'first_problem', 'streak_3', etc.
    name: varchar('name', { length: 255 }).notNull(), // '첫 문제 풀이'
    description: text('description'), // '처음 문제를 풀어보세요.'
    icon: varchar('icon', { length: 120 }), // emoji or icon name: '🎯', 'medal', etc.
    rarity: varchar('rarity', { length: 40 }).default('common'), // common, uncommon, rare, epic, legendary
    condition: jsonb('condition').$type<Record<string, unknown>>(), // { type: 'first_solve' }
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    codeIdx: uniqueIndex('idx_study_badges_code').on(table.code),
  })
);

export const studyUserBadges = pgTable(
  'study_user_badges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id'), // From profiles table
    badgeId: uuid('badge_id').notNull().references(() => studyBadges.id, { onDelete: 'cascade' }),
    earnedAt: timestamp('earned_at', { withTimezone: true }).defaultNow(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  },
  (table) => ({
    userBadgeIdx: uniqueIndex('idx_study_user_badges_user_badge').on(table.userId, table.badgeId),
    userIdx: index('idx_study_user_badges_user_id').on(table.userId),
    earnedIdx: index('idx_study_user_badges_earned_at').on(table.earnedAt),
  })
);
```

**Note**: Don't add FK on userId (profile FK) to avoid migration issues. Treat as implicit.

### 1.2 Seed Initial Badges

**File**: Create `packages/db/seeds/badges.ts`

```typescript
import { db, studyBadges } from '@repo/db';

const badges = [
  {
    code: 'first_solve',
    name: '첫 문제 풀이',
    description: '처음 문제를 풀어보세요.',
    icon: '🎯',
    rarity: 'common',
    condition: { type: 'solve_count', value: 1 },
  },
  {
    code: 'solve_10',
    name: '10 문제 달성',
    description: '10개의 문제를 풀었습니다.',
    icon: '📈',
    rarity: 'common',
    condition: { type: 'solve_count', value: 10 },
  },
  {
    code: 'solve_100',
    name: '100 문제 달성',
    description: '100개의 문제를 풀었습니다.',
    icon: '⭐',
    rarity: 'uncommon',
    condition: { type: 'solve_count', value: 100 },
  },
  {
    code: 'streak_3',
    name: '3일 연속',
    description: '3일 연속 공부했습니다.',
    icon: '🔥',
    rarity: 'uncommon',
    condition: { type: 'streak', value: 3 },
  },
  {
    code: 'streak_7',
    name: '7일 연속',
    description: '7일 연속 공부했습니다.',
    icon: '💪',
    rarity: 'rare',
    condition: { type: 'streak', value: 7 },
  },
  {
    code: 'first_publish',
    name: '첫 공개',
    description: '문제집을 처음 공개했습니다.',
    icon: '🌟',
    rarity: 'uncommon',
    condition: { type: 'publish_count', value: 1 },
  },
  {
    code: 'first_fork',
    name: '첫 복사',
    description: '다른 사용자의 문제집을 처음 복사했습니다.',
    icon: '📋',
    rarity: 'common',
    condition: { type: 'fork_count', value: 1 },
  },
  {
    code: 'first_comment',
    name: '첫 댓글',
    description: '처음 댓글을 작성했습니다.',
    icon: '💬',
    rarity: 'common',
    condition: { type: 'comment_count', value: 1 },
  },
  {
    code: 'conquer_wrong',
    name: '오답 정복',
    description: '틀린 문제를 다시 풀어 맞혔습니다.',
    icon: '✅',
    rarity: 'uncommon',
    condition: { type: 'wrong_note_resolved', value: 5 },
  },
  {
    code: 'perfect_day',
    name: '완벽한 날',
    description: '하루에 푼 모든 문제를 맞혔습니다.',
    icon: '💯',
    rarity: 'rare',
    condition: { type: 'perfect_day' },
  },
];

export async function seedBadges() {
  for (const badge of badges) {
    await db
      .insert(studyBadges)
      .values(badge)
      .onConflictDoNothing();
  }
}
```

### 1.3 Add Achievement Engine (tRPC Procedure)

**File**: `packages/api/src/routers/study/router.ts`

**Add procedure**:
```typescript
checkAndAwardBadges: protectedProcedure
  .mutation(async ({ ctx }) => {
    const userId = ctx.userId;
    
    // Get user stats
    const attempts = await db
      .select({ count: count() })
      .from(studyAttempts)
      .where(eq(studyAttempts.userId, userId));
    
    const solveCount = attempts[0]?.count ?? 0;
    
    // Get user streaks
    const streak = await db.query.studyStreaks.findFirst({
      where: eq(studyStreaks.userId, userId),
    });
    
    // Check each badge condition
    const badgesToAward = [];
    
    // Badge: first_solve
    if (solveCount >= 1) {
      badgesToAward.push('first_solve');
    }
    
    // Badge: solve_10, solve_100, etc.
    if (solveCount >= 10) badgesToAward.push('solve_10');
    if (solveCount >= 100) badgesToAward.push('solve_100');
    
    // Badge: streak_3, streak_7
    if (streak?.currentStreak >= 3) badgesToAward.push('streak_3');
    if (streak?.currentStreak >= 7) badgesToAward.push('streak_7');
    
    // Get badge IDs
    const badges = await db
      .select()
      .from(studyBadges)
      .where(inArray(studyBadges.code, badgesToAward));
    
    // Award new badges (upsert to prevent duplicates)
    for (const badge of badges) {
      await db
        .insert(studyUserBadges)
        .values({
          userId,
          badgeId: badge.id,
        })
        .onConflictDoNothing();
    }
    
    return {
      newBadges: badgesToAward,
      totalBadges: badges.length,
    };
  }),
```

**Call this after key events**:
- User solves a problem (in problem complete flow)
- User's streak updates
- User publishes workbook
- User forks workbook
- User writes comment

### 1.4 Fetch User Badges

**Add query procedure**:
```typescript
getMyBadges: protectedProcedure
  .query(async ({ ctx }) => {
    const badges = await db
      .select({
        id: studyBadges.id,
        code: studyBadges.code,
        name: studyBadges.name,
        icon: studyBadges.icon,
        rarity: studyBadges.rarity,
        earnedAt: studyUserBadges.earnedAt,
      })
      .from(studyUserBadges)
      .innerJoin(
        studyBadges,
        eq(studyUserBadges.badgeId, studyBadges.id)
      )
      .where(eq(studyUserBadges.userId, ctx.userId))
      .orderBy(desc(studyUserBadges.earnedAt));
    
    return { badges, total: badges.length };
  }),
```

## Part 2: Badge UI

### 2.1 Badge Collection Component

**File**: Create `apps/web/src/components/study/BadgeCollection.tsx`

```typescript
'use client';

import { trpc } from '@/lib/trpc';

export function BadgeCollection() {
  const badges = trpc.study.getMyBadges.useQuery();
  
  if (badges.isLoading) return <div>로딩 중...</div>;
  if (!badges.data?.badges.length) {
    return <div className="text-sm text-slate-500">획득한 뱃지가 없습니다.</div>;
  }
  
  return (
    <div>
      <h3 className="font-semibold text-slate-900 mb-3">뱃지 ({badges.data.total})</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {badges.data.badges.map((badge) => (
          <div
            key={badge.id}
            className={`p-3 rounded-lg text-center border ${
              badge.rarity === 'legendary'
                ? 'border-yellow-400 bg-yellow-50'
                : badge.rarity === 'rare'
                  ? 'border-purple-400 bg-purple-50'
                  : badge.rarity === 'uncommon'
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-slate-300 bg-slate-50'
            }`}
            title={badge.name}
          >
            <div className="text-2xl mb-1">{badge.icon}</div>
            <p className="text-xs font-medium text-slate-900">{badge.name}</p>
            <p className="text-xs text-slate-600 mt-1">
              {new Date(badge.earnedAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2.2 Add to Profile Page

**File**: `apps/web/src/app/(study)/study/profile/page.tsx`

```typescript
import { BadgeCollection } from '@/components/study/BadgeCollection';

export default function ProfilePage() {
  return (
    <StudyShell>
      {/* Existing profile content */}
      
      {/* Add badges section */}
      <BadgeCollection />
    </StudyShell>
  );
}
```

## Part 3: Learning Analytics

### 3.1 Heatmap Data

**File**: Create `apps/web/src/lib/study/analyticsQueries.ts`

```typescript
export async function getStudyHeatmapData(userId: string) {
  // Query: count attempts by date for last 365 days
  const attempts = await db
    .select({
      date: sql`DATE(${studyAttempts.attemptedAt})`,
      count: count(),
    })
    .from(studyAttempts)
    .where(
      and(
        eq(studyAttempts.userId, userId),
        gte(studyAttempts.attemptedAt, sql`NOW() - INTERVAL '365 days'`)
      )
    )
    .groupBy(sql`DATE(${studyAttempts.attemptedAt})`)
    .orderBy(sql`DATE(${studyAttempts.attemptedAt})`);
  
  return attempts;
}

export async function getQuestionTypeAccuracy(userId: string) {
  // Query: accuracy by question type
  const stats = await db
    .select({
      type: studyQuestions.type,
      total: count(),
      correct: count(sql`CASE WHEN ${studyAttempts.isCorrect} THEN 1 END`),
    })
    .from(studyAttempts)
    .leftJoin(studyQuestions, eq(studyAttempts.questionId, studyQuestions.id))
    .where(eq(studyAttempts.userId, userId))
    .groupBy(studyQuestions.type);
  
  return stats;
}

export async function getConceptMastery(userId: string) {
  // Query: accuracy by concept
  const stats = await db
    .select({
      conceptId: studyConcepts.id,
      conceptTitle: studyConcepts.title,
      total: count(),
      correct: count(sql`CASE WHEN ${studyAttempts.isCorrect} THEN 1 END`),
    })
    .from(studyAttempts)
    .leftJoin(studyQuestions, eq(studyAttempts.questionId, studyQuestions.id))
    .leftJoin(studyConcepts, eq(studyQuestions.conceptId, studyConcepts.id))
    .where(eq(studyAttempts.userId, userId))
    .groupBy(studyConcepts.id, studyConcepts.title)
    .orderBy((t) => [desc(t.correct), desc(t.total)]);
  
  return stats;
}
```

### 3.2 Add tRPC Procedures

**File**: `packages/api/src/routers/study/router.ts`

```typescript
getAnalyticsData: protectedProcedure
  .query(async ({ ctx }) => {
    const heatmap = await getStudyHeatmapData(ctx.userId);
    const typeAccuracy = await getQuestionTypeAccuracy(ctx.userId);
    const conceptMastery = await getConceptMastery(ctx.userId);
    
    return {
      heatmap,
      typeAccuracy,
      conceptMastery,
    };
  }),
```

### 3.3 Heatmap Component

**File**: Create `apps/web/src/components/study/StudyHeatmap.tsx`

```typescript
'use client';

import { trpc } from '@/lib/trpc';

export function StudyHeatmap() {
  const analytics = trpc.study.getAnalyticsData.useQuery();
  
  if (analytics.isLoading) return <div>로딩 중...</div>;
  
  const heatmap = analytics.data?.heatmap ?? [];
  
  // Render heatmap grid (7 columns = days of week, rows = weeks)
  // Color by activity count
  
  return (
    <div>
      <h3 className="font-semibold mb-3">학습 히트맵 (지난 365일)</h3>
      <div className="grid grid-cols-7 gap-1">
        {heatmap.map((day) => (
          <div
            key={day.date}
            className={`w-8 h-8 rounded text-xs flex items-center justify-center ${
              day.count === 0
                ? 'bg-slate-100'
                : day.count < 5
                  ? 'bg-green-200'
                  : day.count < 10
                    ? 'bg-green-400'
                    : 'bg-green-600 text-white'
            }`}
            title={`${day.date}: ${day.count}문제`}
          >
            {day.count > 0 ? day.count : ''}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.4 Question Type Accuracy

**File**: Create `apps/web/src/components/study/QuestionTypeAccuracy.tsx`

```typescript
'use client';

import { trpc } from '@/lib/trpc';

export function QuestionTypeAccuracy() {
  const analytics = trpc.study.getAnalyticsData.useQuery();
  
  if (analytics.isLoading) return <div>로딩 중...</div>;
  
  const typeAccuracy = analytics.data?.typeAccuracy ?? [];
  
  return (
    <div>
      <h3 className="font-semibold mb-3">문제 유형별 정답률</h3>
      <div className="space-y-2">
        {typeAccuracy.map((stat) => {
          const accuracy = stat.total > 0 ? (stat.correct / stat.total) * 100 : 0;
          
          return (
            <div key={stat.type} className="flex items-center gap-3">
              <div className="w-32">{stat.type}</div>
              <div className="flex-1 h-6 bg-slate-200 rounded overflow-hidden">
                <div
                  className="h-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${accuracy}%` }}
                >
                  {accuracy.toFixed(0)}%
                </div>
              </div>
              <div className="w-16 text-right text-sm">
                {stat.correct}/{stat.total}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 3.5 Update Stats Page

**File**: `apps/web/src/app/(study)/study/stats/page.tsx`

```typescript
import { StudyShell } from '@/components/study/StudyShell';
import { StudyStatsCards } from '@/components/study/StudyStatsCards';
import { StudyHeatmap } from '@/components/study/StudyHeatmap';
import { QuestionTypeAccuracy } from '@/components/study/QuestionTypeAccuracy';

export default function StudyStatsPage() {
  return (
    <StudyShell title="학습 통계">
      <div className="space-y-6">
        <StudyStatsCards />
        <StudyHeatmap />
        <QuestionTypeAccuracy />
        {/* Future: ConceptMastery, WeakAreas, Recommendations */}
      </div>
    </StudyShell>
  );
}
```

## Part 4: Migration & Deployment

### 4.1 Create Database Migration

```bash
pnpm db:push
# Will create study_badges and study_user_badges tables
```

### 4.2 Seed Initial Badges

```bash
# Run manually after migration
node packages/db/seeds/badges.ts
```

Or add to context initialization.

## Implementation Checklist

- [ ] **Schema**: Create `study_badges` and `study_user_badges` tables
- [ ] **Seed**: Add initial 10 badges
- [ ] **Backend**: Implement `checkAndAwardBadges` mutation
- [ ] **Backend**: Add `getMyBadges` query
- [ ] **Frontend**: Create BadgeCollection component
- [ ] **Frontend**: Add to profile page
- [ ] **Analytics**: Implement heatmap query
- [ ] **Analytics**: Implement type accuracy query
- [ ] **Analytics**: Implement concept mastery query
- [ ] **Frontend**: Create heatmap component
- [ ] **Frontend**: Create question type accuracy component
- [ ] **Frontend**: Update stats page
- [ ] **Hook**: Call `checkAndAwardBadges` after problem solve
- [ ] **Test**: Solve problems, verify badges awarded
- [ ] **Test**: Check stats page displays correctly

## Files to Create

| File | Purpose |
|------|---------|
| `packages/db/src/schema/study.ts` (append) | Badge tables |
| `packages/db/seeds/badges.ts` | Initial badge data |
| `packages/api/src/routers/study/router.ts` (append) | Badge + analytics procedures |
| `apps/web/src/lib/study/analyticsQueries.ts` | Analytics helpers |
| `apps/web/src/components/study/BadgeCollection.tsx` | Badge display |
| `apps/web/src/components/study/StudyHeatmap.tsx` | Heatmap visualization |
| `apps/web/src/components/study/QuestionTypeAccuracy.tsx` | Type accuracy chart |
| `apps/web/src/app/(study)/study/stats/page.tsx` (update) | Enhanced stats page |
| `apps/web/src/app/(study)/study/profile/page.tsx` (update) | Add badge collection |

## Validation

```bash
pnpm lint       # Should pass
pnpm type-check # Should pass
pnpm build      # Should pass
```

## Testing

1. **Badge Award**:
   - Solve 1 problem → "첫 문제 풀이" badge awarded ✅
   - Solve 10 problems → "10 문제 달성" badge awarded ✅
   - Build 3-day streak → "3일 연속" badge awarded ✅

2. **Badge Display**:
   - `/study/profile` shows badge collection ✅
   - Badges sorted by earned date descending ✅
   - Colors indicate rarity ✅

3. **Analytics**:
   - Heatmap shows activity for last 365 days ✅
   - Type accuracy chart shows by question type ✅
   - `/study/stats` displays all visualizations ✅

## Non-Requirements

- Do NOT implement achievement notifications (defer to NOTIFY-1)
- Do NOT add leaderboard badges (nice-to-have)
- Do NOT implement badge trading/gifting
- Do NOT add 3D badge models (keep emoji/icon)

## Sign-Off Criteria

- [ ] Badges schema created and migrated
- [ ] 10 initial badges seeded
- [ ] Badge award logic working on problem solve
- [ ] User can view badges on profile
- [ ] Stats page shows heatmap + type accuracy
- [ ] lint/type-check/build pass
- [ ] No console errors

---

**Next Step**: After GROWTH-1, proceed to NOTIFY-1 (notifications system) or production deployment.

**Parallel**: ADMIN-1 and GROWTH-1 can be worked on by different team members.
