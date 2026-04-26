# AIStudy Admin Operations Guide

**Audience**: Platform administrators, support team, operations  
**Last Updated**: 2026-04-25

---

## Table of Contents
1. [Admin Account Setup](#admin-account-setup)
2. [Admin Dashboard Overview](#admin-dashboard-overview)
3. [Report Management](#report-management)
4. [Quest Management](#quest-management)
5. [AI Job Monitoring](#ai-job-monitoring)
6. [Question QC Workflow](#question-qc-workflow)
7. [Common Issues & Resolution](#common-issues--resolution)
8. [Database Access](#database-access)

---

## Admin Account Setup

### Prerequisites
- Admin user must exist in `profiles` table with `role = 'admin'`
- Email verification completed in Supabase Auth
- Active session with valid JWT token

### Creating an Admin User

**Option 1: SQL (Direct)**
```sql
-- 1. Create auth user in Supabase Console
-- Settings → Users → Add user (email, password, mark verified)

-- 2. Update profile role
UPDATE profiles 
SET role = 'admin' 
WHERE id = '[user-id-from-auth]';
```

**Option 2: Drizzle Studio**
1. Run `pnpm db:studio`
2. Open `profiles` table
3. Find user by email
4. Set `role` column to `'admin'`

### Verifying Admin Access
1. Log in with admin email
2. Navigate to `/study/admin`
3. Should see dashboard with 8 statistic cards (no 403 error)

---

## Admin Dashboard Overview

**Route**: `/study/admin`

### Dashboard Cards (Read-Only)

| Card | What It Shows | Action |
|------|---------------|--------|
| **Open Reports** | Active reports awaiting review | Click to filter in `/study/admin/reports` |
| **Reports Reviewing** | Reports under investigation | Click to filter in `/study/admin/reports` |
| **Published Workbooks** | Public content count | Informational only |
| **Reported Workbooks** | Community-flagged workbooks | Implied in `/study/admin/workbooks` (placeholder) |
| **Active Quests** | Running daily/weekly/monthly quests | Click to manage in `/study/admin/quests` |
| **Failed AI Jobs** | PDF uploads with errors | Click to filter in `/study/admin/ai-jobs` |
| **Questions Needing Review** | Draft/needs_fix questions | Click to filter in `/study/admin/questions` |
| **Reported Comments** | Flagged comments from community | Click to see in reports list |

---

## Report Management

**Route**: `/study/admin/reports`

### Report Types
- `comment` — User-reported comments (harassment, spam, etc.)
- `question` — Questions flagged for quality issues
- `publication` — Workbooks reported as inappropriate/low-quality

### Status Workflow

```
open → reviewing → resolved
              ↓
           rejected
```

**Status Meanings**:
- **open**: Just arrived, not yet assessed
- **reviewing**: Admin is investigating
- **resolved**: Issue found and action taken (comment hidden, publication hidden, etc.)
- **rejected**: False report, no action needed

### Admin Actions

#### 1. List & Filter Reports
- **Status Filter**: Dropdown for `open`, `reviewing`, `resolved`, `rejected`
- **Target Type Filter**: Dropdown for `comment`, `question`, `publication`
- Shows: Target type, Target ID, Reason, Reporter name, Status, Created date

#### 2. Change Report Status
- Click status button on report row
- Select new status: **검토** (reviewing) or **해결** (resolved) or **반려** (rejected)
- Status updates instantly
- Other admins will see updated status on refresh

#### 3. Take Content Action

**For Comment Reports** (`targetType = 'comment'`):
- Go to `/study/admin/reports`
- Note the `targetId` (commentId)
- Comment will be hidden automatically when report is marked `resolved`
- (Future: Add quick "Hide Comment" action button)

**For Publication Reports** (`targetType = 'publication'`):
- Note the `targetId` (publicationId)
- Publication marked as `reported` in database
- (Future: Add "Hide Publication" button)

**For Question Reports** (`targetType = 'question'`):
- Note the `targetId` (questionId)
- Navigate to `/study/admin/questions`
- Find question and update `reviewStatus` to `rejected`

#### 4. Monitor Abusive Reporters
- Track reporter IDs in multiple reports
- (Future: Add reporter history, potential ban)

---

## Quest Management

**Route**: `/study/admin/quests`

### Quest Types
- **daily**: Resets every 24 hours
- **weekly**: Resets every 7 days
- **monthly**: Resets every 30 days

### Admin Actions

#### 1. View All Quests
Table shows:
- **Title**: Quest name (e.g., "Solve 5 problems")
- **Type**: Badge showing `daily` / `weekly` / `monthly`
- **Goal**: Target metric & value (e.g., "solve_questions / 5")
- **Reward**: XP and points granted on completion
- **Status**: `활성` (active) or `비활성` (inactive)

#### 2. Toggle Quest Active/Inactive
- Click **활성화** (enable) or **비활성화** (disable) button
- Quest status updates instantly
- Disabled quests no longer appear in user feeds

**Use Cases**:
- Disable problematic quests (e.g., too easy, too hard)
- Rotate quests seasonally
- Pause quests during maintenance

#### 3. Create New Quest (Backend)
Currently requires API/database access:
```sql
INSERT INTO study_quests (
  type, code, title, description, metric, 
  target_value, reward_xp, reward_points, 
  starts_at, ends_at, is_active, created_by
) VALUES (
  'daily', 'solve_5_q', 'Solve 5 Questions', 
  'Practice solving problems', 'solve_questions', 
  5, 10, 5, 
  NOW(), NOW() + INTERVAL '90 days', 
  true, '[admin-user-id]'
);
```

**Future**: Add UI form in `/study/admin/quests` for quest creation

---

## AI Job Monitoring

**Route**: `/study/admin/ai-jobs`

### Job Lifecycle

```
pending → extracting → generating → ready (success)
  ↓         ↓            ↓
  └─────────────────────→ failed
```

**Status Meanings**:
- **pending**: Queued, waiting to start
- **extracting**: PDF text extraction in progress
- **generating**: OpenAI API call generating questions
- **ready**: Complete, questions ready for user to apply
- **failed**: Error occurred, check error details
- **cancelled**: User cancelled or admin intervention

### Admin Actions

#### 1. Monitor Running Jobs
- Filter by status: `pending`, `extracting`, `generating`, `ready`, `failed`
- Shows:
  - User display name (not email)
  - File name
  - Progress (percentage)
  - Created timestamp

#### 2. Diagnose Failed Jobs
- Click job row to expand
- See **Error Details** section with error payload
- Common errors:
  - `FILE_PARSE_ERROR`: PDF unreadable (corrupt, scanned image, wrong format)
  - `API_RATE_LIMIT`: OpenAI quota exceeded
  - `API_ERROR`: OpenAI service issue
  - `TIMEOUT`: Job took >30min (file too large)

#### 3. Help Users
- If job failed due to OpenAI quota: "Please try again in 1 hour"
- If job failed due to file: "File format unsupported, try PDF"
- User can always re-upload and retry (no cost)

---

## Question QC Workflow

**Route**: `/study/admin/questions`

### Review Statuses

| Status | Meaning | Action |
|--------|---------|--------|
| **draft** | Newly generated, not reviewed | Admin reviews and approves/rejects |
| **needs_fix** | Reviewed but has issues | User edits, resubmits for approval |
| **approved** | Passed QC, ready for use | Can appear in exams, problem sets |
| **rejected** | Not meeting standards | User can delete and regenerate |

### Admin Actions

#### 1. Filter Questions by Status
- Dropdown filter: `모든 상태` (all), `검수 중` (draft), `수정 필요` (needs_fix), `승인됨` (approved), `반려됨` (rejected)

#### 2. Review Question Quality
- Show: Question text, review status badge, source file, creation date
- Click question row (future): See full details, AI quality score, edit history

#### 3. Update Review Status (Future UI)
- Currently only available through API or database
- Command: `updateQuestionReviewStatus(questionId, status)`

**Manual SQL** (if needed):
```sql
UPDATE study_questions 
SET review_status = 'approved' 
WHERE id = '[question-id]';
```

### Quality Criteria (Reference)

AI questions flagged if:
- **Errors**: Missing prompt/answer, unsupported type, invalid answer indices
- **Warnings**: Short text (<10 chars), confusing explanations
- **Info**: Single accepted answer, unusual difficulty

Questions with errors should be **rejected** or require user fixes.

---

## Common Issues & Resolution

### Issue: Admin Dashboard Shows 403 Forbidden

**Cause**: User role is not `'admin'`

**Resolution**:
```sql
SELECT id, email, role FROM profiles WHERE email = 'user@example.com';
UPDATE profiles SET role = 'admin' WHERE id = '[user-id]';
```

Then refresh page.

---

### Issue: Report Status Won't Update

**Cause**: Permission check failed or database write error

**Resolution**:
1. Verify user is admin (see above)
2. Check network tab for API errors
3. Try marking report `reviewing` first, then `resolved`

---

### Issue: AI Job Shows "Pending" for >30 Minutes

**Cause**: File too large, OpenAI timeout, or stuck process

**Resolution**:
1. Check error details (expand job row)
2. If no error visible: Database query stalled
3. Contact user: Ask to retry with smaller file
4. (Future): Add admin "Cancel Job" button

---

### Issue: Comments Not Hidden When Report Marked "Resolved"

**Cause**: Comment hiding is not automatic in current build

**Workaround**:
```sql
-- Find the comment by report targetId
SELECT body, author_id, status FROM study_comments 
WHERE id = '[targetId-from-report]';

-- Hide it
UPDATE study_comments 
SET status = 'hidden' 
WHERE id = '[targetId-from-report]';
```

(Future): Automate on report status change.

---

### Issue: Leaderboard Shows Wrong XP

**Cause**: XP not awarded, or cached stale data

**Resolution**:
1. Verify user completed a quest or problem
2. Check `user_rewards` table for recent entries
3. Clear browser cache and refresh
4. Check last `updated_at` timestamp on user profile

---

## Database Access

### Using Drizzle Studio

```bash
pnpm db:studio
# Opens http://localhost:3001
```

**Key Tables for Admin Work**:

| Table | Purpose |
|-------|---------|
| `profiles` | User role, level, XP (query: `SELECT id, email, role FROM profiles;`) |
| `study_reports` | Reports: status, targetType, reason |
| `study_comments` | Comments: status (active/hidden/deleted/reported) |
| `study_questions` | Questions: review_status (draft/needs_fix/approved/rejected) |
| `study_quests` | Quests: is_active (true/false) |
| `study_ai_generation_jobs` | Jobs: status, progress, error_payload |
| `study_workbook_publications` | Publications: status (published/reported/hidden) |

### Useful Admin Queries

**Find user by email**:
```sql
SELECT * FROM profiles WHERE email = 'user@example.com';
```

**List all open reports**:
```sql
SELECT id, target_type, target_id, reason, status, created_at 
FROM study_reports 
WHERE status = 'open' 
ORDER BY created_at DESC;
```

**Count questions by review status**:
```sql
SELECT review_status, COUNT(*) 
FROM study_questions 
GROUP BY review_status;
```

**Find abusive users** (multiple reports):
```sql
SELECT reporter_id, COUNT(*) as report_count 
FROM study_reports 
GROUP BY reporter_id 
HAVING COUNT(*) > 3 
ORDER BY report_count DESC;
```

---

## Escalation Path

### When to Escalate

1. **Repeated reports from same user** → Contact user, warn about ToS
2. **Copyright/Legal issue** → Escalate to legal team (if applicable)
3. **Explicit harassment** → Ban user account + delete content
4. **Platform exploitation** → Check logs, patch security hole

### Current Limitations

- No automated ban/suspension in current build
- No user messaging system
- No bulk moderation actions
- (All future enhancements)

---

## Best Practices

1. **Review reports promptly** (target: <24 hours)
2. **Document reasons** for status changes (in future: add comment field)
3. **Monitor failed AI jobs** weekly to identify systemic issues
4. **Rotate quest difficulty** to keep engagement high
5. **Keep admin accounts secure** (use strong password, enable 2FA in Supabase)

---

**Questions?** Check `KNOWN_ISSUES.md` or contact development team.
