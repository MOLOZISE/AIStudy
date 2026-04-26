# Task ADMIN-1: Complete Admin Operations MVP

**Priority**: HIGH 🟠  
**Duration**: 8-10 hours  
**Risk**: Medium (admin operations, needs thorough testing)  
**Related**: AUDIT-1 findings

## Goal

Elevate admin operations from 80% ("skeleton with core list pages") to **fully operational MVP** with:
1. Proper client-side auth/role checking
2. Quick action buttons (hide comment, hide publication)
3. Report detail pages
4. Better error handling and feedback

## Current State

**What works**:
- `/study/admin` dashboard with overview cards ✅
- `/study/admin/reports` list with filters ✅
- `/study/admin/quests` list with toggle ✅
- `/study/admin/ai-jobs` list with error details ✅
- `/study/admin/questions` list with QC status ✅
- All tRPC procedures have server-side `requireAdmin` ✅

**What's missing**:
- Client-side role check → Non-admin users see tRPC errors instead of graceful redirect
- Report detail page → Must navigate to DB to see full comment/question
- Quick action buttons on report rows → "Hide comment" / "Hide publication" requires modal
- Admin workbooks page → Only placeholder ("준비 중")
- Audit logging → No tracking of who did what

## Required Features

### 1. Client-Side Auth/Role Checking

**File**: `apps/web/src/app/(study)/study/admin/page.tsx` and all `/study/admin/*` pages

**Implement**: Redirect non-admin users gracefully

**Option A: Component-level (Client)**:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  // Quick check: If getAdminOverview fails, redirect
  const overview = trpc.admin.getAdminOverview.useQuery(
    {},
    {
      onError: () => {
        router.push('/study');  // Redirect on error
        setIsAuthorized(false);
      },
      onSuccess: () => setIsAuthorized(true),
    }
  );
  
  // Show loading while checking
  if (isAuthorized === null) {
    return <div className="p-6 text-center">검증 중...</div>;
  }
  
  // Show denied if non-admin
  if (!isAuthorized) {
    return <div className="p-6 text-center text-red-700">접근 권한이 없습니다.</div>;
  }
  
  return (
    // Normal admin page content
  );
}
```

**Option B: Middleware (Preferred, but requires next.config.js change)**:
Add middleware to check role before rendering `/study/admin/*` pages.

**Recommendation**: Use Option A for MVP (client-side, no middleware setup).

**Apply to ALL admin pages**:
- `/study/admin/page.tsx`
- `/study/admin/reports/page.tsx`
- `/study/admin/quests/page.tsx`
- `/study/admin/ai-jobs/page.tsx`
- `/study/admin/questions/page.tsx`
- `/study/admin/workbooks/page.tsx`

### 2. Report Detail Page

**File**: Create `apps/web/src/app/(study)/study/admin/reports/[reportId]/page.tsx`

**Implement**:
```typescript
'use client';

import { StudyShell } from '@/components/study/StudyShell';
import { trpc } from '@/lib/trpc';

export default function ReportDetailPage({ params }: { params: { reportId: string } }) {
  const report = trpc.admin.getReportDetail.useQuery({ reportId: params.reportId });
  const updateStatus = trpc.admin.updateReportStatus.useMutation();
  
  // Show:
  // - Report type (comment/question/publication)
  // - Report reason
  // - Report detail
  // - Reporter name (not email)
  // - Created date
  // - Current status
  // - Actual content being reported (if safe to show)
  //   - If comment: Show comment text
  //   - If question: Show question prompt
  //   - If publication: Show publication title
  // - Quick action buttons:
  //   - If comment: "Hide comment" button → calls hideComment
  //   - If publication: "Hide publication" button → calls hidePublication
  //   - Status change dropdown: open → reviewing → resolved → rejected
}
```

**Show Report Content by Type**:
```typescript
switch (report.targetType) {
  case 'comment':
    // Fetch and display comment text
    return <CommentPreview commentId={report.targetId} />;
  case 'question':
    // Fetch and display question prompt
    return <QuestionPreview questionId={report.targetId} />;
  case 'publication':
    // Fetch and display publication title
    return <PublicationPreview publicationId={report.targetId} />;
  default:
    return <div>Unknown report type</div>;
}
```

### 3. Quick Action Buttons on Reports List

**File**: `apps/web/src/app/(study)/study/admin/reports/page.tsx`

**Add to each report row**:
```typescript
<td className="px-4 py-3">
  <div className="flex gap-2">
    {/* View detail */}
    <Link
      href={`/study/admin/reports/${report.id}`}
      className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
    >
      보기
    </Link>
    
    {/* Quick hide for comments */}
    {report.targetType === 'comment' && (
      <button
        onClick={() => handleHideComment(report.targetId)}
        className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
      >
        숨김
      </button>
    )}
    
    {/* Quick hide for publications */}
    {report.targetType === 'publication' && (
      <button
        onClick={() => handleHidePublication(report.targetId)}
        className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
      >
        숨김
      </button>
    )}
  </div>
</td>
```

**Implement handlers**:
```typescript
const hideComment = trpc.admin.hideComment.useMutation();
const hidePublication = trpc.admin.hidePublication.useMutation();

