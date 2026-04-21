# Claude Code / Codex Prompts for Company Community Platform

**Quick Start**: Copy entire content from a week's prompt file below and paste into Claude Code chat.

---

## 📋 Weekly Prompts (Phase 1 MVP)

### Week 2: Authentication + Profiles
**File**: `week-2-auth.md`

```
File → Copy → Paste in Claude Code Chat
```

**What it implements**:
- Supabase Auth (email signup/login)
- User profiles (edit name, department, job title)
- Session persistence (localStorage)
- Protected routes + tRPC procedures

**Estimated Time**: 1-2 days  
**Difficulty**: Medium (first full feature)

---

### Week 3: Channels + Posts CRUD
**File**: `week-3-channels-posts.md`

**What it implements**:
- Channel list, join/leave channels
- Post creation with optional image upload
- Infinite scroll feed
- Anonymous post support
- Sorting: Hot/New/Top

**Estimated Time**: 3-4 hours  
**Difficulty**: Medium-High (image upload, pagination)

---

### Week 4: Votes + Reactions + Comments
**File**: `week-4-votes-comments.md`

**What it implements**:
- Upvote/downvote on posts & comments
- 6 emoji reactions (👍 ❤️ 😂 😮 😢 😠)
- Hierarchical comments (2 levels: reply to post, reply to comment)
- Anonymous comment numbering consistency

**Estimated Time**: 4-5 hours  
**Difficulty**: High (nested structures, optimistic updates)

---

### Week 5: Realtime Comments + Notifications
**File**: `week-5-realtime-notifications.md`

**What it implements**:
- Supabase Realtime: live comment updates (no refresh)
- Notification system (comment replies, upvotes)
- Database triggers (auto-create notifications)
- Notification bell in header with badge
- Full notifications page

**Estimated Time**: 3-4 hours  
**Difficulty**: Medium (Realtime subscriptions)

---

### Week 6: Polish, Search, Report + Deploy
**File**: `week-6-polish-deploy.md`

**What it implements**:
- Search feature (full-text on posts/users)
- Report feature (spam, hate, inappropriate)
- Hot score sorting (Wilson Score algorithm)
- Mobile responsive optimization (375px+)
- Image lazy loading
- Lighthouse optimization
- Deployment to Vercel

**Estimated Time**: 5-6 hours  
**Difficulty**: Medium (mobile testing intensive)

---

## 🚀 How to Use

### For Each Week:

1. **Open the week's prompt file** (e.g., `week-2-auth.md`)
2. **Copy all content** (Ctrl+A, Ctrl+C)
3. **Open Claude Code** in VS Code (left sidebar icon)
4. **Paste into chat** (Ctrl+V)
5. **Hit Send**

Claude Code will:
- Read project context from CLAUDE.md
- Study existing code patterns
- Generate implementation step-by-step
- Create components, routers, pages
- Run type checks & suggest tests
- Commit to GitHub

---

## 📖 Context Files (Already Read by Claude Code)

These are auto-loaded when you paste a prompt:

- **CLAUDE.md** - Project overview, structure, patterns
- **.claude/settings.json** - Development rules
- **.claude/master-prompt.md** - Quick reference
- **.claude/development-checklist.md** - Weekly tasks

Claude Code reads these automatically, so **don't paste them again**.

---

## 🎯 Workflow Example

### Week 2 (Auth):

```
1. VS Code: Open .claude/prompts/week-2-auth.md
2. Select all (Ctrl+A), copy (Ctrl+C)
3. Claude Code chat, paste (Ctrl+V)
4. Hit Send
5. Claude starts:
   - Reads CLAUDE.md (structure)
   - Creates packages/api/src/routers/auth.ts
   - Creates auth pages (signup, login)
   - Creates profile page
   - Commits & explains changes
6. You review, test in browser
7. Next week: repeat with week-3 prompt
```

---

## ✅ Before Starting Each Week

**Checklist**:

- [ ] Previous week's branch merged to `main`
- [ ] `pnpm install` successful (new dependencies)
- [ ] `.env.local` has all required vars
- [ ] `pnpm db:push` if schema changed
- [ ] No TypeScript errors: `pnpm type-check`
- [ ] Ready to start new feature

---

## 🔄 Parallel Work with Codex

**Option**: Use Claude Code for frontend, Codex for backend:

```
Claude Code (Frontend)     |  Codex (Backend)
- React components         |  - tRPC routers
- Pages & layouts          |  - Zod schemas
- User interactions        |  - Database logic
```

