# AIStudy Smoke Test Checklist

**Purpose**: Verify core platform functionality works end-to-end  
**Duration**: 30-40 minutes  
**Environment**: Staging or test database with fresh data  
**Last Updated**: 2026-04-25

---

## Pre-Test Setup

- [ ] Fresh database or test database with seed data
- [ ] Supabase project accessible
- [ ] OpenAI API key valid and has quota
- [ ] Two test accounts created and verified:
  - User 1: `test-user@example.com` (standard user)
  - User 2: `test-admin@example.com` (admin role)
- [ ] Sample PDF file available (mock exam, <10MB)
- [ ] Network connection stable
- [ ] Browser: Chrome/Firefox latest version
- [ ] Dev server running: `pnpm dev`
- [ ] Test environment: http://localhost:3000

---

## Test Flow 1: Authentication & Onboarding

**Duration**: 5 minutes

### T1.1: Signup Flow
- [ ] Navigate to `/signup`
- [ ] Form visible: Email, Password, Confirm Password
- [ ] Click "Sign Up" with valid email
- [ ] See success message: "Verification email sent"
- [ ] Check inbox for verification email
- [ ] Click verification link
- [ ] Redirected to study dashboard (`/study`)
- [ ] User profile created: can see displayName field

**Expected**: No 500 errors, email received within 1 minute

### T1.2: Login Flow
- [ ] Logout (profile → logout button)
- [ ] Navigate to `/login`
- [ ] Form visible: Email, Password
- [ ] Enter wrong password → See error message
- [ ] Enter correct credentials → Redirect to `/study`
- [ ] Session persists: Refresh page → Still logged in

**Expected**: Auth token stored in localStorage, no 401 errors after login

### T1.3: Access Control
- [ ] Log out
- [ ] Try navigate directly to `/study/library` → Redirect to `/login`
- [ ] Try navigate to `/study/admin` (non-admin user) → 403 error or redirect
- [ ] Log back in as standard user
- [ ] `/study/admin` should still be inaccessible

**Expected**: Protected routes enforce authentication

---

## Test Flow 2: Problem Bank Creation & AI Generation

**Duration**: 10-12 minutes

### T2.1: Navigate to AI Generation
- [ ] Click "Generate with AI" button on dashboard
- [ ] Redirect to `/study/generate`
- [ ] Page shows: Upload area, instructions, file type info

**Expected**: Clean UI, no console errors

### T2.2: PDF Upload
- [ ] Drag or click to upload sample PDF
- [ ] See "Uploading..." progress
- [ ] After upload: Show file name and extraction status
- [ ] Wait for text extraction (typically <10 seconds)
- [ ] See extracted text preview (show 2-3 pages)
- [ ] Verify text is readable (OCR worked if PDF is scanned)

**Troubleshoot If Failed**:
- [ ] Check OpenAI API quota in dashboard
- [ ] Check PDF file format (must be PDF)
- [ ] Check file size (<50MB)
- [ ] Check browser console for error details

### T2.3: Question Generation
- [ ] See "AI Generating..." message
- [ ] Wait for generation complete (typically 20-60 seconds)
- [ ] See generated questions list
- [ ] Verify questions have:
  - [ ] Prompt text
  - [ ] Question type badge (MCQ/True-False/Short Answer/Essay)
  - [ ] Answer options (if applicable)
  - [ ] Correct answer marked
  - [ ] Explanation text
  - [ ] Difficulty level

**Expected**: At least 10+ questions generated, types mixed

### T2.4: Quality Check & Scoring
- [ ] See "QC Score" badge with color:
  - [ ] Red = Poor (<60)
  - [ ] Yellow = Fair (60-74)
  - [ ] Green = Good (75-89)
  - [ ] Blue = Excellent (90+)
- [ ] See error/warning/info counts
- [ ] Click error count → See list of issues
- [ ] Verify issues are relevant (e.g., "Missing explanation", "Short prompt")

**Expected**: Quality score calculated, issues listed

### T2.5: Select Questions
- [ ] Click individual question checkboxes
- [ ] See question count update
- [ ] Click "Select All" → All checked
- [ ] Click "Deselect All" → All unchecked
- [ ] Select 5 questions
- [ ] Quality score updates based on selection

**Expected**: State updates instantly, no console errors

### T2.6: Apply to Workbook
- [ ] Click "Direct Apply" button
- [ ] If no workbook: Show dialog to create new
  - [ ] Fill title, description, visibility (public/private)
  - [ ] Click create
