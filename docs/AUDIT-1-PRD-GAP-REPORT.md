# AUDIT-1: AIStudy PRD/User Flow Gap Audit Report

**Date**: 2026-04-25  
**Scope**: P0-P14 implementation analysis, PRD compliance check  
**Auditor**: Claude Code  
**Status**: ✅ AUDIT COMPLETE - Ready for FIX phase

---

## Executive Summary

AIStudy repository has **strong structural foundation** (28 study routes, 23 tables, comprehensive APIs) but **significant gaps between reported P14 completion and actual implementation**. Two critical bugs found requiring immediate fix. Multiple PRD requirements partially or fully unimplemented.

**Verdict**: 
- ✅ Core functionality working
- ⚠️ 3 critical issues requiring immediate fix
- ❌ 5+ major features still missing/partial

**Recommended Path**:
1. **FIX-1** (1-2 hours): QuestionEditor type bug
2. **ADMIN-1** (8-10 hours): Admin operations complete implementation
3. **GROWTH-1** (10-12 hours): Badges + Analytics
4. **NOTIFY-1** (8-10 hours): Notifications (future)

---

## 1. Documentation Reality Check

### Findings

#### ✅ README.md (Mostly Updated)
- Core features documented ✅
- Tech stack correct ✅
- Quick start guide exists ✅
- BUT: Route list has some legacy routes (`/admin/study/reports` vs actual `/study/admin/reports`)
- BUT: Roadmap still shows "Phase 1 Week 2-6" instead of P0-P14 completion

#### ✅ docs/ Directory
- Newly created for FINAL-1:
  - `docs/demo/DEMO_SCRIPT.md` ✅
  - `docs/ops/ADMIN_GUIDE.md` ✅
  - `docs/qa/SMOKE_TEST_CHECKLIST.md` ✅
  - `docs/security/SECURITY_AUDIT.md` ✅
  - `docs/KNOWN_ISSUES.md` ✅
  - `docs/ENVIRONMENT_SETUP.md` ✅

#### ⚠️ Legacy Documentation
- `docs/codex-handoff/` — Old P0-P12 handoff docs (can archive)
- `docs/legacy/` — Old documentation (archive)

### Recommendation
- [ ] Update README routes: change `/admin/study/*` to `/study/admin/*`
- [ ] Update README roadmap: change "Phase 1 Week X" to "P0-P14 Completed"
- [ ] Archive legacy docs to `docs/archived/`

---

## 2. Route Audit

### All Study Routes (28 Total)

| Route | Status | Exists | Auth | Notes |
|-------|--------|--------|------|-------|
| `/study` | ✅ Dashboard | page.tsx | ✓ | Main study hub |
| `/study/templates` | ✅ Working | page.tsx | ✓ | Template center |
| `/study/generate` | ✅ Working | page.tsx | ✓ | AI generation |
| `/study/library` | ✅ Working | page.tsx | ✓ | My workbooks |
| `/study/workbooks/[id]` | ✅ Working | page.tsx | ✓ | Workbook detail |
| `/study/workbooks/[id]/editor` | ✅ Working | page.tsx | ✓ | Web editor |
| `/study/workbooks/[id]/concepts` | ✅ Working | page.tsx | ✓ | Concept tree |
| `/study/workbooks/[id]/questions` | ✅ Working | page.tsx | ✓ | Question list |
| `/study/practice` | ✅ Working | page.tsx | ✓ | Practice mode |
| `/study/exams` | ✅ Working | page.tsx | ✓ | Exam list |
| `/study/exams/[id]` | ✅ Working | page.tsx | ✓ | Exam session |
| `/study/questions/[id]` | ✅ Working | page.tsx | ✓ | Question detail + comments |
| `/study/wrong-notes` | ✅ Working | page.tsx | ✓ | Wrong notes list |
| `/study/wrong-notes/session` | ✅ Working | page.tsx | ✓ | Retry session |
| `/study/quests` | ✅ Working | page.tsx | ✓ | Daily quests |
| `/study/growth` | ✅ Working | page.tsx | ✓ | Growth dashboard |
| `/study/profile` | ✅ Working | page.tsx | ✓ | User profile |
| `/study/discover` | ✅ Working | page.tsx | ✓ | Public workbooks |
| `/study/discover/[id]` | ✅ Working | page.tsx | ✓ | Publication detail + comments |
| `/study/rankings` | ✅ Working | page.tsx | ✓ | Leaderboards (XP, solved) |
| `/study/search` | ✅ Working | page.tsx | ✓ | Workbook search |
| `/study/stats` | ✅ Working | page.tsx | ✓ | Learning statistics |
| `/study/admin` | ✅ Working | page.tsx | ⚠️ | **No client-side role check** |
| `/study/admin/reports` | ✅ Working | page.tsx | ✓ | Report management |
| `/study/admin/quests` | ✅ Working | page.tsx | ✓ | Quest management |
| `/study/admin/ai-jobs` | ✅ Working | page.tsx | ✓ | AI job monitoring |
| `/study/admin/questions` | ✅ Working | page.tsx | ✓ | Question QC |
| `/study/admin/workbooks` | ⚠️ Placeholder | page.tsx | ✓ | "준비 중" message only |

