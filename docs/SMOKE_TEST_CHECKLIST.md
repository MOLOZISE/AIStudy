# AIStudy MVP - Smoke Test Checklist

**Last Updated**: 2026-04-26  
**Test Date**: [To be filled during testing]  
**Tester**: [To be filled during testing]

## Pre-Test Setup

- [ ] Fresh browser (private/incognito mode)
- [ ] `pnpm dev` running on http://localhost:3000
- [ ] PostgreSQL/Supabase is accessible
- [ ] Test user email: test@example.com (or test account created)
- [ ] Check `.env.local` has valid DATABASE_URL and SUPABASE keys

## Flow A: Auth & Onboarding (10 min)

### A1: Sign Up
- [ ] Navigate to `/signup`
- [ ] Page loads without errors
- [ ] Form has email, password fields
- [ ] Submit valid email: testuser+`<timestamp>`@example.com
- [ ] Password validation works (min length enforcement)
- [ ] Submission success → email verification message shown
- [ ] Check email for verification link (or check Supabase Auth dashboard)

### A2: Email Verification
- [ ] Click verification link in email
- [ ] Redirected to app authenticated
- [ ] localStorage has auth token
- [ ] Navigate to `/study` - profile page loads

### A3: Sign In (Existing User)
- [ ] Navigate to `/login`
- [ ] Enter email and password
- [ ] Submit button works
- [ ] Successful → redirected to `/study`
- [ ] Session persists after page reload

### A4: Session Persistence
- [ ] Reload `/study` page
- [ ] User still authenticated (no redirect to login)
- [ ] Clear localStorage → redirected to `/login`

**Result**: ☐ PASS / ☐ FAIL  
**Issues**: _______________

---

## Flow B: Workbook Management (15 min)

### B1: Create Workbook
- [ ] Navigate to `/study/library`
- [ ] Click "Create Workbook" or similar button
- [ ] Modal/form opens with title, description fields
- [ ] Submit with valid data → workbook created
- [ ] Redirected to `/study/workbooks/[id]/editor`
- [ ] Workbook appears in library list

### B2: Add Questions
- [ ] In editor view, add problem/question
- [ ] Fields for: topic, question text, image (optional)
- [ ] Add multiple choice options and correct answer
- [ ] Click "Add Question" → question added to list
- [ ] Can see question count increment

### B3: View Workbook Details
- [ ] Navigate to `/study/workbooks/[id]`
- [ ] Shows: title, description, creator, metadata
- [ ] Tabs visible: Concepts, Questions
- [ ] `/study/workbooks/[id]/concepts` - lists concepts with accuracy
- [ ] `/study/workbooks/[id]/questions` - lists all questions

### B4: Publish Workbook
- [ ] In workbook detail, find publish button
- [ ] Click publish → becomes public in discover
- [ ] Check `/study/discover` - new workbook appears
- [ ] Workbook has creator badge/name
- [ ] Badge earned notification appears (GROWTH-1)

**Result**: ☐ PASS / ☐ FAIL  
**Issues**: _______________

---

## Flow C: Practice & Attempts (12 min)

### C1: Start Practice
- [ ] Navigate to `/study/practice`
- [ ] Select workbook to practice
- [ ] Redirected to practice mode with first question
- [ ] Question renders with: text, image, options, timer

### C2: Answer Questions
- [ ] Click answer option (multiple choice)
- [ ] Immediate feedback: correct/incorrect
- [ ] Score updates in header
- [ ] If correct: XP awarded (check notification)
- [ ] Next button appears → move to next question
- [ ] Complete all questions

### C3: View Results
- [ ] After last question, results page shows
- [ ] Shows: score, accuracy %, time spent
- [ ] Break down by concept
- [ ] Options to: retry, review, back to library
- [ ] Attempt recorded in database

### C4: Practice Mode (Untimed)
- [ ] Navigate to `/study/practice`
- [ ] Select another workbook
- [ ] Complete all questions
- [ ] Results show without time pressure
- [ ] Can see mastery progress

**Result**: ☐ PASS / ☐ FAIL  
**Issues**: _______________

---

## Flow D: Exams & Assessments (12 min)

### D1: View Exams
- [ ] Navigate to `/study/exams`
- [ ] List of available exams shows
- [ ] Each exam shows: title, question count, duration

### D2: Start Exam
- [ ] Click "Start Exam"
- [ ] Timer begins (visible in header)
- [ ] Cannot go back to previous questions (or view only)
- [ ] Submit button at end

### D3: Submit Exam
- [ ] Answer all/most questions
- [ ] Click submit at end
- [ ] Results page shows score and breakdown
- [ ] Exam recorded with timestamp
- [ ] Cannot retake immediately (cooldown, if any)

### D4: Exam History
- [ ] Exams page shows past exam results
- [ ] Can click to view detailed results

**Result**: ☐ PASS / ☐ FAIL  
**Issues**: _______________

