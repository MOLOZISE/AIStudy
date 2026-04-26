# AIStudy Admin Guide

**Last Updated**: 2026-04-26  
**Version**: MVP Phase 1  
**Audience**: Platform moderators, admins, platform team

---

## Table of Contents

1. [Admin Overview](#admin-overview)
2. [Accessing Admin Panel](#accessing-admin-panel)
3. [Admin Permissions Model](#admin-permissions-model)
4. [Role: Moderator](#role-moderator)
5. [Role: Admin](#role-admin)
6. [Common Tasks](#common-tasks)
7. [Emergency Procedures](#emergency-procedures)
8. [Audit Logging](#audit-logging)
9. [FAQs](#faqs)

---

## Admin Overview

The AIStudy admin panel enables moderation, content governance, and platform monitoring. The system is built on role-based access control (RBAC) enforced server-side.

### Core Admin Functions

| Function | Purpose | Who Can Do It |
|----------|---------|---------------|
| View Reports | See flagged content | Moderator+ |
| Take Action | Delete/resolve reports | Moderator+ |
| Feature Workbooks | Promote content in discovery | Admin |
| Manage Questions | Edit/flag questions | Admin |
| Manage Quests | Create/edit learning objectives | Admin |
| Manage AI Jobs | Monitor workbook generation | Admin |
| View Audit Log | See who did what, when | Admin |

---

## Accessing Admin Panel

### Prerequisites

1. **Admin Role Assignment**: Your user must have `admin: true` in the database.

   To check: Ask platform owner or run:
   ```sql
   SELECT id, email, admin FROM study_users WHERE email = 'your@email.com';
   ```

2. **Login**: Sign in at `/login` with your admin credentials.

3. **Navigate**: Click "Admin" in the main navigation menu (only visible to admins).

### First Login

1. You'll be directed to `/study/admin` (admin dashboard)
2. Sidebar menu shows available admin sections
3. If you see "Permission Denied" → your role isn't set correctly (contact platform owner)

---

## Admin Permissions Model

### Role Hierarchy

```
Platform Owner (full database access)
    ↓
Admin (can access all admin tools, moderate, feature content)
    ↓
Moderator (can view reports, take moderation actions only)
    ↓
Regular User (no admin access)
```

### Server-Side Enforcement

All admin operations are protected server-side via tRPC middleware:

```typescript
// Example: Only admins can feature workbooks
featureWorkbook: adminProcedure
  .input(z.object({ workbookId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // ctx.user.admin === true (enforced by middleware)
    // Frontend cannot bypass this
  })
```

**Key**: The frontend only shows admin UI to users with admin role. The backend re-validates all requests.

---

## Role: Moderator

**Responsibilities**: Content moderation, user support  
**Tools Available**: Reports, content deletion, user warnings

### Moderator Workflow

1. **Review Reports** (`/study/admin/reports`)
   - New reports appear with: content, reason, reporter, timestamp
   - Click to view the flagged content in context
   
2. **Assess** 
   - Is the report valid? (spam, abuse, copyright, off-topic)
   - Or is it a misunderstanding?
   
3. **Take Action**
   - **Delete**: Remove content permanently
   - **Resolve**: Mark report as handled (content stays)
   - **Dismiss**: Report was invalid (no action taken)
   - **Warn**: Notify user their content violated policy (Phase 2)

### Report Types & Actions

| Report Type | Examples | Action |
|-------------|----------|--------|
| Spam | Duplicate workbooks, self-promotion | Delete |
| Abuse | Offensive language, harassment | Delete + Warn |
| Copyright | Unlicensed copyrighted material | Delete + Note |
| Off-Topic | Unrelated to education | Delete or Resolve |
| Quality | Incorrect answers, poor explanation | Resolve (edit by admin) |

### SLA (Service Level Agreement)

- **Critical** (abuse, spam): 4 hours
- **High** (copyright): 24 hours
- **Medium** (quality): 48 hours
- **Low** (misreports): resolve as needed

---

## Role: Admin

**Responsibilities**: Platform governance, feature management, monitoring  
**Tools Available**: Everything moderators have, plus features, jobs, quests

### Admin Workflow

#### 1. Moderation (same as Moderator)
   - Review reports
   - Take action on flagged content

#### 2. Feature Management (`/study/admin/workbooks`)
   - **Discover Page Curation**: Pin high-quality workbooks to discovery
   - **Ranking**: Featured workbooks appear at top
   - Action: Click "Feature" or drag to set order

#### 3. Question Management (`/study/admin/questions`)
   - **View All**: Questions across all workbooks
   - **Edit**: Fix typos, incorrect answers
   - **Flag**: Mark as needing review (locked from flagging until resolved)
   - **Delete**: Remove if quality is unacceptable
   - **Batch Actions**: Select multiple, apply bulk changes (Phase 2)

#### 4. Quest Management (`/study/admin/quests`)
   - **Create Quest**: 
     - Name: e.g., "Master Algebra"
     - Description: Learning objective
     - Conditions: E.g., "solve 20 algebra problems"
     - Rewards: XP, points, badge
   - **Edit Quest**: Adjust conditions, rewards (ongoing quests not affected)
   - **Deactivate**: Stop new enrollments, existing progress continues
   - **Analytics**: See quest completion rate

#### 5. AI Job Monitoring (`/study/admin/ai-jobs`)
   - **Status**: Track PDF imports, workbook generation
   - **Logs**: View processing details for debugging
   - **Retry**: If job failed, re-queue
   - **Manual Action**: Skip failed steps if one-off error

#### 6. Audit Logging
   - **View Logs**: See all admin actions with:
     - Action (delete, feature, edit)
     - User (who did it)
     - Content (what was affected)
     - Timestamp
   - **Export**: Download logs for compliance/analysis (Phase 2)

---

## Common Tasks

### Task 1: Review & Resolve a Report

**Scenario**: A report comes in that a workbook has incorrect answers.

**Steps**:
1. Go to `/study/admin/reports`
2. Click "All" or filter by "Quality"
3. Find the report: "Workbook XYZ has wrong answer"
4. Click to view:
   - Shows reported content (question with flagged answer)
   - Reporter comment: "Answer key says A but it's B"
5. Verify the issue (check working)
6. Take action:
   - If wrong: Mark "Resolve" (admin will edit in questions panel)
   - If correct: Mark "Dismiss" (re-educate reporter if possible)
7. Add note: "Verified, will correct answer key"
8. Click "Submit Action"

**Result**: Report closed, workbook creator notified (Phase 2), issue tracked.

---

### Task 2: Feature a Workbook

**Scenario**: A high-quality Excel workbook should be promoted.

**Steps**:
1. Go to `/study/admin/workbooks`
2. Search or scroll to find workbook: "Advanced Excel Formulas"
3. Click "Feature" button
4. Workbook moves to "Featured" section
5. It now appears at top of `/study/discover`
6. Users see it first (better engagement)

**Alternative**: Drag workbook in featured list to reorder.

---

### Task 3: Edit a Question

**Scenario**: A question has a typo: "wha is 2+2?" should be "what is 2+2?"

**Steps**:
1. Go to `/study/admin/questions`
2. Search by: workbook name, concept, or keyword "wha"
3. Find the question
4. Click "Edit"
5. Modal opens with question fields:
   - Question text: "wha is 2+2?"
   - Options: A) 3, B) 4, C) 5
   - Correct Answer: B
   - Explanation: "2+2=4"
6. Fix typo: "what is 2+2?"
7. Click "Save"
8. Question updated across all attempts (no retroactive scoring change)

---

### Task 4: Create a Quest

**Scenario**: Launch a "Master the Basics" quest to encourage new users.

**Steps**:
1. Go to `/study/admin/quests`
2. Click "Create Quest"
3. Fill form:
   - **Name**: "Master the Basics"
   - **Description**: "Solve 50 introductory level problems to build foundation skills"
   - **Condition Type**: "solve_n_problems"
   - **Condition Value**: 50
   - **Reward XP**: 500
   - **Reward Points**: 100
   - **Active**: Toggle on
4. Click "Create"
5. Quest published → users can see in `/study/quests`
6. Progress tracked automatically

---

### Task 5: View Audit Log

**Scenario**: "Who deleted workbook #123?" Check the audit log.

**Steps**:
1. Go to `/study/admin` → "Audit Log" (or similar)
2. Filter by:
   - **Action**: "delete"
   - **Content Type**: "workbook"
   - **Date Range**: Last 7 days
3. Results show:
   - "Admin John deleted workbook #123 'Excel Basics' on 2026-04-25 14:23 UTC"
   - Reason (if logged): "Low quality, duplicate content"
4. Can view full context, undo if needed (Phase 2)

---

## Emergency Procedures

### Procedure 1: Spam Influx

**Scenario**: 50 spam workbooks suddenly appear.

**Response**:
1. **Immediate**: Don't panic—they're not visible to users yet (new content review pending, Phase 2)
2. **Triage**: Go to `/study/admin/reports` (or `/study/admin/workbooks`)
3. **Bulk Action**: Select multiple spam workbooks, click "Delete All"
4. **Log**: Document incident (number, time, pattern) in audit notes
5. **Investigate**: Check if account compromised—if so, disable account (escalate to owner)
6. **Implement**: If pattern continues, suggest:
   - Email verification requirement (Phase 2)
   - Cooldown between uploads
   - AI spam detection (Phase 2)

---

### Procedure 2: Abusive Content

**Scenario**: A user posts hateful comments on workbooks.

**Response**:
1. **Document**: Screenshot or note the comments
2. **Delete**: Remove comments from public view immediately
3. **Investigate**: View user profile—are there more violations?
4. **Action**: 
   - First violation: Warn (Phase 2)
   - Second: Suspend account (Phase 2)
   - Third: Ban permanently
5. **Escalate**: If severe (threats, illegal), escalate to platform owner + legal

---

### Procedure 3: System Under Load

**Scenario**: Database slow, users experiencing lag.

**Response**:
1. **Monitor**: Check `/study/admin` dashboard for:
   - API latency
   - Database connection pool
   - Memory usage
2. **Quick Fix**: 
   - Clear cache (if applicable)
   - Restart process (if self-hosted)
   - Scale up Supabase plan (if cloud)
3. **Investigate**: 
   - What changed? (new feature, spike in traffic)
   - Query slow logs (Supabase dashboard)
4. **Long-term**: 
   - Add indexes to hot queries
   - Implement caching
   - Optimize API calls

---

## Audit Logging

Every admin action is logged automatically:

```sql
-- Audit log schema (example)
study_audit_logs:
  - id (UUID)
  - admin_id (FK to study_users)
  - action (delete, edit, feature, create)
  - resource_type (workbook, question, report, quest)
  - resource_id (ID of affected resource)
  - before (JSON snapshot before change)
  - after (JSON snapshot after change)
  - reason (admin notes)
  - timestamp (when action occurred)
  - ip_address (IP of admin)
```

### Viewing Logs

1. Go to `/study/admin` → "Audit Log"
2. Filter by: admin, action, date, resource
3. Click entry to see before/after

### Exporting

For compliance:
```bash
pnpm audit:export --format=csv --from=2026-01-01 --to=2026-04-26
```

---

## FAQs

### Q: Can I undo a deletion?

**A**: Phase 1 MVP doesn't have soft deletes yet. Phase 2 will add:
- 30-day trash bin
- Restore functionality
- Audit trail showing what was deleted and why

For now: Be careful with deletions. If you delete by mistake, note the ID and timestamp, contact platform owner to restore from backup.

---

### Q: What if a report is invalid?

**A**: Mark it "Dismiss" and optionally add a note:
- "Content is allowed per guidelines"
- "Reporter misunderstood context"

This trains the system over time and helps reporters understand boundaries.

---

### Q: Can I edit someone's workbook without permission?

**A**: Yes, if it violates guidelines (copyright, spam, abuse). But you should:
1. Take least disruptive action (fix typo) vs full delete
2. Notify the creator: "Your workbook was edited: [reason]"
3. Log reasoning in audit trail

Philosophy: Assume good intent. Most creators fix issues if notified.

---

### Q: What if an admin abuses their powers?

**A**: The audit log tracks everything. Platform owner can:
1. Review admin actions
2. Revert changes
3. Demote or remove admin privileges
4. Take disciplinary action

**Principle**: Transparency prevents abuse. All actions are logged and reversible.

---

### Q: How often should I check for reports?

**A**: Recommended cadence:
- **Critical** (abuse): Check hourly during office hours
- **High** (spam/copyright): Check 2x daily
- **Medium** (quality): Check daily
- **Low** (false reports): Check weekly

Set up alerts in Slack (Phase 2) to notify admins of new reports.

---

### Q: Can I change a user's role?

**A**: Phase 1 MVP: No self-service. Contact platform owner to change roles.

Phase 2 will add role management UI:
- Admins can promote/demote moderators
- Admins can disable users
- All actions logged

---

### Q: What's the difference between "Delete" and "Resolve"?

**A**: 
- **Delete**: Remove content permanently. User can't recover it.
- **Resolve**: Mark report as handled (content may stay, but issue documented).

Example:
- Spam workbook → Delete
- Typo in question → Resolve (admin edits, no deletion)
- False report → Dismiss (no action taken)

---

### Q: Can users appeal a moderation decision?

**A**: Phase 1: No appeal system yet.

Phase 2 plan:
- Users can appeal within 7 days
- Goes to admin review queue
- Higher-tier admin (or owner) makes final decision
- Logged and auditable

---

### Q: How do I check platform health?

**A**: Go to `/study/admin` dashboard (Phase 2):
- Current users online
- API latency (p50, p95, p99)
- Database pool size
- Cache hit rate
- Failed API calls (last hour)
- Top slow queries

For now, check Vercel and Supabase dashboards directly.

---

## Contact & Escalation

**For questions**:
- Slack: #admin-team
- Email: admin@AIStudy.com
- Office Hours: M-F 10am-12pm UTC

**For critical issues**:
- Emergency Slack: @platform-owner
- 24/7 Hotline: (will be added in Phase 2)

**Escalation Path**:
1. Try to resolve (consult this guide)
2. Ask team in #admin-team
3. If urgent/unresolved → contact platform owner
4. If legal/security → contact legal immediately

---

## Best Practices

1. **Log everything**: Your reasons for actions help future admins
2. **Assume good intent**: Most users want to do right thing
3. **Communicate**: Notify users of moderation (Phase 2)
4. **Stay impartial**: Rules apply equally regardless of user status
5. **Escalate early**: If unsure, ask—better than make mistake
6. **Review regularly**: Check dashboard daily for patterns/issues
7. **Iterate policies**: Report trends to product team for policy updates

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-04-26 | MVP | Initial admin guide for Phase 1 |
| TBD | Phase 2 | Appeals, role management, alerts, bulk actions |
| TBD | Phase 3 | ML moderation, predictive banning, advanced analytics |

---

**Last Updated**: 2026-04-26  
**Next Review**: 2026-05-26