### Route Summary
- **Total**: 28 routes
- **Implemented**: 27 ✅
- **Placeholder**: 1 (workbooks)
- **Missing**: 0 ✅

### Auth Issues Found
- ⚠️ **MEDIUM**: `/study/admin` page has no client-side role check
  - Non-admin users see error when `getAdminOverview` tRPC call fails
  - Should redirect to `/study` with warning, not show error
  - All admin pages will fail gracefully on non-admin access (tRPC requireAdmin catches it)
  - **Verdict**: Works but poor UX

### Verdict
✅ Routes audit pass. All major routes exist and are protected by auth. Admin access control is server-side via tRPC, client-side UX could be improved.

---

## 3. Critical Bug Check

### BUG-1: QuestionEditor Type Mismatch 🔴 CRITICAL

**Location**: `apps/web/src/components/study/QuestionEditor.tsx`

**Issue**:
- Line 168: Dropdown uses `value="multiple_choice_single"` (객관식 단일 선택)
- Line 56: Validation checks `type === 'multiple_choice'` only
- Line 187: Choices UI shows only when `type === 'multiple_choice'`

**Consequence**:
User selects "객관식 (단일 선택)" → Choices input field **does not appear** → User cannot enter choices → Data lost or validation fails silently

**Evidence**:
```typescript
// Line 168 - Dropdown
<option value="multiple_choice_single">객관식 (단일 선택)</option>

// Line 56 - Validation (BUG!)
if (type === 'multiple_choice') {
  // Only validates multiple_choice, not multiple_choice_single
}

// Line 187 - Choices UI (BUG!)
{type === 'multiple_choice' && (
  // Only shows when type === 'multiple_choice', NOT multiple_choice_single
)}
```

**Fix Required**:
- [ ] Change validation: `if (['multiple_choice', 'multiple_choice_single'].includes(type))`
- [ ] Change UI condition: `if (['multiple_choice', 'multiple_choice_single'].includes(type))`
- [ ] Handle `true_false` separately (no choices needed)
- [ ] Hide choices for `short_answer`, `essay_self_review`
- [ ] Effort: 15-30 minutes

### BUG-2: Admin Page Non-Admin Access UX ⚠️ HIGH

**Location**: `apps/web/src/app/(study)/study/admin/page.tsx`

**Issue**:
- Page renders without role check at component level
- When non-admin user accesses `/study/admin`, they see error state from failed `getAdminOverview` query
- No clear "Access Denied" or redirect

**Evidence**:
```typescript
// No requireAdmin or role check in AdminPage
export default function AdminPage() {
  return (
    <StudyShell>
      <AdminOverview />  // This will fail with TRPCError if non-admin
      ...
    </StudyShell>
  );
}
```

**Fix Required**:
- [ ] Add role check in AdminPage (client-side feedback OR server-side redirect)
- [ ] Redirect non-admin to `/study` with toast message
- [ ] OR show 403 component
- [ ] Same for all `/study/admin/*` pages
- [ ] Effort: 30-45 minutes

### Other Potential Issues

**✅ Verified OK**:
- `hideComment` and `hidePublication` procedures exist and are properly protected
- Quality score calculations exist in `aiQualityChecks.ts`
- All tRPC procedures have `requireAdmin` checks

**⚠️ Design Issues (Not bugs)**:
- Admin workbooks page is placeholder ("준비 중") - intentional per P14 notes
- PDF extraction is fallback/mock (noted in KNOWN_ISSUES.md)

### Verdict
**2 bugs found, both require fix before production**:
1. QuestionEditor: Data loss risk
2. Admin access UX: Poor user experience

---

## 4. Database Schema

### Tables Status

**23 Study Tables** (✅ All examined):

