# Company Community Platform

A corporate community platform supporting real/anonymous discussions - inspired by Blind, Reddit, Karrot, and more.

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
git clone https://github.com/MOLOZISE/company-community
cd company-community
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
├── web/              # Next.js app
└── mobile/           # Expo app (Phase 2)

packages/
├── api/              # tRPC routers
├── db/               # Drizzle ORM schema
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
```

## Phase 1 Roadmap (MVP)

- Week 1: Infra setup (✓ in progress)
- Week 2: Auth (email, profiles)
- Week 3: Channels + Posts
- Week 4: Votes + Comments
- Week 5: Real-time + Notifications
- Week 6: Search + Polish

## Supabase Setup

### Get DATABASE_URL

1. Go to Supabase Dashboard
2. Select your project
3. Settings → Database → Connection pooling
4. Copy PostgreSQL connection string
5. Replace `[YOUR-PASSWORD]` with your database password

### RLS Policies

RLS policies for anonymous/real posts will be configured in Phase 1 Week 2.

## Contributing

Development uses Claude Code + gstack for AI-assisted development.

- Branch: Feature branches from `main`
- Commit: Semantic commit messages
- PR: Describe changes and reference issues

## License

MIT