# Environment Setup & Configuration Guide

**Last Updated**: 2026-04-26  
**Version**: MVP Phase 1

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Variables](#environment-variables)
3. [Local Development](#local-development)
4. [Database Setup](#database-setup)
5. [External Services](#external-services)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Clone repo (if needed)
git clone <repo-url>
cd company-community

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Setup database
pnpm db:push

# 5. Start dev server
pnpm dev

# 6. Open browser
# Frontend: http://localhost:3000
# Drizzle Studio: http://localhost:3001 (optional)
```

---

## Environment Variables

### Required Variables (.env.local)

#### Supabase Auth & Database

```env
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Supabase Anon Key (public, safe in frontend)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Connection String (private, for backend only)
DATABASE_URL=postgresql://postgres:password@xxxxx.supabase.co:5432/postgres
```

#### Node Environment

```env
# Set to development, staging, or production
NODE_ENV=development
```

### Getting Your Credentials

#### From Supabase Dashboard:

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** → **API**
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Database Connection String:

1. Click **Settings** → **Database**
2. Copy the **Connection string** (PostgreSQL)
3. Replace `[YOUR-PASSWORD]` with your database password
4. Set as `DATABASE_URL`

---

## Local Development

### Prerequisites

- **Node.js**: 18.x or 20.x (check with `node -v`)
- **pnpm**: 8.x or 9.x (install: `npm install -g pnpm`)
- **PostgreSQL Client** (optional, for CLI tools): `brew install postgresql` (Mac)

### Setup Steps

#### 1. Install Dependencies

```bash
pnpm install
```

If you hit permission errors on Windows, try:
```bash
pnpm install --no-frozen-lockfile
```

#### 2. Create .env.local

```bash
# Copy example file (if available)
cp .env.local.example .env.local

# Or create manually with required vars (see above)
```

#### 3. Verify Environment

```bash
# Check Node version
node -v
# Expected: v18.x, v20.x, or v22.x

# Check pnpm version
pnpm -v
# Expected: 8.x or 9.x

# Check git
git --version
```

#### 4. Start Dev Server

```bash
# Terminal 1: Start all apps in watch mode
pnpm dev

# You should see:
# ✓ web:build ready - started server on 0.0.0.0:3000
# ✓ API listening on http://localhost:3001 (tRPC endpoint)
```

#### 5. Open in Browser

- **Frontend**: http://localhost:3000
- **Drizzle Studio** (optional DB viewer): http://localhost:3001

### Development Workflow

#### Making Changes

```bash
# Editor integration (VS Code): Install TypeScript support
# Changes auto-reload via hot module reload (HMR)

# Type checking (manual)
pnpm type-check

# Linting (manual)
pnpm lint

# Both (before commit)
pnpm lint && pnpm type-check
```

#### Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage
```

#### Building for Production

```bash
# Full build
pnpm build

# Build specific package
pnpm build --filter=@repo/web
```

---

## Database Setup

### Schema Migrations

```bash
# After pulling new changes with schema modifications:
pnpm db:push

# This:
# 1. Reads packages/db/src/schema/
# 2. Compares against Supabase
# 3. Applies diffs (ALTER TABLE, CREATE TABLE, etc.)
# 4. Updates database in real-time
```

### Viewing Database

#### Option 1: Drizzle Studio (Web UI)

```bash
# Starts at http://localhost:3001 during pnpm dev
# Visual browser of your schema and data
```

#### Option 2: Supabase Dashboard

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select project
3. Click **SQL Editor** or **Table Editor**
4. Browse tables and run queries

#### Option 3: CLI (psql)

```bash
# Connect directly to database
psql $DATABASE_URL

# List tables
\dt

# Describe table
\d study_users

# Run query
SELECT * FROM study_users LIMIT 5;

# Exit
\q
```

### Seed Data (Development)

If you need sample data for testing:

```bash
# Seed script (if available)
pnpm seed

# Or manually (in Supabase or via psql)
INSERT INTO study_users (id, email, name, is_admin) VALUES 
  ('user-123', 'test@example.com', 'Test User', false);
```

---

## External Services

### Supabase

**What it is**: PostgreSQL database + Auth service (Vercel alternative to AWS/GCP)

**What it provides**:
- PostgreSQL database (hosted)
- JWT authentication
- Real-time subscriptions (WebSocket)
- File storage (Phase 2)

**Setup**:
1. Create account at [supabase.com](https://supabase.com)
2. Create new project (region: us-east-1 recommended for performance)
3. Wait 2-5 minutes for setup
4. Copy credentials into .env.local (see above)

**Monitoring**:
- Dashboard: [supabase.com/dashboard](https://supabase.com/dashboard)
- Logs: **Settings** → **Logs**
- Metrics: **Statistics** tab

### Vercel (Deployment)

**What it is**: Serverless hosting for Next.js apps

**Setup** (when ready to deploy):
1. Create account at [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Set environment variables in Vercel dashboard
4. Deploy button appears on each PR (Phase 2)

**Monitoring**:
- Deployment history: [vercel.com/dashboard](https://vercel.com/dashboard)
- Function logs: Each deploy shows analytics
- Alerts: Can set error thresholds

### GitHub

**What it is**: Version control and collaboration

**Setup**:
1. Create repo or clone existing
2. All changes tracked in git
3. PRs require approval before merge (Phase 2)

**Best Practices**:
- Commit messages: `feat: add X`, `fix: resolve Y`, `refactor: improve Z`
- One feature per branch
- Push regularly (sync upstream)

---

## Troubleshooting

### Issue: "DATABASE_URL not set"

**Cause**: .env.local missing or incomplete

**Fix**:
```bash
# Check .env.local exists
ls -la .env.local

# Verify it contains DATABASE_URL
grep DATABASE_URL .env.local

# If missing, add it (get from Supabase dashboard)
echo "DATABASE_URL=postgresql://..." >> .env.local
```

---

### Issue: "Cannot find module '@repo/db'"

**Cause**: pnpm install didn't complete

**Fix**:
```bash
# Clean and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
pnpm build
```

---

### Issue: "Connection refused" (database)

**Cause**: Supabase down, wrong credentials, or network issue

**Fix**:
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# If fails, check:
# 1. Credentials in .env.local are correct (copy/paste from Supabase)
# 2. IP whitelist: Supabase dashboard → Settings → Network
#    Add your IP (or allow all during dev: 0.0.0.0/0)
# 3. VPN/firewall: Temporarily disable to test
# 4. Supabase status: Check status.supabase.com
```

---

### Issue: "Type checking fails" (tsc errors)

**Cause**: Stale dependencies or broken schema

**Fix**:
```bash
# Type check only (see detailed errors)
pnpm type-check

# Fix schema (push latest)
pnpm db:push

# Regenerate types
pnpm db:push --force

# Clean and rebuild
pnpm clean
pnpm build
```

---

### Issue: "Linting fails" (ESLint)

**Cause**: Code style violations

**Fix**:
```bash
# See violations
pnpm lint

# Auto-fix (most issues)
pnpm lint --fix

# Format code (Prettier)
pnpm format
```

---

### Issue: "Auth token expired" (user logged out)

**Cause**: Session expired (normal after ~24h)

**Fix** (user-facing):
1. Clear browser storage: `localStorage.clear()`
2. Reload page
3. Login again

**Fix** (developer):
- Check Supabase token expiry settings
- Verify refresh token logic in `apps/web/src/lib/supabase.ts`

---

### Issue: "Hot reload not working"

**Cause**: File watcher limits on Linux/Windows

**Fix**:
```bash
# Increase file watcher limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Or manually restart dev server
# Kill: Ctrl+C
# Restart: pnpm dev
```

---

### Issue: "Memory exceeded" (large builds)

**Cause**: Node heap too small

**Fix**:
```bash
# Increase heap size before build
NODE_OPTIONS=--max_old_space_size=4096 pnpm build
```

---

### Issue: "Port 3000 already in use"

**Cause**: Another app using port

**Fix**:
```bash
# Kill process using port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

---

## Development Checklists

### Before Starting Work

- [ ] `git status` is clean (no uncommitted changes)
- [ ] Latest from main: `git pull origin main`
- [ ] `pnpm install` (if dependencies changed)
- [ ] `.env.local` has valid credentials
- [ ] `pnpm dev` starts without errors
- [ ] Browser opens to http://localhost:3000

### Before Committing

- [ ] Tests pass: `pnpm test` (or skip if none)
- [ ] Linting: `pnpm lint --fix`
- [ ] Types: `pnpm type-check`
- [ ] No console errors (browser dev tools)
- [ ] Functionality tested manually

### Before Creating PR

- [ ] Branch named: `feature/description` or `fix/description`
- [ ] Commit message clear: `feat: add X`, `fix: resolve Y`
- [ ] Changes pushed: `git push origin [branch]`
- [ ] PR description explains what changed and why
- [ ] Screenshot (if UI change)

### Before Deploying to Production

- [ ] PR approved by reviewer
- [ ] All checks pass (lint, type, build, tests)
- [ ] Smoke tests passed (see SMOKE_TEST_CHECKLIST.md)
- [ ] Database migrations applied
- [ ] Vercel environment variables set correctly
- [ ] Rollback plan in place (revert to previous commit)

---

## Commands Reference

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build for production |
| `pnpm test` | Run tests |
| `pnpm test --watch` | Run tests in watch mode |
| `pnpm lint` | Check code style |
| `pnpm lint --fix` | Auto-fix style issues |
| `pnpm type-check` | Check TypeScript errors |
| `pnpm format` | Format code (Prettier) |
| `pnpm db:push` | Sync schema to database |
| `pnpm db:studio` | Open Drizzle Studio (DB viewer) |
| `pnpm clean` | Remove build artifacts |

---

## Support

**Questions?**
- Check [CLAUDE.md](./CLAUDE.md) for project overview
- Check [SMOKE_TEST_CHECKLIST.md](./SMOKE_TEST_CHECKLIST.md) for testing
- Ask in #dev-support Slack channel
- Email: dev@AIStudy.com

---

**Last Updated**: 2026-04-26  
**Next Review**: 2026-05-26