async function handleHideComment(commentId: string) {
  if (!confirm('이 댓글을 숨기시겠습니까?')) return;
  
  try {
    await hideComment.mutateAsync({ commentId });
    // Also update report status
    await updateStatus.mutateAsync({
      reportId: report.id,
      status: 'resolved',
    });
    toast.success('댓글이 숨겨졌습니다.');
    reports.refetch();
  } catch (error) {
    toast.error('오류가 발생했습니다.');
  }
}
```

### 4. Admin Workbooks Page (Minimal MVP)

**File**: `apps/web/src/app/(study)/study/admin/workbooks/page.tsx`

**Replace placeholder** ("준비 중") with:

**Option A: List reported workbooks**:
```typescript
export default function AdminWorkbooksPage() {
  const publications = trpc.study.listPublicWorkbooksForAdmin.useQuery({
    status: 'reported',  // Only show reported ones
  });
  
  return (
    <StudyShell title="문제집 관리">
      <div className="space-y-4">
        {/* Filters */}
        <select>
          <option value="reported">신고된 문제집</option>
          <option value="published">공개된 문제집</option>
          <option value="all">전체</option>
        </select>
        
        {/* List */}
        {publications.data?.map(pub => (
          <div key={pub.id} className="border rounded p-4">
            <h3>{pub.title}</h3>
            <p className="text-sm text-slate-600">{pub.description}</p>
            <div className="mt-2 flex gap-2">
              <Link href={`/study/discover/${pub.id}`}>보기</Link>
              <button>숨김</button>
            </div>
          </div>
        ))}
      </div>
    </StudyShell>
  );
}
```

**Option B: Deferred (keep placeholder)**:
- Placeholder acceptable per AUDIT-1
- Can implement in next sprint as ADMIN-2

**Recommendation**: Use Option A for completeness (adds ~1 hour).

### 5. Toast/Feedback for User Actions

**Implementation**: Use existing toast library (if available) or simple message:
```typescript
const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

// Show on action
setMessage({ type: 'success', text: '상태가 업데이트되었습니다.' });

// Clear after 3 seconds
setTimeout(() => setMessage(null), 3000);
```

### 6. Error Boundary for Admin Pages

**Create**: `apps/web/src/components/study/AdminErrorBoundary.tsx`

```typescript
'use client';

import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function AdminErrorBoundary({ children }: Props) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 text-center">
          <p className="text-red-700 font-semibold">오류가 발생했습니다.</p>
          <p className="text-sm text-slate-600">관리자 권한을 확인해주세요.</p>
          <a href="/study" className="text-blue-600 text-sm">대시보드로 돌아가기</a>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
```

Wrap admin page content in this boundary.

## Implementation Checklist

- [ ] **Auth UX**: Add role check + redirect to `/study` on all 6 admin pages
- [ ] **Report Detail**: Create report detail page showing content + quick actions
- [ ] **Quick Hide**: Add hide comment/publication buttons to reports list
- [ ] **Workbooks**: Implement reported workbooks list (or keep placeholder)
- [ ] **Feedback**: Add toast/message feedback for all actions
- [ ] **Error Handling**: Test non-admin access → should redirect, not error
- [ ] **Test All Flows**:
  - Admin user can view reports, change status, hide comments
  - Non-admin user redirected from `/study/admin`
  - Report detail shows correct content by type
  - Quests can be toggled active/inactive
  - AI jobs show error details
  - Questions can be filtered by QC status

## New Procedures (If Needed)

Check if these need to be added to `packages/api/src/routers/admin/router.ts`:

**Already exist** ✅:
- `hideComment`
- `hidePublication`
- `updateReportStatus`

**May need**:
- `getReportDetail` (seems to exist, verify returns full content)
- `listPublicWorkbooksForAdmin` (check if exists, may need create)

Verify before implementing UI.

## Files to Create/Modify

| File | Action | Effort |
|------|--------|--------|
| `/study/admin/page.tsx` | Add auth check | 30 min |
| `/study/admin/reports/page.tsx` | Add quick actions, link to detail | 1 hour |
| `/study/admin/reports/[reportId]/page.tsx` | Create detail page | 1.5 hours |
| `/study/admin/quests/page.tsx` | Add auth check | 15 min |
| `/study/admin/ai-jobs/page.tsx` | Add auth check | 15 min |
| `/study/admin/questions/page.tsx` | Add auth check | 15 min |
| `/study/admin/workbooks/page.tsx` | Implement or keep placeholder | 0-1 hour |
| AdminErrorBoundary.tsx | Create | 30 min |
| **Total** | | 4-6 hours |

**Actual time with testing**: 8-10 hours

## Validation

```bash
pnpm lint       # Should pass
pnpm type-check # Should pass
pnpm build      # Should pass
```

## Testing Checklist

| Test | Steps | Expected |
|------|-------|----------|
| Admin user access | Login as admin → `/study/admin` | See dashboard |
| Non-admin redirect | Login as regular user → `/study/admin` | Redirect to `/study` |
| Report detail | Click "보기" on report row | See full report + content |
| Hide comment | Click "숨김" on comment report | Comment status → hidden, report status → resolved |
| Hide publication | Click "숨김" on publication report | Publication status → hidden, report status → resolved |
| Report status change | Dropdown status → "resolved" | Status updates, list refreshes |
| Quest toggle | Click "활성화"/"비활성화" | Quest active status toggles |
| AI job error | Click job row | Error details display |

## Non-Requirements

- Do NOT implement audit logging (defer to ADMIN-2)
- Do NOT change database schema
- Do NOT add new tRPC procedures (reuse existing ones)
- Do NOT add new UI components beyond simple buttons/links

## Sign-Off Criteria

- [ ] Non-admin users cannot access admin pages (redirect to `/study`)
- [ ] Admin users can view reports, change status, hide comments/publications
- [ ] Report detail page shows correct content by type
- [ ] All quick action buttons work
- [ ] No console errors on admin pages
- [ ] Admin quests/jobs/questions pages still work
- [ ] lint/type-check/build pass
- [ ] QA sign-off on smoke test flows

---

**Next Step**: After ADMIN-1 passes, proceed to GROWTH-1 (badges + analytics).

**Related**: GROWTH-1 may reference admin operations, coordinate timing.
