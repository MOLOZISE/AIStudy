# master.md — AIStudy Development Guide

You are working on the repository `MOLOZISE/AIStudy`.

## Product Definition

AIStudy is an **AI-based gamified community learning platform** where users:

1. **Create** problem banks from PDF/Excel templates or AI generation
2. **Learn** through interactive problem solving with gamification
3. **Share** workbooks with communities and discover shared resources
4. **Grow** through XP, levels, badges, and quest systems
5. **Analyze** learning patterns and receive personalized recommendations
6. **Collaborate** through discussions, peer feedback, and community curation

### Core Product Loops

1. **Problem Bank Creation Loop**
   - PDF upload → AI extraction → Question generation → Excel export → Import validation → Web editing

2. **Workbook Sharing Loop**
   - My problem bank → Metadata setup → Visibility settings → Community publication → Search/discovery → Fork by others

3. **Gamification Loop**
   - Study/create/share activity → XP/points event → Level/badge update → Quest progression → Leaderboard impact

4. **Learning Loop**
   - Problem solving → Immediate feedback → Wrong note auto-save → Retry session → Statistics update

5. **Community Loop**
   - Problem set discussion → Comments/ratings → Community moderation → Quality improvement

## Repo Context

The current repo already contains:

- Next.js 15 App Router frontend
- tRPC backend with routers
- Drizzle ORM schema + migrations
- Supabase auth/database
- Study domain primitives:
  - workbooks (problem sets)
  - questions/exams (problem variants)
  - wrong_notes (learning persistence)
  - users & profiles (identity)

## Product Boundaries (Phase 1 MVP)

### IN SCOPE
- Problem bank creation & management
- Web-based problem editor
- Multiple question types (MCQ, subjective, short answer)
- Problem solving with immediate feedback
- Wrong note system with retry sessions
- Basic gamification (XP, points, levels)
- Daily/weekly quests
- User statistics & growth profile
- Basic community (workbook discovery, search, discussions)
- Admin moderation basics

### OUT OF SCOPE (Phase 2+)
- Mobile app (planned for Phase 2)
- Realtime chat/comments
- Complex DM system
- Voice/video
- Advanced permission engine
- Enterprise workflow automation
- Deep org-chart integration
- Point redemption/store

## Technical Principles

### Architecture
- Keep TypeScript strong and explicit
- All tRPC procedures must have Zod input + output types
- Reuse existing components and patterns
- Minimize unnecessary refactoring
- Preserve existing auth flows

### Database
- Additive-only migrations (never destructive)
- Drizzle ORM for all queries
- Automatic type inference from schema
- Foreign key relations maintained

### Access Control
- userId-based authorization on all protected routes
- workbook ownership verification
- visibility: private | friends | public
- admin-only routes require role check
- No cross-user data exposure

### Idempotency
- XP/points events use idempotency key
- Quest rewards prevent double-claim
- Workbook fork uniqueness
- Rating/review deduplication
- Like/react idempotency

### AI Output Rules
- AI-generated questions stored as draft
- Original data never auto-overwritten
- User must preview/approve before apply
- input_snapshot + output_payload logged
- confidence/risk indicators shown

## Working Style

### Before Any Major Change
1. Audit current files (ls/find/grep)
2. Check existing patterns in same module
3. Propose minimal safe implementation
4. Get approval if significant change
5. Implement only the scoped task

### One Task Per Session
Good units:
- Add `/study/templates` route
- Implement Excel import validation
- Add gamification events table + basic UI
- Build wrong note retry session

Bad units:
- All of AI/PDF/sharing/quests in one PR
- Full-scale route restructuring
- Database schema wholesale rename
- Rewrite entire router

### Code Organization

**Per-Feature Structure**:
```
packages/api/src/routers/[feature]/
├── router.ts           # tRPC procedure definitions
├── queries.ts          # Read operations
├── mutations.ts        # Write operations
└── validation.ts       # Zod input schemas

apps/web/src/app/(study)/[route]/
├── page.tsx            # Route component
├── layout.tsx          # Nested layout
└── ...

apps/web/src/components/study/[feature]/
├── [Component].tsx     # React components
└── ...
```