- [ ] See "Applying questions..." progress
- [ ] Redirect to workbook detail page
- [ ] Verify questions appear in workbook
- [ ] Check metadata shows: "🤖 AI 생성" badge

**Expected**: Workbook created, questions applied, no duplicates

### T2.7: Excel Export (Alternative)
- [ ] Back to generation preview
- [ ] Click "Export to Excel"
- [ ] File downloads: `ai-draft-[timestamp].xlsx`
- [ ] Open file in Excel/Sheets
- [ ] Verify sheets: `00-Metadata.xlsx`, `01-Questions.xlsx`, `05-ExamSets.xlsx`
- [ ] Verify data normalized: answers as 1-6 or A-F
- [ ] Verify no sensitive data (no userId, email, passwords)

**Expected**: Valid Excel file, data normalized

---

## Test Flow 3: Problem Solving & Gamification

**Duration**: 8-10 minutes

### T3.1: Start Practice Session
- [ ] Go to `/study/practice`
- [ ] See list of available workbooks
- [ ] Click one → Workbook detail page
- [ ] Click "Start Practice" button
- [ ] See first question with:
  - [ ] Question text
  - [ ] Multiple choice options (if MCQ)
  - [ ] Progress indicator (e.g., "1 of 10")

**Expected**: Question renders correctly

### T3.2: Answer & Feedback
- [ ] Select an answer
- [ ] Click "Submit" or auto-submit on select
- [ ] See feedback:
  - [ ] "Correct!" or "Incorrect" message
  - [ ] XP reward shown (e.g., "+10 XP")
  - [ ] Points shown (e.g., "+5 pts")
  - [ ] Explanation displayed
  - [ ] Correct answer highlighted
- [ ] Click "Next" → Move to next question
- [ ] Answer several questions (minimum 3)

**Expected**: XP/points update, feedback shows

### T3.3: Check XP Update
- [ ] Complete 3-5 questions (get a few right)
- [ ] Navigate to `/study/growth`
- [ ] See XP bar updated (should be higher than before)
- [ ] Check "Recent Activity" shows solved problems
- [ ] Verify level didn't change (if starting)

**Expected**: XP updates, profile reflects changes

### T3.4: Wrong Notes Flow
- [ ] Go back to `/study/practice`
- [ ] Deliberately answer a question incorrectly
- [ ] Get feedback showing wrong answer
- [ ] Navigate to `/study/wrong-notes`
- [ ] See the wrong question listed
- [ ] Click "Retry" button
- [ ] Session starts with that question
- [ ] Answer correctly this time
- [ ] See "✓ Resolved" message
- [ ] XP bonus awarded for retry success

**Expected**: Wrong notes captured, retry flow works, bonus XP awarded

### T3.5: Quests
- [ ] Navigate to `/study/quests`
- [ ] See active quests: Daily, Weekly, Monthly
- [ ] Each quest shows:
  - [ ] Title and description
  - [ ] Progress bar (e.g., 3/5 problems solved)
  - [ ] Reward (XP + points)
  - [ ] Time remaining (e.g., "20 hours left")
- [ ] Complete some quest progress by practicing more
- [ ] Refresh `/study/quests` → Progress updated
- [ ] If any quest complete → See "Claimed" button, click to claim reward

**Expected**: Quests track progress, rewards claimable

### T3.6: Leaderboards
- [ ] Navigate to `/study/rankings`
- [ ] See two boards: XP, Problems Solved
- [ ] Each shows top 10 users with names (not emails)
- [ ] Current user highlighted with background color
- [ ] Verify your user appears in leaderboard

**Expected**: Leaderboards load, current user visible

---

## Test Flow 4: Community Features

**Duration**: 7-8 minutes

### T4.1: Discover Public Workbooks
- [ ] Navigate to `/study/discover`
- [ ] See list of public workbooks with:
  - [ ] Title, description
  - [ ] Creator name
  - [ ] Star (rating), fork count
  - [ ] "Fork" and "View" buttons

**Expected**: Workbooks displayed, no console errors

### T4.2: View Workbook & Comments
- [ ] Click on a workbook → Detail page
- [ ] See workbook info: title, description, metadata
- [ ] Scroll to "Comments" section
- [ ] See comment form: text area + submit button
- [ ] See existing comments (if any)

