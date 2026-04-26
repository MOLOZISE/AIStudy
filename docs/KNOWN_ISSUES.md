# AIStudy Known Issues & Technical Debt

**Last Updated**: 2026-04-25  
**Audience**: Development team, stakeholders

---

## Overview

This document tracks known limitations, bugs, and technical debt identified during P0-P14 implementation. Issues are categorized by severity and priority for future sprints.

**Current Status**: 
- **Critical Issues**: 0
- **High Priority**: 2
- **Medium Priority**: 5
- **Low Priority (Nice-to-Have)**: 8

---

## Critical Issues

*None identified* ✅

---

## High Priority (Should Fix Before Scale-Up)

### 1. Auto-Comment Hiding on Report Resolved

**Issue**: When admin marks a report as `resolved` (for a comment), the comment is not automatically hidden.

**Current Behavior**: Admin must manually update comment status in database.

**Expected Behavior**: Report status change to `resolved` should trigger `study_comments.status = 'hidden'`.

**Impact**: Admin workflows require extra steps; moderation not self-service.

**Workaround**: SQL:
```sql
UPDATE study_comments 
SET status = 'hidden' 
WHERE id = '[targetId-from-report]';
```

**Fix**: Add trigger or middleware in `updateReportStatus` mutation to hide content when status → resolved.

**Effort**: Low (1-2 hours)  
**Priority**: High  
**Timeline**: Next sprint

---

### 2. Missing User Data Deletion API (GDPR)

**Issue**: No way for users to delete their account and associated data.

**Current Behavior**: Account deletion must be done by admin/support manually.

**Expected Behavior**: User can request account deletion → System deletes/anonymizes all personal data within 30 days.

**Impact**: GDPR non-compliance, legal risk for EU deployment.