### Naming Conventions
- Components: `PascalCase` (`UserCard.tsx`, `PracticePage.tsx`)
- Functions: `camelCase` (`fetchWorkbook`, `validateEmail`)
- Constants: `UPPER_SNAKE_CASE` (`API_URL`, `MAX_RETRIES`)
- Types: `PascalCase` prefixed `type` or `interface` name (`UserProfile`, `WorkbookData`)
- Zod schemas: `camelCase` + `Schema` suffix (`workbookSchema`, `questionSchema`)

### Type Safety (Critical)
Every tRPC procedure MUST have:
1. Zod input schema (or z.void())
2. Explicit output TypeScript type
3. JSDoc comment explaining purpose

Example:
```typescript
/**
 * Get user's created workbooks paginated
 * @returns Workbook list with metadata (no questions)
 */
getMyWorkbooks: protectedProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(50),
      offset: z.number().min(0),
    })
  )
  .query(async ({ input, ctx }) => {
    return await db.query.workbooks.findMany({
      where: eq(workbooks.userId, ctx.userId),
      limit: input.limit,
      offset: input.offset,
    });
  }),
```

### Validation

Each task completion MUST run:
```bash
pnpm lint        # ESLint
pnpm type-check  # TypeScript
pnpm build       # Production build
```

Optional:
```bash
pnpm test        # Unit tests
```

If validation fails:
1. Report error output
2. Note which checks failed
3. Whether error was fixed
4. Any remaining issues

## Required Report Format

Always report completed tasks with:

```md
task:
- [Task name]

summary:
- [What changed and why]

changed_files:
- [File paths, no descriptions]

verification:
- [What validation checks passed]
- [What needs manual verification]

risks:
- [Potential issues or breaking changes]

next_task_status:
- proceed | blocked | needs_review
```

## Quick Navigation

### File Locations
- **Auth context**: `packages/api/src/context.ts`
- **tRPC setup**: `packages/api/src/trpc.ts`
- **Router index**: `packages/api/src/routers/index.ts`
- **DB schema**: `packages/db/src/schema/index.ts`
- **Supabase client**: `apps/web/src/lib/supabase.ts`
- **tRPC client**: `apps/web/src/lib/trpc.ts`
- **Study routes**: `apps/web/src/app/(study)/study/`
- **Study components**: `apps/web/src/components/study/`

### Common Tasks
- **Add new tRPC procedure**: Create in `packages/api/src/routers/[feature]/`
- **Add new page**: Create in `apps/web/src/app/(study)/study/[route]/`
- **Add new component**: Create in `apps/web/src/components/study/[feature]/`
- **Update DB schema**: Edit `packages/db/src/schema/index.ts` + `pnpm db:push`

## Tools & Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server (Next.js + Drizzle Studio) |
| `pnpm build` | Build production |
| `pnpm type-check` | TypeScript verification |
| `pnpm lint` | ESLint check |
| `pnpm db:push` | Sync schema to Supabase |
| `pnpm db:studio` | Open Drizzle Studio UI |
| `pnpm test` | Run unit tests |

## AI Dev Notes

When using Claude Code or Codex:

1. **Always check existing patterns first**
   - Search same module for similar procedures
   - Reuse component patterns
   - Follow naming conventions

2. **Type everything explicitly**
   - Never use `any`
   - Zod schemas are required, not optional
   - Output types must be concrete

3. **Test the golden path**
   - Run feature in browser
   - Check happy path + edge cases
   - Validate against acceptance criteria

4. **Preserve existing functionality**
   - No breaking changes to existing APIs
   - No removing unused exports/functions
   - Additive only unless explicitly refactoring

5. **Commit and PR discipline**
   - Semantic commit messages
   - One PR per feature/task
   - Include test results in PR

## Phase 1 Roadmap

| Week | Focus | Status |
|------|-------|--------|
| 1 | Foundation & Identity | In Progress |
| 2 | Problem Bank & Templates | Next |
| 3 | Web Editor & Versioning | Backlog |
| 4 | Extended Question Types | Backlog |
| 5 | Wrong Notes & Analytics | Backlog |
| 6 | Gamification & Leaderboard | Backlog |

---

**Last Updated**: 2026-04-25  
**Phase**: MVP (Phase 1)  
**Primary Language**: Korean UI + English Code  
**AI Dev**: Claude Code + Codex via gstack