**Expected**: Comments section visible

### T4.3: Add Comment
- [ ] Type a comment: "Great workbook! Very helpful for exam prep."
- [ ] Click "Post Comment" button
- [ ] See comment appears instantly in list
- [ ] Comment shows:
  - [ ] Author name (not email)
  - [ ] Created timestamp (e.g., "just now")
  - [ ] Comment text
  - [ ] Like button + count (0)
  - [ ] Reply button
  - [ ] Delete button (if author is current user)

**Expected**: Comment posted, visible to current user

### T4.4: Like & Reply
- [ ] Click like button on your comment
- [ ] See count increase to 1
- [ ] Click like again → Count decrease to 0
- [ ] Click "Reply" button
- [ ] See reply form appear (nested, indented)
- [ ] Type reply: "I also used this for my exam!"
- [ ] Submit reply
- [ ] Reply appears nested under parent comment

**Expected**: Like toggles, replies nest properly

### T4.5: Fork Workbook
- [ ] Back on workbook detail page
- [ ] Click "Fork" button
- [ ] See dialog: "Create a fork of this workbook?"
- [ ] Confirm
- [ ] Redirect to library, see new forked workbook
- [ ] Verify fork shows original as source (if UI shows)

**Expected**: Workbook forked to user's library

### T4.6: Edit & Publish Own Workbook (Optional)
- [ ] Go to `/study/library`
- [ ] Find a workbook you own (non-forked)
- [ ] Click edit button → Editor page
- [ ] Change title or add question
- [ ] Save
- [ ] Publish to public (if UI available)
- [ ] Verify on `/study/discover` after refresh

**Expected**: Edits saved, publishing works

---

## Test Flow 5: Admin Operations

**Duration**: 5-7 minutes  
*Only if test admin account available*

### T5.1: Access Admin Dashboard
- [ ] Logout (if needed)
- [ ] Login as admin user (`test-admin@example.com`)
- [ ] Navigate to `/study/admin`
- [ ] See dashboard with 8 statistic cards:
  - [ ] Open Reports, Reports Reviewing
  - [ ] Published Workbooks, Reported Workbooks
  - [ ] Active Quests, Failed AI Jobs
  - [ ] Questions Needing Review, Reported Comments

**Expected**: No 403 error, all cards load with counts (even if 0)

### T5.2: Reports Management
- [ ] Click on card or navigate to `/study/admin/reports`
- [ ] See filters: Status (dropdown), Target Type (dropdown)
- [ ] See report list with columns: Type, ID, Reason, Reporter, Status, Created
- [ ] If reports exist:
  - [ ] Click status button on a report
  - [ ] Change status: open → reviewing
  - [ ] See update reflected in list
  - [ ] Change to resolved
  - [ ] Status updates instantly

**Expected**: Reports filterable, status changes work

### T5.3: Quests Management
- [ ] Navigate to `/study/admin/quests`
- [ ] See all active quests in table
- [ ] Columns: Title, Type, Goal, Reward, Status, Action
- [ ] Click "Deactivate" button on a quest
- [ ] Status badge changes from "활성" to "비활성"
- [ ] Click "Activate" → Status back to "활성"
- [ ] User quest lists updated (if user checking quests, refresh shows inactive quest missing)

**Expected**: Quest toggle works, state persists

### T5.4: AI Jobs Monitoring
- [ ] Navigate to `/study/admin/ai-jobs`
- [ ] See filter for status
- [ ] See job list with columns: User, File, Status, Progress, Created
- [ ] If failed jobs exist: Click to expand, see error details
- [ ] Verify error messages are informative (e.g., "FILE_PARSE_ERROR: Corrupt PDF")

**Expected**: Jobs displayed, error details visible if failures exist

### T5.5: Question QC
- [ ] Navigate to `/study/admin/questions`
- [ ] See filter: Review Status (dropdown)
- [ ] Filter by "draft" → See questions needing review
- [ ] See columns: Question (preview), Status, Created
- [ ] (Note: Full review interface not in current build, status update requires backend)

**Expected**: Questions filterable by review status

---

## Test Flow 6: Edge Cases & Error Handling

**Duration**: 5 minutes

### T6.1: Network Error Handling
- [ ] Open DevTools → Network tab
- [ ] Throttle to "Offline" or "Slow 3G"
- [ ] Try to create a comment
- [ ] See error message (not blank loading state)
- [ ] Restore network
- [ ] Try again → Success