---

## Flow E: Wrong Notes & Mastery (10 min)

### E1: Mark Question as Incorrect
- [ ] During practice, mark question for wrong notes
- [ ] Question added to `/study/wrong-notes`

### E2: Review Wrong Notes
- [ ] Navigate to `/study/wrong-notes`
- [ ] Lists questions marked as wrong
- [ ] Shows: question, concept, last attempt date

### E3: Practice Wrong Notes
- [ ] Click "Practice Session" button
- [ ] Only wrong notes questions appear
- [ ] Complete practice session
- [ ] Mark as "Mastered" option appears after correct answer

### E4: Mark as Mastered
- [ ] Answer wrong note question correctly
- [ ] Click "Mark as Mastered"
- [ ] Question removed from wrong notes list
- [ ] Badge notification appears (if milestone reached) (GROWTH-1)
- [ ] User's mastery progress updates

**Result**: ☐ PASS / ☐ FAIL  
**Issues**: _______________

---

## Flow F: Gamification & Growth (GROWTH-1) (12 min)

### F1: View Growth Dashboard
- [ ] Navigate to `/study/growth`
- [ ] Shows: recent badges earned, next badges to unlock
- [ ] XP/points display in header or sidebar
- [ ] Recent badges section shows 6 most recent with dates

### F2: View Badge Collection
- [ ] Navigate to `/study/profile`
- [ ] Scroll to "Badge Collection" section
- [ ] Shows: earned badges (yellow background with date)
- [ ] Shows: locked badges (greyed out)
- [ ] Progress bars for badges with conditions

### F3: Earn Badges
- [ ] Complete actions: solve problems, master concepts
- [ ] After each qualifying action, check notifications
- [ ] Badge earned notifications appear (emoji + title)
- [ ] Navigate to `/study/growth` - new badge in recent list
- [ ] Badge appears in profile collection (yellow)

### F4: View Learning Analytics
- [ ] Navigate to `/study/stats`
- [ ] Shows: recent 7/30 day summary (attempts, accuracy)
- [ ] Wrong note mastery: pie-like visualization
- [ ] Problem type accuracy: bar chart by type
- [ ] Concept accuracy: top 10 concepts
- [ ] Weak concepts: lowest accuracy concepts (red warning)
- [ ] Charts render without errors

**Result**: ☐ PASS / ☐ FAIL  
**Issues**: _______________

---

## Flow G: Notifications (NOTIFY-1) (10 min)

### G1: Bell Icon & Count
- [ ] Header shows bell icon (🔔)
- [ ] Unread notifications show badge with count
- [ ] Clicking bell navigates to `/study/notifications`

### G2: Notifications List
- [ ] Page shows all notifications (paginated)
- [ ] Unread notifications have: blue background, blue dot indicator
- [ ] Read notifications have: white background, no dot
- [ ] Each notification shows: icon, title, message, time

### G3: Mark as Read
- [ ] Click unread notification
- [ ] Navigates to relevant page (based on type)
- [ ] Notification marked as read (background changes to white)
- [ ] Notification count in bell decreases

### G4: Filter & Clear
- [ ] Click "읽지 않음만" (unread only) button
- [ ] List filters to show only unread
- [ ] Click button again to show all
- [ ] Click "전체 읽음" (mark all read) button
- [ ] All notifications marked as read
- [ ] Bell icon count goes to 0

### G5: Notification Types
Test that notifications appear for:
- [ ] Comment reply (create comment → notification for mentioned user)
- [ ] Workbook review (review published workbook → creator gets notification)
- [ ] Workbook fork (fork published workbook → creator gets notification)
- [ ] Badge earned (earn badge → notification appears)
- [ ] Quest completed (complete quest → notification appears)
- [ ] AI job ready (AI generation completes → notification appears)

**Result**: ☐ PASS / ☐ FAIL  
**Issues**: _______________

---

## Flow H: Admin Operations (ADMIN-1) (15 min)

### H1: Access Admin Panel
- [ ] Login as admin user (user with admin role in DB)
- [ ] Navigate to `/study/admin`
- [ ] Admin panel loads
- [ ] Sidebar shows admin menu items
- [ ] Non-admin users cannot access (redirected with permission error)

### H2: AI Jobs Management
- [ ] Navigate to `/study/admin/ai-jobs`
- [ ] Shows: list of AI generation jobs (PDF imports, etc)
- [ ] Columns: ID, user, status, created date, actions
- [ ] Can click on job to view details
- [ ] Can retry failed jobs
- [ ] Can see job logs/output

### H3: Questions Management
- [ ] Navigate to `/study/admin/questions`
- [ ] Shows: list of all questions across workbooks
- [ ] Can filter by: topic, difficulty, status
- [ ] Can edit question details
- [ ] Can mark flagged questions as resolved
- [ ] Can delete question

