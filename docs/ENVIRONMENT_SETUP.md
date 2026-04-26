# AIStudy Environment Setup Guide

**Last Updated**: 2026-04-25  
**Audience**: Developers, DevOps, deployment engineers

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [External Services](#external-services)
6. [Verification & Troubleshooting](#verification--troubleshooting)
7. [Production Deployment](#production-deployment)

---

## Prerequisites

### System Requirements

- **Node.js**: v20.0.0 or higher
- **pnpm**: v9.0.0 or higher (package manager)
- **Git**: Latest version
- **OS**: macOS, Linux, or Windows (with WSL2 recommended)

### Verify Installation

```bash
node --version    # Should be ≥ v20.0.0
pnpm --version    # Should be ≥ v9.0.0
git --version     # Any recent version
```

### Required External Accounts

- **Supabase**: Free tier or paid project (for database + auth)
- **OpenAI**: API key with GPT-3.5 or later model access
- **GitHub**: Repository access (optional, for CI/CD)
- **Vercel**: Account for deployment (optional, for hosting)

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/MOLOZISE/AIStudy.git
cd AIStudy
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs:
- `apps/web` — Next.js 15 web application
- `packages/api` — tRPC routers
- `packages/db` — Drizzle ORM schema
- `packages/types` — Shared TypeScript types
- All workspace dependencies

**Expected Output**: No errors, `node_modules` created

### 3. Create Environment File

Create `.env.local` in project root:

```bash
cp .env.example .env.local  # If .env.example exists
# OR manually create:
touch .env.local
```

**File Location**: `AIStudy/.env.local`

---

## Environment Variables

### Required Variables

**Database Connection** (from Supabase):

```bash
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

**Supabase Keys** (from Supabase Project Settings):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**OpenAI API Key** (from OpenAI Account):

```bash
OPENAI_API_KEY=sk-...
```

### Optional Variables

```bash
# Override API endpoints (development only)
NEXT_PUBLIC_SUPABASE_URL_OVERRIDE=http://localhost:54321  # For local Supabase
OPENAI_BASE_URL=http://localhost:8000  # For local LLM server

# Feature flags (future)
FEATURE_MOBILE_APP=false
FEATURE_ADVANCED_ANALYTICS=false
```

### Complete `.env.local` Example

```bash
# Database
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/aistudydb?schema=public

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://myproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjU4NDUxNjAwLCJleHAiOjE5MjQxMjc2MDB9.xw1hCE8l5zx...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cHJvamVjdCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2NTg0NTE2MDAsImV4cCI6MTkyNDEyNzYwMH0.cGHqaAw1H7o...

# OpenAI
OPENAI_API_KEY=sk-proj-dXN0b21AZXhhbXBsZS5jb20...

# Optional: Node environment
NODE_ENV=development
```

### Security Notes

- **NEVER** commit `.env.local` to git (already in `.gitignore`)
- **NEVER** share `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` publicly
- Use separate keys for development and production
- Rotate keys monthly in production

---

## Database Setup

### Option A: Using Supabase Hosted Database (Recommended)

#### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create account
3. Click **New Project**
4. Fill details:
   - **Name**: `aistudydb` (or your choice)
   - **Database Password**: Strong password (20+ chars)
   - **Region**: Closest to users (e.g., `us-east-1`)
5. Click **Create New Project** (wait 2-3 min)

#### 2. Get Connection String

1. In Supabase Console: **Settings** → **Database** → **Connection String**
2. Select **PostgreSQL** tab
3. Copy connection string
4. Paste into `.env.local` as `DATABASE_URL`

#### 3. Create Supabase Auth Keys

1. **Settings** → **API** → **Project API keys**
2. Copy:
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`
3. Paste into `.env.local`

#### 4. Push Database Schema

```bash
pnpm db:push
```

**Output**: Should show schema tables created:
```
✓ profiles
✓ study_workbooks
✓ study_questions
✓ study_comments
✓ study_ai_generation_jobs
... (and ~20 more)
```

### Option B: Local PostgreSQL (Development Only)

#### 1. Install PostgreSQL

```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Windows
# Download installer from postgresql.org
```

#### 2. Start PostgreSQL

```bash
# macOS / Linux
brew services start postgresql
# or
sudo systemctl start postgresql

# Windows
# Use pgAdmin or Services manager
```

#### 3. Create Database

```bash
createdb aistudydb
```

#### 4. Set Connection String

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/aistudydb
```

#### 5. Push Schema

```bash
pnpm db:push
```

### Verify Database

```bash
pnpm db:studio
```

Opens http://localhost:3001 — should show all tables

---

## External Services

### OpenAI API Setup

#### 1. Create OpenAI Account

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to **API keys** (left sidebar)
4. Click **Create new secret key**
5. Copy key
6. Paste into `.env.local` as `OPENAI_API_KEY`

#### 2. Enable Billing

1. **Billing** → **Overview**
2. Add payment method
3. Set usage limits (optional, recommended)

#### 3. Verify Access

```bash
# Test OpenAI API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-..." \
  | jq '.data | length'
# Should output: number of available models
```

### Supabase Auth Configuration

#### 1. Enable Email Provider

1. Supabase Console: **Authentication** → **Providers**
2. Find **Email**
3. Ensure **Enabled** toggle is ON

#### 2. Configure Email Settings (Optional)

1. **Settings** → **Email**
2. Default: Uses Supabase's email service
3. Optional: Configure custom SMTP

#### 3. Create First User

1. Console: **Authentication** → **Users**
2. Click **Invite**
3. Enter email, password
4. Click **Send Invite**
5. User must verify email to sign up

---

## Verification & Troubleshooting

### Pre-Dev Checklist

- [ ] Node.js v20+ installed
- [ ] pnpm v9+ installed
- [ ] Repository cloned
- [ ] `.env.local` created with all variables
- [ ] `pnpm install` completed
- [ ] `pnpm db:push` successful
- [ ] `pnpm db:studio` accessible

### Start Development Server

```bash
pnpm dev
```

**Expected Output**:
```
  ▲ Next.js 15.5.15

  ▲ Local:        http://localhost:3000
  ▲ Environments: .env.local

 ✓ Ready in 5.2s
```

### Test Application

1. Open http://localhost:3000
2. Should see landing page or login redirect
3. Click **Sign Up**
4. Enter email, password
5. Check email inbox for verification link
6. Click link → Should redirect to `/study` dashboard

**If signup fails**:

Check console for error:
- `SUPABASE_URL not found` → Missing `NEXT_PUBLIC_SUPABASE_URL`
- `Failed to send email` → Check Supabase email settings
- `Database connection failed` → Check `DATABASE_URL` and Supabase project is running

### Test AI Generation

1. Dashboard → **Generate with AI**
2. Upload sample PDF (must be valid PDF)
3. Wait for extraction (should show preview)
4. Click **Generate Questions**
5. Wait for AI to generate (30-60 seconds)

**If generation fails**:

Check:
- `OPENAI_API_KEY` is valid (test: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`)
- OpenAI account has billing enabled
- File is valid PDF (<50MB)

### Common Errors

#### Error: `DATABASE_URL not set`

**Solution**: 
```bash
# Verify .env.local exists and has DATABASE_URL
cat .env.local | grep DATABASE_URL

# Verify format is correct (PostgreSQL connection string)
```

#### Error: `NEXT_PUBLIC_SUPABASE_URL is not defined`

**Solution**: 
```bash
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

#### Error: `Email verification not working`

**Solution**:
1. Check spam folder
2. Supabase Console → **Authentication** → **Email**
3. Verify sender address is configured
4. Check email rate limits

#### Error: `OpenAI API rate limit exceeded`

**Solution**:
1. Wait 1 minute (rate limit resets)
2. Check OpenAI billing page (may have run out of credit)
3. Add payment method or increase budget

---

## Production Deployment

### Deploy to Vercel

#### 1. Push to GitHub

```bash
git add .
git commit -m "feat: ready for deployment"
git push origin main
```

#### 2. Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New** → **Project**
4. Select `AIStudy` repository
5. Framework: **Next.js**
6. Build command: `pnpm build`
7. Output directory: `.next`

#### 3. Add Environment Variables

In Vercel project settings:

- **Settings** → **Environment Variables**
- Add all variables from `.env.local` (except `DATABASE_URL` can use a separate prod database)

```bash
DATABASE_URL=postgresql://...prod-connection-string...
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...prod-key...
SUPABASE_SERVICE_ROLE_KEY=...prod-service-role-key...
OPENAI_API_KEY=...prod-key...
```

#### 4. Deploy

1. Click **Deploy**
2. Wait for build to complete (2-5 min)
3. Get deployment URL: `https://[project].vercel.app`

#### 5. Configure Supabase Auth Redirect URLs

1. Supabase Console: **Authentication** → **URL Configuration**
2. Add **Redirect URLs**:
   - Production: `https://[project].vercel.app/auth/callback`
   - Staging: `https://staging-[project].vercel.app/auth/callback`

### Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Supabase production database configured
- [ ] OpenAI production API key used
- [ ] Supabase auth redirect URLs configured
- [ ] HTTPS enabled (default on Vercel)
- [ ] Database backups enabled (Supabase)
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Monitoring set up (Vercel Analytics)
- [ ] Custom domain configured (if applicable)

### Database Migrations (Production)

**Never use `pnpm db:push` on production** (can lose data).

Instead, use Supabase migrations:

```bash
# Create migration
pnpm db:generate --name add_new_table

# Review migration in packages/db/migrations/
# Manually apply to production via Supabase Console
```

---

## Maintenance

### Regular Tasks

**Weekly**:
- Check Supabase logs for errors
- Monitor OpenAI API usage
- Review Vercel build logs

**Monthly**:
- Rotate API keys
- Review error logs
- Update dependencies: `pnpm update`

**Quarterly**:
- Security audit (see `SECURITY_AUDIT.md`)
- Performance review
- Database optimization

### Backup Database

```bash
# Supabase automatically backs up (included in pro plan)
# Manual backup:
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

---

## Useful Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm db:push` | Push schema changes to DB |
| `pnpm db:studio` | Open Drizzle Studio UI |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Check TypeScript |
| `pnpm test` | Run tests (if configured) |

---

## Support & Help

- **Supabase Docs**: https://supabase.com/docs
- **OpenAI API Docs**: https://platform.openai.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **tRPC Docs**: https://trpc.io
- **Project Issues**: GitHub Issues (this repo)

---

**Last Updated**: 2026-04-25  
**Maintained by**: Development Team