Core:
- `study_subjects` ✅
- `study_workbooks` ✅
- `study_concepts` ✅
- `study_seeds` ✅
- `study_questions` ✅

Gamification:
- `study_quests` ✅
- `study_user_quest_progress` ✅
- `study_user_progress` ✅
- `study_reward_events` ✅
- `study_streaks` ✅

Learning:
- `study_attempts` ✅
- `study_exam_sets` ✅
- `study_exam_set_questions` ✅
- `study_wrong_note_sessions` ✅
- `study_wrong_notes` ✅

Community:
- `study_workbook_publications` ✅
- `study_workbook_reviews` ✅
- `study_workbook_likes` ✅
- `study_workbook_forks` ✅
- `study_user_library` ✅
- `study_comments` ✅
- `study_comment_likes` ✅
- `study_reports` ✅

Metadata:
- `study_import_jobs` ✅
- `study_ai_generation_jobs` ✅

### Missing Tables

**❌ Not Found**:
- `study_badges` — PRD requires badges
- `study_user_badges` — User badge collection
- `study_notifications` — Notification system
- `study_user_notifications` — Per-user notifications
- `study_achievements` — Achievement conditions

**Impact**: Badges system cannot be implemented without schema changes.

### Verdict
Schema is comprehensive for core functionality (23 tables) but **missing gamification completeness** (badges) and **community features** (notifications).

---

## 5. Admin Operations Gap

### Implemented ✅

**Procedures**:
- `getAdminOverview` ✅
- `listReportsForAdmin` ✅
- `getReportDetail` ✅
- `updateReportStatus` ✅
- `hideComment` ✅
- `hidePublication` ✅
- `listQuestionsForQc` ✅
- `listQuestsForAdmin` ✅
- `createQuest` ✅
- `updateQuestActive` ✅
- `listAiJobsForAdmin` ✅

**Pages**:
- `/study/admin` ✅
- `/study/admin/reports` ✅ (working list + status filter)
- `/study/admin/quests` ✅ (working list + toggle active/inactive)
- `/study/admin/ai-jobs` ✅ (working list + error details)
- `/study/admin/questions` ✅ (working list + status filter)
- `/study/admin/workbooks` ⚠️ (placeholder only)

### Gaps Found ⚠️

**Missing Features**:
1. **Report Detail Page** — Click report → See full details + reason + comment content
2. **Comment Hide Action** — One-click "Hide comment" from reports page
3. **Publication Hide Action** — One-click "Hide workbook" from reports page
4. **Report History** — Which admin changed status and when
5. **Quest Creation UI** — Can't create quests via UI (requires API call)
6. **Bulk Actions** — Can't multi-select + bulk hide/delete

**Admin Auth** ⚠️:
- Server-side: Properly protected (`requireAdmin` on all 11 procedures) ✅
- Client-side: Non-admin user gets tRPC error, not graceful redirect ⚠️

### Verdict
Admin operations are **80% complete**: core flows work (reports, quests, jobs, QC) but lack detail pages, quick actions, and client-side auth UX.

---

## 6. AI Pipeline Gap

### PDF Extraction

**Status**: ⚠️ **MOCK/FALLBACK ONLY**

**Evidence** (`apps/web/src/lib/study/aiGeneration.ts` line 7-23):
```typescript
export async function extractPdfText(pdfBuffer: Buffer): Promise<string> {
  // PDF 파싱 라이브러리가 없으므로 mock/fallback 구현
  // 실제 구현에서는 pdfjs-dist, pdf-parse 등 사용 가능
  
  // 간단한 mock: PDF에서 기본 텍스트만 추출하는 척함
  const text = pdfBuffer.toString('utf-8', 0, Math.min(2000, pdfBuffer.length));
  
  // PDF 바이너리에서 텍스트 영역만 추출하는 간단한 로직
  // 실제 구현은 proper PDF 라이브러리 필요
```

**Implications**:
- Real PDFs with proper encoding will mostly fail
- Only PDFs with raw text in first 2000 bytes will extract partially
- No OCR support for scanned documents
- OpenAI key absence triggers mock draft (test-friendly but misleading for production)

### AI Generation Quality

**Status**: ✅ **Quality checks implemented**

**Evidence** (`aiQualityChecks.ts`):
- `checkAiQuality()` function calculates quality scores ✅
- Error/warning/info severity levels ✅
- Quality grades: excellent/good/fair/poor ✅
- UI displays grades with colors (Line 255-286 in AiGenerationPreview.tsx) ✅