Both need the same prompt context (CLAUDE.md + week prompt).

**Setup Codex Chat**:
1. Open Codex in VS Code (if installed)
2. Paste same week prompt + CLAUDE.md summary
3. Ask for backend only (API routers)
4. Merge code from both editors

---

## 🐛 If Claude Code Gets Stuck

**Debugging**:

1. **Clarify requirements**:
   - "I want X done first, then Y"
   - "Check posts router pattern before generating"

2. **Check context**:
   - Paste relevant file content (e.g., existing router)
   - Ask Claude to study pattern before generating

3. **Break into smaller steps**:
   - "First, just write Zod schemas"
   - "Then, write the tRPC procedure"
   - "Then, write the React component"

4. **Specific feedback**:
   - "This component should use useQuery, not direct call"
   - "Add error handling for network failures"

---

## 📝 Prompt Structure (What Each Week Contains)

**Every prompt follows this structure**:

1. **🎯 Objective** - What you're building
2. **📋 Implementation Plan**
   - Backend (tRPC routers)
   - Database (schema, migrations)
   - Frontend (components, pages)
3. **✅ Acceptance Criteria** - What "done" means
4. **🔍 Reference Files** - Existing code to study
5. **📝 Task Breakdown** - Step-by-step
6. **🧪 Manual Testing Checklist** - How to verify
7. **Git Workflow** - Commit template
8. **🚀 Success Metrics** - Final checklist
9. **Next Week** - What's coming

---

## 💾 Saving Work Between Weeks

**After each week**:

```bash
# Ensure everything committed
git status                    # Should be clean

# Create a summary
echo "Week X complete - features working, tests passed" > .claude/status/week-X.md

# Next week, start fresh branch
git checkout -b feature/week-$(X+1)-[name]
```

---

## 🎓 Learning from Prompts

**Each prompt teaches**:

- **Code patterns**: How to structure tRPC routers, React components
- **Project conventions**: File organization, naming, type safety
- **Full-stack flow**: From backend → API → frontend
- **Testing approach**: How to verify features work

Study the prompts to understand the patterns → you'll start predicting what Claude Code will generate.

---

## 🚨 Important Notes

### Claude Code Limitations

- **Can't run interactive commands** → You must test in browser
- **Can't deploy directly** → `git push main` triggers Vercel
- **May generate over-engineered code** → Ask for "simple, minimal implementation"

### What Claude Code Does Well

- ✅ Generates boilerplate quickly
- ✅ Maintains type safety (Zod + TypeScript)
- ✅ Follows project patterns
- ✅ Writes test-friendly code
- ✅ Commits with good messages

---

## 📞 Quick Reference

| Need | Action |
|------|--------|
| Start Week 2 | Copy `week-2-auth.md`, paste in Claude Code |
| Check patterns | Read CLAUDE.md section on that feature |
| Understand structure | Read `.claude/master-prompt.md` |
| Know what to test | Read acceptance criteria in week prompt |
| See week tasks | Read `.claude/development-checklist.md` |
| Commit template | Copy "Git Workflow" section from week prompt |

---

## 🎯 Success Indicators

**You're on track if**:
- [ ] Code generated is readable (not obfuscated)
- [ ] Components follow React best practices
- [ ] tRPC routers have proper Zod validation
- [ ] TypeScript check passes without errors
- [ ] Features work in browser test
- [ ] Code commits cleanly to GitHub
- [ ] No significant technical debt

**Red flags**:
- [ ] Generated code has many TypeScript errors
- [ ] Components are overly complex
- [ ] No error handling in API calls
- [ ] Tests fail or don't exist
- [ ] Commit history is messy

---

## 🚀 Next Steps

1. **Week 2 Ready?**
   ```bash
   pnpm install                  # Install all dependencies
   # Edit .env.local → add DATABASE_URL
   pnpm db:push                  # Sync schema to Supabase
   # Then paste week-2-auth.md into Claude Code
   ```

2. **Paste Full Prompt**:
   - Copy entire `week-2-auth.md` (all 300+ lines)
   - Paste into Claude Code chat
   - Hit Send
   - Let Claude Code generate the feature

3. **Review & Test**:
   - Claude Code shows what it generated
   - Review changes
   - `pnpm dev` → test in browser at localhost:3000
   - `pnpm type-check` → verify types
   - Commit and merge

4. **Move to Week 3**:
   - Repeat with `week-3-channels-posts.md`

---

**Happy coding! 🎉**

Generated: 2026-04-21  
For: Company Community Platform Phase 1 MVP