**Fix**: Add `deleteMyAccount` mutation that:
- Marks user as deleted
- Anonymizes all comments (body → "[deleted user]")
- Soft-deletes all workbooks
- Retains data for audit (doesn't hard-delete)

**Effort**: Medium (3-4 hours)  
**Priority**: High (before EU launch)  
**Timeline**: Next sprint

---

## Medium Priority (Improve User Experience)

### 3. AI Job Error Messages Too Technical

**Issue**: When AI generation fails, error message is cryptic to users (e.g., "FILE_PARSE_ERROR").

**Current Behavior**: Admin sees error in detail; user sees generic "Please try again" message.

**Expected Behavior**: User sees actionable message: "PDF could not be read. Try uploading a newer PDF file."

**Impact**: User confusion, low trust in AI feature.

**Fix**: Map error codes to user-friendly messages in `process/route.ts`.

**Effort**: Low (1 hour)  
**Priority**: Medium  
**Timeline**: Next sprint

---

### 4. Comment Threading Limited to 1 Level

**Issue**: Comments can have replies (1 level of nesting), but replies cannot have sub-replies.

**Current Behavior**: Only top-level comments and direct replies show; no infinite threading.

**Expected Behavior**: (Optional) Support 2+ levels of nesting for deep discussions.

**Impact**: Long discussions feel flat; hard to follow context.

**Workaround**: Users adapt to 1-level threading (similar to Reddit top-level).

**Fix**: Remove `WHERE parentCommentId IS NULL` constraint in listing; allow reply.parentCommentId to reference another reply.

**Effort**: Medium (2-3 hours for DB + UI changes)  
**Priority**: Medium (nice-to-have)  
**Timeline**: Post-MVP

---

### 5. No Direct Admin Quest Creation UI

**Issue**: Admins can toggle quests on/off but cannot create new quests via UI.

**Current Behavior**: Quest creation requires SQL or API call.

**Expected Behavior**: Admin form in `/study/admin/quests` with fields: Type, Title, Description, Metric, Target, Rewards, Dates.

**Impact**: Admins cannot launch seasonal quests without developer help.

**Fix**: Add `createQuest` form in admin quests page.

**Effort**: Medium (2-3 hours)  
**Priority**: Medium  
**Timeline**: Next sprint

---

### 6. No Bulk Moderation Actions

**Issue**: Admins must hide/report comments one-by-one.

**Current Behavior**: Check box per action, no multi-select.

**Expected Behavior**: Select multiple items, bulk hide/delete/change status.

**Impact**: Moderating spam floods takes many clicks.

**Fix**: Add checkbox selection UI, bulk action buttons.

**Effort**: Medium (2-3 hours)  
**Priority**: Medium  
**Timeline**: Post-MVP

---

### 7. XP/Points Not Real-Time in Some Views

**Issue**: After earning XP, refreshing `/study/growth` is needed to see updated stats (no live refresh).

**Current Behavior**: XP shown in popup immediately, but dashboard doesn't update until refresh.

**Expected Behavior**: Dashboard updates automatically via real-time subscription.

**Impact**: User confusion; growth dashboard doesn't feel live.

**Fix**: Add Supabase real-time listener in `GrowthDashboard` component.

**Effort**: Medium (2-3 hours)  
**Priority**: Medium  
**Timeline**: Post-MVP

---

## Low Priority (Nice-to-Have)

### 8. User Messaging / Admin Notifications

**Issue**: No way to send messages to users or notify admins.

**Current Behavior**: N/A (not implemented).

**Expected Behavior**: Admin can send in-app message to user (e.g., "Your question was rejected, here's why...").

**Impact**: User feedback loops incomplete; poor support experience.

**Timeline**: Post-MVP  
**Effort**: High (new table, notifications system)

---

### 9. Export Comments as Data Archive

**Issue**: Users cannot export comments/discussions they participated in.

**Current Behavior**: Comments only viewable in UI.

**Expected Behavior**: Users can export all comments as CSV/JSON (data portability).

**Impact**: GDPR data portability requirement not met.

**Timeline**: Before EU launch  
**Effort**: Low (1-2 hours)

---

### 10. Automatic Content Moderation (AI)

**Issue**: All moderation is manual; no automated spam/hate speech detection.

**Current Behavior**: Admins review all reports manually.

**Expected Behavior**: OpenAI API analyzes reported content, recommends action.

**Impact**: Moderation doesn't scale beyond 10K users.

**Timeline**: Post-MVP  
**Effort**: High (OpenAI API, ML pipeline)

---

### 11. Mobile App (Phase 2)

**Issue**: Only web app exists; no native mobile apps.

**Current Behavior**: Mobile uses responsive web (okay UX).

**Expected Behavior**: iOS/Android apps via Expo.

**Impact**: Lower engagement on mobile; no App Store presence.

**Timeline**: Phase 2 (future)  
**Effort**: Very High (entire mobile codebase)

---

### 12. Workbook Import from External Sources

**Issue**: Can only import via Excel or PDF; no Google Sheets, Quizlet, Anki integration.

**Current Behavior**: Manual Excel template required.

**Expected Behavior**: Import from other platforms (one-click).

**Impact**: High friction for users migrating from other tools.

**Timeline**: Post-MVP  
**Effort**: Medium (API integrations)

---

### 13. Advanced Analytics & Reporting

**Issue**: No detailed progress reports, no cohort analysis.

**Current Behavior**: Basic `/study/stats` page.

**Expected Behavior**: Downloadable PDF reports, comparison tools, cohort insights.

**Impact**: Teachers/schools cannot assess class-wide progress.

**Timeline**: Post-MVP (depends on B2B pivot)  
**Effort**: High (report generation, data aggregation)

---

### 14. API Rate Limiting (Explicit)

**Issue**: No explicit API rate limiting in code; relies on infrastructure defaults.

**Current Behavior**: Vercel/Supabase provide implicit limits.

**Expected Behavior**: Explicit rate limit headers, transparent to users.

**Impact**: Unfair resource usage not prevented; DoS risk.

**Workaround**: Vercel Functions have built-in rate limits.

**Timeline**: Post-MVP  
**Effort**: Low (middleware)

---

### 15. Community Moderation Tools

**Issue**: No ability for users to flag low-quality workbooks (only admin reports).

**Current Behavior**: Only report button; no community voting on quality.

**Expected Behavior**: Helpful/not helpful votes, deprecation warnings for low-quality content.

**Impact**: Low-quality community content not self-moderated.

**Timeline**: Post-MVP  
**Effort**: Medium (voting system, ranking changes)

---

## Technical Debt

### 1. Admin Page Placeholder: Workbook Quality Management

**File**: `apps/web/src/app/(study)/study/admin/workbooks/page.tsx`

**Status**: Only placeholder ("준비 중") showing.

**Need**: Actual implementation to hide/report published workbooks.

**Timeline**: P14+ (future admin features)

---

### 2. Question Review UI Incomplete

**File**: `apps/web/src/app/(study)/study/admin/questions/page.tsx`

**Status**: Shows list, but no detailed review interface (no reason for rejection, no feedback to user).

**Need**: Full review form with comments, rejection reasons.

**Timeline**: P14+ (future)

---

### 3. No Audit Logging

**Status**: Admin actions (status changes, hiddens, etc.) not logged.

**Need**: Create `audit_logs` table, log all mutations.

**Timeline**: Before scale-up (high priority for ops)

---

### 4. Type Assertions in AI Generation

**File**: `apps/web/src/components/study/AiGenerationPreview.tsx`

**Status**: Uses `job as any` to work around type inference.

**Need**: Proper type casting or schema fix.

**Severity**: Low (works, but not type-safe)

---

### 5. Excel Export Normalization Heuristic

**File**: `apps/web/src/lib/study/draftValidation.ts`

**Status**: Attempts to normalize answers (1-6 → A-F, etc.) via heuristics.

**Need**: May fail on edge cases (e.g., if student wrote "Option B" instead of "B").

**Severity**: Low (fallback to raw value if heuristic fails)

---

### 6. No Realtime Comment Updates

**File**: All comment components

**Status**: Comments don't update in real-time across tabs/devices.

**Need**: Supabase real-time subscription in `CommentThread`.

**Timeline**: Post-MVP (nice-to-have)

---

## Data Schema Notes

### Missing Indexes (Performance)

Identified but low priority (table sizes still small):
- `study_comments(status)` — For filtering hidden/deleted comments
- `study_reports(reporter_id)` — For finding abusive users
- `study_questions(workbook_id, review_status)` — For QC dashboards

**Action**: Add before scaling to 100K+ records.

---

### Storage Path Transparency

**Issue**: Uploaded PDF files stored in Supabase Storage, but paths not visible to users/admins.

**Impact**: Cannot verify file integrity or debug storage issues easily.

**Timeline**: Non-blocking (admin access to Storage console available)

---

## Testing Gaps

### Unit Tests
- **Status**: No unit tests in current build.
- **Coverage**: Core logic untested (draftValidation, aiQualityChecks).
- **Timeline**: Post-MVP (TDD on new features)

### E2E Tests
- **Status**: Manual smoke testing only.
- **Coverage**: No automated test suite.
- **Timeline**: Post-MVP (Playwright tests)

### Load Testing
- **Status**: No load test conducted.
- **Estimate**: Should handle 100 concurrent users before issues.
- **Timeline**: Before scale-up marketing

---

## Deployment Notes

### Environment Variables Missing Documentation

**Issue**: `.env.local` required but no example provided.

**Fix**: Create `.env.example` with template.

**Effort**: 10 minutes

---

### Database Migration Safety

**Issue**: Manual `pnpm db:push` can be risky in production.

**Recommendation**: Use Supabase branching or migrate via versioned migrations (not Drizzle auto-push).

**Timeline**: Before production (update deployment docs)

---

## Resolved Issues (Completed P0-P14)

- ✅ P0-P5: No critical issues
- ✅ P6-P7: Gamification working, streaks functional
- ✅ P8-P13: AI generation, Excel export, QC checks all functional
- ✅ P14: Admin dashboard and moderation tools working

---

## Future Roadmap (P15+)

| Feature | Priority | Effort | Timeline |
|---------|----------|--------|----------|
| Mobile App (Expo) | High | Very High | Q3 2026 |
| User Messaging | Medium | High | Q2 2026 |
| Bulk Moderation | Medium | Medium | Q2 2026 |
| GDPR Data Export | High | Medium | Q2 2026 |
| Advanced Analytics | Medium | High | Q3 2026 |
| Community Moderation | Medium | Medium | Q3 2026 |

---

## Issue Tracking

**Current System**: This document (GitHub issues to follow)

**Next Step**: Migrate to GitHub Issues for better tracking and community visibility.

---

**Maintained by**: Development Team  
**Last Review**: 2026-04-25  
**Next Review**: 2026-07-25 (Q3)