### H4: Quests Management
- [ ] Navigate to `/study/admin/quests`
- [ ] Shows: list of active/inactive quests
- [ ] Can create new quest: name, description, rewards
- [ ] Can edit quest: adjust rewards, conditions
- [ ] Can deactivate quest

### H5: Reports Management
- [ ] Navigate to `/study/admin/reports`
- [ ] Shows: list of flagged/reported content
- [ ] Reports show: content type, reason, reporter, date
- [ ] Can view reported content
- [ ] Can mark as resolved: with action (delete/warn/ignore)
- [ ] Resolved reports move to archive

### H6: Workbooks Management
- [ ] Navigate to `/study/admin/workbooks`
- [ ] Shows: all public/private workbooks
- [ ] Can filter by: creator, visibility, rating
- [ ] Can edit workbook metadata
- [ ] Can feature/unfeature workbook
- [ ] Can delete workbook

**Result**: ☐ PASS / ☐ FAIL  
**Issues**: _______________

---

## Flow I: Discovery & Community (8 min)

### I1: Discover Workbooks
- [ ] Navigate to `/study/discover`
- [ ] Shows: public workbooks list (paginated)
- [ ] Can see: title, creator, rating, usage count
- [ ] Can filter by: topic, difficulty, rating

### I2: View Public Workbook
- [ ] Click on workbook in discover
- [ ] Navigated to `/study/discover/[publicationId]`
- [ ] Shows: full metadata, creator profile
- [ ] Shows: comments section
- [ ] Can view ratings/reviews

### I3: Fork Workbook
- [ ] On public workbook, find fork button
- [ ] Click fork → workbook copied to user's library
- [ ] Navigated to `/study/workbooks/[newId]/editor`
- [ ] Fork notification sent to original creator
- [ ] Original creator receives notification

### I4: Comment & Reviews
- [ ] On public workbook, find comments section
- [ ] Can add new comment (with text)
- [ ] Can see other comments
- [ ] Can reply to comments (2-level nesting)
- [ ] Comment notifications sent to workbook creator

### I5: Rankings & Stats
- [ ] Navigate to `/study/rankings`
- [ ] Shows: top users by XP, badges, problems solved
- [ ] Can filter by: time period (weekly, monthly, all-time)

### I6: Search
- [ ] Navigate to `/study/search`
- [ ] Can search by: keyword, topic, creator
- [ ] Results show matching workbooks/questions
- [ ] Can filter results

**Result**: ☐ PASS / ☐ FAIL  
**Issues**: _______________

---

## Flow J: AI Generation (Placeholder for P13+) (8 min)

### J1: Navigate to AI Generate
- [ ] Click "🤖 AI" in navigation or `/study/generate`
- [ ] Page loads with options/interface
- [ ] UI shows: upload PDF option, text input, or template selector

### J2: Placeholder Behavior
- [ ] Currently shows MVP/development state
- [ ] Buttons/inputs are disabled or show "Coming Soon"
- [ ] No errors when viewing page

**Result**: ☐ PASS / ☐ FAIL  
**Issues**: _______________

---

## Cross-Cutting Concerns

### K1: Performance
- [ ] Page load time < 3s (first meaningful paint)
- [ ] Navigation between pages is smooth
- [ ] Lists paginate properly (no 1000+ items loading)
- [ ] Images lazy-load without layout shift
- [ ] No console errors (dev tools)

### K2: Error Handling
- [ ] Network error → shows user-friendly message
- [ ] Malformed URL → 404 page renders
- [ ] Unauthorized access → redirects to login
- [ ] Permission denied → shows error message (not 500)

### K3: Responsive Design
- [ ] Mobile (375px): layout stacks, readable
- [ ] Tablet (768px): grid adjusts, usable
- [ ] Desktop (1440px): full width, optimal
- [ ] Images scale without stretching
- [ ] Touch targets are 44x44px minimum

### K4: Accessibility
- [ ] Can tab through interactive elements
- [ ] Form labels associated with inputs
- [ ] Error messages clear and linked to fields
- [ ] Icon buttons have title/aria-label
- [ ] Color contrast meets AA standard

### K5: Security
- [ ] Auth tokens not exposed in localStorage (as plain text check)
- [ ] API calls include Authorization header
- [ ] CSRF tokens present in forms (if applicable)
- [ ] No XSS vulnerabilities (inspect sanitization)
- [ ] Admin routes require role verification

**Result**: ☐ PASS / ☐ FAIL  
**Issues**: _______________

---

## Summary

**Total Test Flows**: 10 (A–J) + Cross-cutting (K)  
**Estimated Time**: ~2 hours

**Pass Criteria**: 
- All flows marked as PASS
- No critical issues blocking deployment
- Performance within acceptable limits
- No security vulnerabilities found

**Sign-Off**:

Tester: _______________  
Date: _______________  
Approved for Deployment: ☐ YES / ☐ NO

---

## Notes Section

Use this space to record any observations, edge cases, or improvements discovered during testing:

_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________
