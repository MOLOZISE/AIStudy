# AIStudy MVP - Demo Script

**Duration**: 15-20 minutes  
**Audience**: Stakeholders, product team, investors  
**Prerequisite**: Live deployment or localhost dev server running

---

## Pre-Demo Setup (5 min before)

1. Open two browser tabs:
   - Tab 1: http://localhost:3000 (or production URL)
   - Tab 2: Same URL but in private window (for second user)

2. Pre-created test accounts:
   - **Admin User**: admin@example.com / password123
   - **Regular User 1**: demo1@example.com / password123
   - **Regular User 2**: demo2@example.com / password123

3. Pre-created test data:
   - Sample workbooks in library (with questions)
   - Published workbooks in discover section
   - Some existing notifications/badges on admin account

4. Clear browser cache (hard refresh: Ctrl+Shift+R)

---

## Opening (1 min)

**Narrator**: "AIStudy is a learning platform that combines Excel problem-solving practice with gamification, community features, and admin governance. We've built an MVP with core flows. Let me show you what's working."

---

## Section 1: Authentication & Onboarding (2 min)

**Show**: Home page and login flow

```
1. Show home page (/) - highlights key features
2. Click "Sign In" or navigate to /login
3. Demo login with: demo1@example.com / password123
4. Show redirect to /study (study home)
5. Highlight: session persists (reload page - still logged in)
6. Show profile with user badge (top right)
```

**Key Point**: "Auth is backed by Supabase with JWT tokens. Users get a persistent session."

---

## Section 2: Workbook Management (3 min)

**Show**: Creating and managing workbooks

```
1. Navigate to /study/library
   - Show existing workbooks list
   - Explain: each workbook has questions and concepts
   
2. Click into one workbook: /study/workbooks/[id]
   - Show title, description, metadata
   - Show tabs: Concepts, Questions
   - Click "Concepts" tab - show accuracy by concept
   - Click "Questions" tab - show all questions
   
3. Click "Edit" or go to editor: /study/workbooks/[id]/editor
   - Show editor interface with questions list
   - Show: can add questions, edit, delete
   - Highlight: type-safe with Zod validation backend
```

**Key Point**: "Workbooks are fully CRUD. Creators can build content, and it gets reviewed before publishing."

---

## Section 3: Practice & Learning (4 min)

**Show**: How students practice with immediate feedback

```
1. Navigate to /study/practice
   - Select a workbook from dropdown
   - Start practice session
   
2. Show question rendering:
   - Question text and image (if any)
   - Multiple choice options
   - Timer (shows time spent)
   
3. Answer a question:
   - Click correct answer → green feedback
   - Explain: shows explanation (if provided)
   - Show "Next" button
   - Advance to next question
   
4. Complete all questions:
   - Show results screen
   - Breakdown by concept
   - Show: Accuracy %, XP earned
   
5. Back to /study/practice - can see practice history
```

**Key Point**: "Every attempt is tracked for analytics. Students get immediate feedback and learn from explanations."

---

## Section 4: Gamification & Progress (3 min)

**Show**: How gamification drives engagement

```
1. Navigate to /study/growth
   - Show recent badges earned (with dates)
   - Show next badges to unlock (locked section)
   - Explain: each badge has conditions (e.g., "solve 10 problems")
   
2. Click /study/profile
   - Scroll to badge collection (4x6 grid)
   - Show earned badges (yellow background, date earned)
   - Show locked badges (greyed out)
   - Explain: XP progresses toward next tier
   
3. Navigate to /study/stats
   - Show learning analytics dashboard
   - Heatmap: problems attempted per week
   - Problem type accuracy (bar chart)
   - Concept accuracy (top 10 concepts)
   - Weak concepts (red warning section - concepts needing help)
   - Wrong note mastery (pie: total, mastered, reviewing, open)
```

**Key Point**: "Badges motivate learning. Analytics give insight into performance and weak areas for targeted improvement."

---

## Section 5: Community & Discovery (2 min)

**Show**: How workbooks become public and build community

```
1. Show /study/discover
   - List of published workbooks by different creators
   - Each shows: title, creator, rating, usage count
   
2. Click on a public workbook: /study/discover/[id]
   - Show comments section at bottom
   - Show "Fork" button to copy workbook
   
3. (Optional) Fork the workbook:
   - Click fork → notification sent to original creator
   - Show /study/notifications (bell icon in header)
   - Workbook now in user's library for customization
```

**Key Point**: "Creators can share workbooks. Community can fork and adapt. Helps scale content creation."

---

## Section 6: Notifications & Real-Time Awareness (2 min)

**Show**: How users stay aware of community activity

```
1. Show header with bell icon (🔔)
   - Red badge shows unread count (e.g., "3")
   
2. Click bell → navigate to /study/notifications
   - Show list of notifications with:
     - Icon (emoji based on type)
     - Title + message
     - Relative time (e.g., "2 hours ago")
     - Blue background for unread
   
3. Click notification:
   - Automatically marks as read
   - Navigates to relevant page (e.g., to the workbook)
   
4. Show notification types:
   - "Workbook forked" - when someone forks your workbook
   - "Comment reply" - when someone comments on your workbook
   - "Badge earned" - when milestone achieved
```

