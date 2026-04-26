# AIStudy Platform Demo Script

**Duration**: 15-20 minutes | **Audience**: Stakeholders, investors, educators

## Pre-Demo Checklist

- [ ] Fresh database (or consistent test data)
- [ ] Admin account created with email (e.g., `admin@example.com`)
- [ ] Test user account ready (e.g., `user@example.com`)
- [ ] Sample PDF file prepared for upload (mock exam paper)
- [ ] Network connection stable
- [ ] Browser console open (optional, for watching API calls)
- [ ] Demo environment: http://localhost:3000 or production URL

## Demo Flow (15-20 min)

### 1. Welcome & Platform Overview (1 min)

> "AIStudy is an AI-powered gamified learning platform. Users upload study materials, AI generates questions, practice, track progress, and share with communities."

**Show**: Home page (/) → Login page redirect

---

### 2. Auth & User Setup (2 min)

#### 2.1 Signup Flow
- Click **Sign Up** button
- Fill form: Email (`demo-user@example.com`), Password (strong), Confirm password
- Click **Sign Up**
- Show email verification message
- **Alternative**: Use pre-verified account if time is short

#### 2.2 Verify Email
- Check email inbox (or use test account)
- Click verification link
- Redirect to study dashboard

**Talking Point**: "Supabase Auth handles secure email verification. All data encrypted at rest."

---

### 3. Dashboard Tour (1 min)

**Route**: `/study`

Show main elements:
- **Navigation**: Library, Practice, Growth, Discover, Quests, Rankings, Profile
- **Quick stats**: XP progress, current level, active quests
- **Call-to-action**: "Create Workbook" and "Generate with AI"

---

### 4. Core Feature 1: AI-Powered Question Generation (5-6 min)

**Route**: `/study/generate`

#### 4.1 Upload PDF
- Click **Upload PDF**
- Select sample exam paper
- Show upload progress (simulated or real)
- Wait for extraction completion
- Show extracted text preview (show 2-3 pages)

#### 4.2 AI Generation Preview
- Click **Generate Questions** (or auto-generate on upload)
- Show generated questions with:
  - **Types**: Multiple choice, true/false, short answer, essay
  - **Quality badge**: Shows QC score (e.g., "Good: 85/100")
  - **QC issues**: Highlight error (red), warning (yellow), info (blue) samples
  
**Talking Point**: "AI generates diverse questions in seconds. Built-in QC validates quality before applying."

#### 4.3 Question Selection & Filtering
- Show **Select All** / **Deselect All** buttons
- Toggle a few questions on/off
- Show **QC Score** visualization
- Mention question type distribution

#### 4.4 Apply to Workbook (Optional)
- Click **Create New Workbook** or select existing
- Show **Direct Apply** creating workbook instantly
- Show success message with workbook link

**Alternative** (if time): Click **Export to Excel** to download normalized template
- Show Excel file with sheets: `00-Metadata.xlsx`, `01-Questions.xlsx`, etc.

---

### 5. Core Feature 2: Problem Solving & Gamification (4-5 min)

**Route**: `/study/practice` or `/study/workbooks/[id]/`

#### 5.1 Start Practice Session
- Open a sample workbook (could be the one just created or pre-built)
- Click **Start Practice** or **Practice Mode**
- Show question interface:
  - Question text, image (if any), multiple choice options
  - Explanation after answer
  - XP reward display
  
**Interact**: Answer 2-3 questions to show:
- Immediate feedback (correct/incorrect)
- Explanation display
- XP and points earned (animated)
- Progress bar

#### 5.2 Wrong Notes Feature
- Show wrong answer marked
- Navigate to `/study/wrong-notes`
- Show wrong note list with:
  - Question, your answer, correct answer, explanation
  - Retry button
- Click retry → show session mode
- Answer correctly → show note resolution + bonus XP

**Talking Point**: "Users learn from mistakes. Wrong notes are a key retention mechanic."

---

### 6. Growth & Gamification Dashboard (2-3 min)

**Route**: `/study/growth`

Show key elements:
- **Level & XP**: Current level, XP progress bar, total XP
- **Quests**: Active daily/weekly/monthly quests with progress
- **Streaks**: Study streak calendar, longest streak
- **Statistics**:
  - Problems solved, correct rate
  - Topics mastered, weak areas
  - Time spent by topic

**Optional**: Click **Leaderboards** (`/study/rankings`)
- Show XP leaderboard with rankings
- Show "Problems Solved" leaderboard
- Highlight demo user's position

**Talking Point**: "Gamification drives engagement. Quests, streaks, and leaderboards motivate continuous learning."

---

### 7. Community Features (2-3 min)

**Route**: `/study/discover`

#### 7.1 Discover Public Workbooks
- Browse public workbooks with:
  - Title, description, fork count, rating
  - Creator name (anonymous option available)
  - "★ Fork" and "View" buttons

#### 7.2 View Workbook & Comments
- Click a workbook → `/study/discover/[publicationId]`
- Show:
  - Workbook details, creator info, statistics
  - Fork count, rating score
  - Comments section with nested replies
  
#### 7.3 Interact with Community
- Click **Add Comment** (must be logged in)
- Type sample comment: "Great workbook! Thanks for sharing."
- Submit → show comment appears instantly
- Show **Like** button, reply functionality
- Click reply → show nested comment form

**Talking Point**: "Community collaboration drives learning. Users share resources, rate quality, and discuss together."

---

### 8. Admin Dashboard (Optional, 1-2 min)

**Route**: `/study/admin` (requires admin role)

If demo account is admin-role:

#### 8.1 Overview Dashboard
- Show statistic cards:
  - Open reports, reviews in progress
  - Published workbooks, reported workbooks
  - Active quests, failed AI jobs
  - Questions needing review, reported comments

#### 8.2 Quick Admin Actions
- Navigate to `/study/admin/quests`
- Show quest list with active/inactive toggle
- Toggle one quest OFF → show instant update
- Show feedback: "Status updated"

**Talking Point**: "Admins monitor platform health and content quality. One-click moderation for problematic content."

---

### 9. Closing & Key Takeaways (1 min)

**Summarize**:

1. **Efficiency**: PDF → AI-generated questions in minutes (not hours)
2. **Quality**: Built-in QC ensures standards; human review available
3. **Engagement**: Gamification (XP, quests, streaks) drives daily usage
4. **Community**: Sharing and collaboration multiply content value
5. **Scalability**: Admin tools ensure platform health at any scale

---

## Demo Variations

### For Educators
- Emphasize: Question generation speed, auto-grading for subjective answers (future), class sharing
- Skip: Leaderboards, cosmetic badges

### For Investors
- Emphasize: User growth loop (gamification), viral sharing (forking), retention metrics
- Skip: Implementation details, admin panels

### For Technical Teams
- Emphasize: Architecture (Next.js, tRPC, Drizzle, Supabase), AI integration, scalability
- Include: Database schema, permission model, QC engine details

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| PDF upload fails | Check file size (<50MB), format (PDF), network connection |
| AI generation hangs | Reload page, check OpenAI API quota |
| Comments not showing | Clear browser cache, check network tab for errors |
| Admin pages blank | Verify user has `role='admin'` in database |
| Images not loading | Check Supabase Storage bucket permissions |

---

## Post-Demo Resources

- **User Guide**: Link to `/docs/user-guide.md` (TBD)
- **Technical Documentation**: `/docs/architecture/ARCHITECTURE.md`
- **API Documentation**: `/docs/api/API.md` (TBD)
- **Feedback Form**: [Google Form / Typeform link]

---

**Last Updated**: 2026-04-25  
**Prepared by**: Claude Code AI Development
