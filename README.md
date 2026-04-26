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

### Admin Routes (Auth Required + Admin Role)
- `/study/admin` — Admin dashboard with overview
- `/study/admin/reports` — Report management (open/reviewing/resolved/rejected)
- `/study/admin/quests` — Quest management (daily/weekly/monthly)
- `/study/admin/questions` — QC management (question review status)
- `/study/admin/ai-jobs` — AI generation job monitoring
- `/study/admin/workbooks` — Workbook quality management (placeholder)

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

## Implemented Features (P0-P14)

### Core Learning (P0-P5)
- [x] Infrastructure & auth setup
- [x] Study workspace navigation
- [x] Problem bank CRUD & versioning
- [x] Multiple question types (MCQ, true/false, short answer, essay)
- [x] Wrong note system with retry sessions

### Gamification (P6-P7)
- [x] XP/Points/Levels system
- [x] Daily/Weekly/Monthly quests
- [x] Badges, streaks, and achievements
- [x] Leaderboards (XP and solved count)
- [x] Growth dashboard with statistics

### AI-Powered Features (P8-P13)
- [x] PDF/Excel upload and parsing
- [x] AI-generated question preview
- [x] Excel export with normalization
- [x] Direct apply to workbook
- [x] AI quality checks (error/warning/info)
- [x] Question review workflow (draft/needs_fix/approved/rejected)

### Community Features (P9-P12)
- [x] Public workbook repository
- [x] Workbook discovery and search
- [x] Workbook forking and ranking
- [x] Recommendation system
- [x] Comments and nested replies
- [x] Comment likes and reporting

### Admin Operations (P14)
- [x] Admin dashboard with overview
- [x] Report management and resolution
- [x] Quest creation and activation
- [x] Question QC status tracking
- [x] AI job monitoring

## Contributing

Development uses Claude Code + Codex for AI-assisted development.

- Branch: Feature branches from `main`
- Commit: Semantic commit messages
- PR: Describe changes and reference issues
- Testing: Run `pnpm test` before submitting PR

## Documentation

For detailed guides and checklists, see:

### For Everyone
- **[ENVIRONMENT.md](./docs/ENVIRONMENT.md)** — Setup, environment variables, troubleshooting
- **[KNOWN_LIMITATIONS.md](./docs/KNOWN_LIMITATIONS.md)** — What's not included, roadmap for Phase 2+

### For Product Teams
- **[DEMO_SCRIPT.md](./docs/DEMO_SCRIPT.md)** — 20-minute demo walkthrough for stakeholders
- **[SMOKE_TEST_CHECKLIST.md](./docs/SMOKE_TEST_CHECKLIST.md)** — Pre-launch testing guide (10 flows, 2 hours)

### For Admins & Moderators
- **[ADMIN_GUIDE.md](./docs/ADMIN_GUIDE.md)** — Admin panel operations, moderation, emergency procedures

### For Developers
- **[ROUTE_AUDIT.md](./docs/ROUTE_AUDIT.md)** — All 37 routes verified, build health check
- **[CLAUDE.md](./CLAUDE.md)** — Development standards, architecture patterns, code conventions

---

## Current Phase Status (MVP - Phase 1)

✅ **Complete & Production-Ready**:
- User authentication (Supabase Auth)
- Workbook creation and management
- Practice mode with immediate feedback
- Question and concept tracking
- 12 badge types with XP system
- Learning analytics dashboard
- In-app notifications system (10 types)
- Admin panel with moderation tools
- All 37 routes verified and building

⏳ **Not Yet Implemented** (Phase 2+):
- Mobile app (Expo React Native)
- AI PDF/Excel import (P13)
- Real-time updates (WebSocket subscriptions)
- Email notifications and push
- Advanced user management
- Soft deletes and restore
- Feature flags and gradual rollout
- See [KNOWN_LIMITATIONS.md](./docs/KNOWN_LIMITATIONS.md) for full roadmap

---

## Quick Links

### Getting Started
1. Clone repo: `git clone https://github.com/MOLOZISE/AIStudy`
2. Follow [ENVIRONMENT.md](./docs/ENVIRONMENT.md) for setup
3. Run `pnpm dev` and open http://localhost:3000

### Before Deploying
1. Run: `pnpm lint && pnpm type-check && pnpm build`
2. Review: [SMOKE_TEST_CHECKLIST.md](./docs/SMOKE_TEST_CHECKLIST.md)
3. Run [ROUTE_AUDIT.md](./docs/ROUTE_AUDIT.md) verification

### Demoing to Stakeholders
- Use [DEMO_SCRIPT.md](./docs/DEMO_SCRIPT.md) (20 min, covers all features)

### Admin Operations
- See [ADMIN_GUIDE.md](./docs/ADMIN_GUIDE.md) for moderation, features, reporting

---

## License

MIT