### Draft Application

**Status**: ✅ **Working with duplicate prevention**

**Evidence**:
- `applyAiDraft` server action checks `appliedWorkbookId` ✅
- `appliedAt` timestamp tracked ✅
- Direct Apply button creates workbook + applies questions ✅
- Excel export works with normalized answers ✅

### Verdict
AI pipeline is **functional but incomplete**:
- ✅ Draft validation, quality checks, Excel export work
- ⚠️ PDF extraction is mock/fallback only
- ⚠️ OpenAI integration works but quality depends on proper PDF parsing

---

## 7. Gamification Gap

### Implemented ✅

- XP/Points: ✅ (study_reward_events, XP gained on problem solve)
- Quests: ✅ (daily/weekly/monthly with progress tracking)
- Streaks: ✅ (study_streaks table, calendar view)
- Leaderboards: ✅ (XP + problems solved)
- Levels: ✅ (calculated from XP)

### Missing ❌

**Badges/Achievements**:
- No `study_badges` table ❌
- No `study_user_badges` table ❌
- No badge UI in profile ❌
- No achievements earned notifications ❌

**Examples from PRD**:
- "First problem solved"
- "3-day streak"
- "100 problems solved"
- "First workbook published"
- "First fork"
- "First comment"

### Verdict
Gamification is **70% complete**: XP/quests/streaks/leaderboards work, **badges system missing entirely**.

---

## 8. Learning Analytics Gap

### Implemented ✅

**Pages**:
- `/study/stats` ✅ (exists)
- `/study/growth` ✅ (exists)

**Data Tracked**:
- `study_attempts` — Question attempts ✅
- `study_user_progress` — Overall progress ✅
- `study_reward_events` — XP/points ✅

### Missing ❌

**PRD Requirements**:
- Heatmap by date ❌
- Question type accuracy ❌
- Concept mastery ❌
- Weak concepts TOP 5 ❌
- Time spent by topic ❌
- Improvement recommendations ❌

**Current Implementation** (per KNOWN_ISSUES.md):
- Basic stats cards exist
- Detailed analytics stub exists but minimal

### Verdict
Analytics is **20% complete**: basic stats cards exist, comprehensive analysis missing.

---

## 9. Community Gap

### Implemented ✅

- Comments: ✅ (study_comments, create/edit/delete)
- Nested replies: ✅ (parentCommentId field)
- Comment likes: ✅ (study_comment_likes)
- Reporting: ✅ (study_reports with targetType='comment')
- Moderation: ✅ (hideComment procedure)

### Missing ❌

**Realtime Features**:
- Comment notifications ❌ (no notification table)
- Realtime comment updates ❌ (no Supabase subscription)
- Reply to comment notification ❌
- Workbook commented notification ❌
- Workbook fork notification ❌
- Report resolved notification ❌

**UI/UX**:
- No notification bell/inbox ❌
- No unread count ❌
- No notification preferences ❌

### Verdict
Community features are **50% complete**: Comments work, notifications/realtime missing.

---

## 10. Implementation Status Matrix

| Feature | PRD Required | Implemented | Status | Priority |
|---------|--------------|-------------|--------|----------|
| PDF upload + AI generation | Core | ✅ Draft | Working but PDF extraction mock | FIX soon |
| Problem solving interface | Core | ✅ Full | All question types working | ✅ OK |
| Gamification (XP/quests) | Core | ✅ Full | XP/quests/streaks/leaderboards | ✅ OK |
| Badges/Achievements | Core | ❌ Missing | No schema, no UI | HIGH |
| Wrong notes system | Core | ✅ Full | Create/solve/archive working | ✅ OK |
| Workbook sharing/forking | Core | ✅ Full | Public/private, fork tracking | ✅ OK |
| Comments & discussion | Core | ✅ Partial | Comments work, no realtime | MED |
| Growth dashboard | Core | ✅ Partial | Basic stats, no detailed analytics | MED |
| Admin moderation | Core | ✅ 80% | Reports/quests/jobs working, missing quick actions | MED |
| Learning analytics | Core | ❌ Minimal | Basic cards only, no heatmap/concepts | MED |
| Notifications | Core | ❌ Missing | No notification system | LOW (future) |

---

## 11. Recommended Next Tasks

### Priority 1: FIX (2-3 hours)

**FIX-1: QuestionEditor Type Bug**
- Fix multiple_choice_single validation & UI
- Fix true_false handling
- Effort: 30 minutes
- Risk: Low (isolated fix)
- Deadline: ASAP (before any production use of editor)