**Expected**: Graceful error display

### T6.2: Form Validation
- [ ] Go to create workbook dialog
- [ ] Try submit with empty title
- [ ] See validation error: "Title required"
- [ ] Try submit with >500 char title
- [ ] See error or truncation (verify expected behavior)
- [ ] Fill valid data → Success

**Expected**: Validation prevents invalid data

### T6.3: Large File Handling
- [ ] Try upload a PDF >50MB (or test limit)
- [ ] See error: "File too large" before upload
- [ ] Try upload a non-PDF file (e.g., .docx)
- [ ] See error: "File type not supported"

**Expected**: Client-side validation prevents unsupported uploads

### T6.4: Duplicate Detection
- [ ] Upload same PDF twice (or same questions to workbook)
- [ ] First time: Questions applied successfully
- [ ] Second time: See error or warning "Duplicate questions detected"
- [ ] Workbook not duplicated

**Expected**: Duplicate prevention works

### T6.5: Concurrent Actions
- [ ] Open two browser tabs with same account
- [ ] In tab 1: Add comment
- [ ] In tab 2: Refresh → See comment appear
- [ ] In tab 1: Edit comment
- [ ] In tab 2: Refresh → See edit reflected

**Expected**: Real-time updates (or refresh shows latest)

---

## Test Flow 7: Performance & Browser Compatibility

**Duration**: 5 minutes

### T7.1: Page Load Times
- [ ] Measure load time for key pages:
  - [ ] `/study` (dashboard): <2 seconds
  - [ ] `/study/generate` (upload): <3 seconds
  - [ ] `/study/practice` (question load): <1 second
  - [ ] `/study/rankings` (leaderboard): <2 seconds

**Expected**: No page takes >5 seconds

### T7.2: Image & Asset Loading
- [ ] Navigate to `/study/discover`
- [ ] Verify workbook thumbnails/icons load
- [ ] Check Network tab: Images load with 200 status
- [ ] No broken image icons

**Expected**: All images load, no 404s

### T7.3: Browser Compatibility (Smoke)
- [ ] Test on:
  - [ ] Chrome latest
  - [ ] Firefox latest (optional)
  - [ ] Safari (optional)
- [ ] Core flows work (auth, practice, comments)
- [ ] No critical console errors

**Expected**: Works on major browsers

---

## Post-Test Verification

### Database Checks
```sql
-- Verify data created during tests
SELECT COUNT(*) FROM profiles WHERE email LIKE 'test-%';
SELECT COUNT(*) FROM study_comments WHERE created_at > NOW() - INTERVAL '1 hour';
SELECT COUNT(*) FROM study_questions WHERE review_status = 'draft';
SELECT COUNT(*) FROM study_ai_generation_jobs WHERE status = 'ready';
```

### Performance Metrics (Optional)
- [ ] Check Vercel Analytics (if deployed)
- [ ] Page load times acceptable
- [ ] No error spike in error tracking (Sentry, etc.)

### Security Spot-Checks
- [ ] No API responses expose userId/email unnecessarily
- [ ] No passwords, tokens in logs
- [ ] Admin routes return 403 for non-admin users
- [ ] Public workbooks don't leak draft workbooks

---

## Summary & Sign-Off

| Category | Status | Notes |
|----------|--------|-------|
| Auth & Onboarding | ☐ Pass ☐ Fail | |
| AI Generation | ☐ Pass ☐ Fail | |
| Practice & Gamification | ☐ Pass ☐ Fail | |
| Community | ☐ Pass ☐ Fail | |
| Admin (if tested) | ☐ Pass ☐ Fail | |
| Edge Cases | ☐ Pass ☐ Fail | |
| Performance | ☐ Pass ☐ Fail | |

**Overall Result**: ☐ PASS ☐ FAIL

**Failures/Issues Found**:
```
[List any blocking issues, errors, or unexpected behavior]
```

**Sign-Off**:
- **Tester**: _______________
- **Date**: _______________
- **Environment**: _______________

---

## Regression Checklist (For future builds)

- [ ] No new console errors on key pages
- [ ] No auth flow breakage
- [ ] No data loss on save/apply
- [ ] No UI layout regressions (responsive still works)
- [ ] XP/points award working
- [ ] Comments post and display
- [ ] Admin dashboard accessible

---

**Last Updated**: 2026-04-25  
**Maintained by**: QA / Development Team
