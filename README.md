# AIStudy — AI-Powered Gamified Community Learning Platform

An AI-based gamified learning platform where users create problem banks from PDF/materials, collaborate through sharing, and grow through structured learning activities with community features.

**Core Concept**: PDF/Excel → Problem Bank → Learning Progression → Community Sharing → Growth Dashboard

## Key Features

### 1. **AI-Powered Problem Bank Creation**
- Upload PDF files and parse content
- AI-generated objective/subjective questions
- Excel template import/export
- Web-based problem bank editor

### 2. **Gamified Learning Experience**
- Daily/weekly/monthly quests
- XP, Points, Levels, Badges
- Streaks and leaderboards
- Progress tracking and statistics

### 3. **Collaborative Problem Sets**
- Create and share workbooks (public/friends/private)
- Fork and modify shared problem sets
- Community discovery and search
- Ranking and recommendations

### 4. **Advanced Learning Tools**
- Multiple question types (MCQ, subjective, short answer)
- Wrong note system with retry sessions
- Immediate feedback and explanations
- Performance analytics by topic

### 5. **Community & Discussion**
- Comments and discussions on problem sets
- Peer feedback and ratings
- Community guidelines and moderation
- User-generated content curation

### 6. **User Growth Dashboard**
- Personal statistics and progress
- Badges and achievement tracking
- Learning graph and heatmap
- Topic-based analysis

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 18 + Tailwind CSS
- **Backend**: tRPC + Drizzle ORM
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email)
- **Package Manager**: pnpm
- **Monorepo**: Turborepo

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Git
- Supabase account + project created

### Installation

1. **Clone repository**
```bash
git clone https://github.com/MOLOZISE/AIStudy
cd AIStudy
```

2. **Update environment variables**
```bash
# Edit .env.local with your Supabase credentials
# Get DATABASE_URL from Supabase Dashboard:
# Settings → Database → Connection string → PostgreSQL → Copy
```

3. **Install dependencies**
```bash
pnpm install
```

4. **Push database schema to Supabase**
```bash
pnpm db:push
```

5. **Start development**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
apps/
├── web/              # Next.js 15 web application
└── mobile/           # Expo app (Phase 2)

packages/
├── api/              # tRPC routers + procedures
├── db/               # Drizzle ORM schema + migrations
├── types/            # Shared TypeScript types
├── ui/               # Shared components (Phase 2)
└── typescript-config/
```

## Available Commands

```bash
pnpm dev             # Start dev server
pnpm build           # Build all packages
pnpm type-check      # TypeScript check
pnpm lint            # Lint code
pnpm db:push         # Push schema to DB
pnpm db:studio       # Open Drizzle Studio
pnpm test            # Run tests
```

## Navigation Routes

### Public Routes
- `/auth/login` — User login
- `/auth/signup` — User registration

### Study App Routes
- `/study` — Dashboard & home
- `/study/library` — My problem banks and workbooks
- `/study/practice` — Practice sessions
- `/study/workbooks/[id]` — Workbook details
- `/study/exams/[id]` — Quiz/exam mode
- `/study/wrong-notes` — Wrong note system
- `/study/wrong-notes/session` — Retry sessions
- `/study/search` — Search problem sets
- `/study/stats` — Learning statistics
- `/study/discover` — Discover shared workbooks (Phase 1)
- `/study/quests` — Daily quests (Phase 1)
- `/study/leaderboard` — Leaderboard (Phase 1)
- `/study/profile` — User profile & growth (Phase 1)

### Admin Routes (Phase 1+)
- `/admin/study/moderation` — Moderation dashboard
- `/admin/study/reports` — Report management

## Development Workflow

### 1. Getting Started

```bash
cd AIStudy
pnpm install
# Configure .env.local with Supabase credentials
pnpm dev
```

### 2. Code Organization

**Per-Feature Structure**:
```
packages/api/src/routers/[feature]/
├── router.ts           # tRPC procedures
├── queries.ts          # Read operations
├── mutations.ts        # Write operations
└── validation.ts       # Zod schemas

apps/web/src/
├── app/                # Next.js App Router
├── components/         # React components
├── lib/                # Utilities
└── styles/             # Global CSS
```

**Naming Conventions**:
- Components: `PascalCase` (UserCard.tsx)
- Functions: `camelCase` (fetchPosts)
- Constants: `UPPER_SNAKE_CASE` (API_URL)
- Types: `PascalCase` (UserProfile)
- Schemas: `camelCase + Schema` (userSchema)

### 3. Authentication & Authorization

**Flow**:
- Supabase Auth email verification
- JWT token in browser localStorage
- All API calls include Authorization header
- tRPC context extracts userId from token
- `protectedProcedure` enforces auth

**Key Files**:
- `packages/api/src/context.ts` — Auth context
- `packages/api/src/trpc.ts` — publicProcedure/protectedProcedure
- `apps/web/src/lib/supabase.ts` — Client setup

### 4. Database Schema

**Rules**:
- All schemas in `packages/db/src/schema/index.ts`
- Drizzle ORM auto-generates types
- Use migrations for schema changes

**Common Operations**:
```typescript
import { db } from '@repo/db';
import { eq, desc } from 'drizzle-orm';

const allPosts = await db.select().from(posts);
const one = await db.query.posts.findFirst({
  where: eq(posts.id, id),
});
```

### 5. tRPC Router Pattern

```typescript
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const studyRouter = router({
  getPractice: publicProcedure
    .input(z.object({ ... }))
    .query(async ({ input }) => { ... }),

  createWorkbook: protectedProcedure
    .input(z.object({ ... }))
    .mutation(async ({ input, ctx }) => {
      // ctx.userId guaranteed available
      return await db.insert(...);
    }),
});
```

### 6. Frontend: Using tRPC

```typescript
'use client';
import { trpc } from '@/lib/trpc';

export function PracticePage() {
  const { data, isLoading } = trpc.study.getPractice.useQuery({
    workbookId: 'abc123',
  });

  const createWorkbook = trpc.study.createWorkbook.useMutation();

  return (
    <div>
      {/* Component */}
    </div>
  );
}
```

## Deployment

### Vercel (Web)
```bash
# Automatic deployment on push to main
# Environment variables configured in Vercel dashboard
```

### Database Migrations
```bash
pnpm db:push  # Push schema to Supabase
# Vercel uses updated DATABASE_URL
```

## Phase 1 MVP Roadmap

### Week 1: Foundation
- [x] Infra setup & navigation shell
- [ ] Study routes integration

### Week 2: Problem Bank & Templates
- [ ] Template center
- [ ] Excel import validation
- [ ] AI question generation preview

### Week 3: Web Editor & Versioning
- [ ] Problem bank CRUD
- [ ] Version history
- [ ] Auto-save

### Week 4: Extended Question Types
- [ ] Subjective questions
- [ ] Answer validation
- [ ] Model answer comparison

### Week 5: Wrong Notes & Statistics
- [ ] Wrong note system
- [ ] Retry sessions
- [ ] Learning analytics

### Week 6: Gamification Core
- [ ] XP/Points/Levels
- [ ] Badges & streaks
- [ ] Basic leaderboard

## Contributing

Development uses Claude Code + Codex for AI-assisted development.

- Branch: Feature branches from `main`
- Commit: Semantic commit messages
- PR: Describe changes and reference issues
- Testing: Run `pnpm test` before submitting PR

## License

MIT