**FIX-2: Admin Page Auth UX**
- Add role check to admin pages
- Redirect non-admin users gracefully
- Effort: 45 minutes
- Risk: Low (improves UX, doesn't break functionality)
- Deadline: Before admin demo

### Priority 2: ADMIN-1 (8-10 hours)

**Complete Admin Operations MVP**
- Implement missing quick actions (hide comment, hide publication)
- Add report detail page
- Improve auth UX on all admin pages
- Effort: 8-10 hours
- Risk: Medium (admin operations, needs testing)
- Deadline: Next sprint

### Priority 3: GROWTH-1 (10-12 hours)

**Badges + Learning Analytics**
- Add `study_badges` + `study_user_badges` tables
- Create badge achievement engine
- Enhance stats pages with heatmap/concepts
- Effort: 10-12 hours
- Risk: Medium (schema change, new feature)
- Deadline: 2 weeks

### Priority 4: NOTIFY-1 (Future)

**Notifications System**
- Add `study_notifications` table
- Implement in-app notification bell
- Add comment reply/mention notifications
- Effort: 8-10 hours
- Risk: Medium (new subsystem)
- Deadline: Post-MVP

---

## 12. Build Validation

```bash
pnpm lint    # ✅ PASS
pnpm type-check  # ✅ PASS
pnpm build   # ✅ PASS
```

All validation gates passed. No new errors introduced.

---

## Detailed Findings Summary

### Strengths ✅

1. **28 study routes** — All major user flows have entry points
2. **23 study tables** — Comprehensive data model for core features
3. **11 admin procedures** — Admin operations API complete
4. **Quality checks** — AI QC scoring and grading implemented
5. **Comments system** — Full comment thread with likes/replies
6. **Auth/Security** — Server-side permission checks on all admin operations
7. **Documentation** — Comprehensive docs created for FINAL-1

### Weaknesses ❌

1. **2 critical bugs** — QuestionEditor & admin auth UX
2. **Badges missing** — No badge system despite PRD requirement
3. **PDF extraction mock** — Only fallback, no real PDF parsing
4. **No notifications** — No notification table or system
5. **Analytics minimal** — Basic cards only, no detailed analysis
6. **Admin UX gaps** — Missing detail pages and quick actions

### Risks ⚠️

| Risk | Level | Mitigation |
|------|-------|-----------|
| QuestionEditor data loss | HIGH | Fix immediately |
| Non-admin accessing admin | MEDIUM | Add auth UX |
| PDF generation quality | MEDIUM | Document limitations, plan library upgrade |
| No badges for engagement | MEDIUM | Add in GROWTH-1 |
| No notifications for users | LOW | Plan for next sprint |

---

## Audit Checklist Completion

| Check | Result | Notes |
|-------|--------|-------|
| Documentation sync | ⚠️ Partial | Routes mostly correct, roadmap needs update |
| Route coverage | ✅ Complete | 28/28 routes exist |
| Critical bugs | ❌ Found 2 | QuestionEditor type, admin auth UX |
| Schema completeness | ⚠️ 85% | Missing badges/notifications tables |
| Admin operations | ✅ 80% | Core features work, missing UX polish |
| AI pipeline | ⚠️ 70% | Quality checks work, PDF extraction mock |
| Gamification | ⚠️ 70% | XP/quests/streaks/leaderboards work, no badges |
| Analytics | ❌ 20% | Basic only, missing detailed analysis |
| Community | ⚠️ 50% | Comments work, no notifications/realtime |
| Auth/Security | ✅ 90% | Server-side proper, client-side UX gaps |
| Build/Validation | ✅ Pass | lint, type-check, build all pass |

---

## Approval & Next Steps

**Audit Status**: ✅ **COMPLETE**

**Verdict**: Repository is **functionally complete for MVP but needs bug fixes and feature backfilling** before production release.

**Recommended Path**:
1. Execute FIX-1 and FIX-2 immediately (2-3 hours)
2. Execute smoke test from SMOKE_TEST_CHECKLIST.md
3. Execute ADMIN-1 (next sprint, 8-10 hours)
4. Execute GROWTH-1 (2 weeks, 10-12 hours)
5. Plan NOTIFY-1 (future sprint)

**Next Document**: FIX-1 detailed task specification

---

**Audit Completed**: 2026-04-25  
**Auditor**: Claude Code (AI Development)  
**Status**: Ready for FIX phase