**Key Point**: "Users stay engaged with notifications. Types cover all important community and learning events."

---

## Section 7: Admin Panel (3 min)

**Show**: How platform is governed

```
1. Logout from demo1@example.com
2. Login with admin account: admin@example.com / password123
3. Show header changes - navigation includes "Admin"
   
4. Navigate to /study/admin
   - Dashboard shows: stats, pending tasks
   - Sidebar menu: AI Jobs, Questions, Quests, Reports, Workbooks
   
5. Show /study/admin/reports:
   - List of flagged content (questions, workbooks, comments)
   - Can view report: reason, reporter, content
   - Action: mark as resolved, delete, or ignore
   
6. Show /study/admin/workbooks:
   - Can feature/unfeature workbooks for discovery
   - Can delete inappropriate content
   - Can edit metadata
   
7. Show /study/admin/questions:
   - Can review questions across all workbooks
   - Can mark as resolved if flagged
   - Can maintain question quality
   
8. Show /study/admin/ai-jobs (if P13 AI jobs exist):
   - Can view status of AI-generated workbooks
   - Can retry failed imports
   - Can view job logs
```

**Key Point**: "Admin tools protect platform quality. Moderators can handle reports, feature content, and manage governance."

---

## Section 8: Technical Highlights (1 min)

**Narrator**: "Behind the scenes, here's what makes AIStudy robust:"

- **Type Safety**: Full TypeScript + Zod validation. Changes caught at compile time.
- **Real-Time APIs**: tRPC with automatic client type inference. No manual DTOs.
- **Database**: Drizzle ORM with PostgreSQL. Migrations tracked in version control.
- **Scalability**: Turborepo monorepo. Apps share types and logic. Vercel for CDN + edge.
- **Auth**: Supabase JWT. Session persists across reloads. Admin roles enforced server-side.
- **Notifications**: Idempotent event system. No duplicate notifications. Non-blocking writes.

---

## Section 9: Deployment Path (1 min)

**Narrator**: "Ready for production:"

```
pnpm build       # All checks pass: lint, types, build
pnpm db:push     # Schema synced to Supabase
git push         # Triggers Vercel auto-deploy
```

**Highlight**: "Zero-downtime deploy. Vercel handles scaling. Database migrations are safe and reversible."

---

## Closing (1 min)

**Narrator**: "That's AIStudy MVP. Core flows working. Admin governance in place. Ready to scale to real users."

**Key takeaways**:
1. ✅ Auth and content creation working
2. ✅ Learning practice with feedback loops
3. ✅ Gamification driving engagement
4. ✅ Community features (fork, comment, discover)
5. ✅ Admin tools for moderation and governance
6. ✅ Analytics for learning insights
7. ✅ Type-safe, scalable architecture

**Next steps** (for product):
- [ ] Soft launch with 100-500 internal users (Week 1)
- [ ] Monitor: activation, badge earn rate, content growth
- [ ] Gather feedback: UI/UX, feature requests
- [ ] Phase 2 planning: mobile app (Expo), AI features (PDF import), advanced analytics

---

## Q&A Notes

**Q: Is data safe?**  
A: Yes. Auth via Supabase (industry standard). All API calls require JWT. Database encrypted at rest. Admin enforced server-side.

**Q: What if a workbook has spam?**  
A: Admin can review reports, delete content, and warn/ban users. Report flow is built in.

**Q: Can we add new question types?**  
A: Yes. Schema supports flexible question types. Backend validates via Zod. Frontend renders based on type.

**Q: Mobile support?**  
A: Phase 2. We'll use Expo for React Native. Share types and some logic via monorepo.

**Q: Analytics - what data do we collect?**  
A: Attempts, accuracy, time spent, concepts. No personally identifiable tracking beyond learning behavior. Admin can audit in database.

---

## Demo Environment Checklist

Before presenting:

- [ ] Internet connection stable
- [ ] Both tabs open (main app + private window for 2nd user)
- [ ] Test accounts logged out (ready to log in)
- [ ] Data pre-loaded (sample workbooks, notifications)
- [ ] localhost:3000 (or production URL) loaded
- [ ] Browser zoom at 100%
- [ ] Presenter notes reviewed
- [ ] 5 minutes to spare (for tech troubleshooting)

---

## Timing Guide

| Section | Duration | Slides |
|---------|----------|--------|
| Opening | 1 min | Overview |
| Auth | 2 min | Login, session |
| Workbooks | 3 min | Create, edit, publish |
| Practice | 4 min | Attempt, feedback, results |
| Gamification | 3 min | Badges, analytics |
| Community | 2 min | Discover, fork, comments |
| Notifications | 2 min | Bell, types, navigation |
| Admin | 3 min | Reports, moderation, governance |
| Technical | 1 min | Architecture highlights |
| Deployment | 1 min | Build → Vercel |
| Closing | 1 min | Summary + next steps |
| **TOTAL** | **~23 min** | Ready for 5 min Q&A |

---

## Post-Demo Follow-Up

1. Record any questions not covered
2. Share demo link (if production) for further exploration
3. Collect feedback on: UX, features, performance, direction
4. Iterate based on feedback before soft launch
