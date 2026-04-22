# master.md — company-community pivot guide

You are working on the repository `MOLOZISE/company-community`.

## Product Reframe
This product should pivot from a feed-centric internal social app into a lightweight internal community platform centered on:
- Blind-style boards
- Slack-style lightweight spaces for team building, technical discussion, and knowledge sharing
- Feed as a secondary aggregated surface only

We are NOT building a full Slack clone.
We are NOT prioritizing realtime chat, DMs, voice, or complex collaboration infra in this phase.

## Repo Context
Assume the current repo already contains:
- Next.js App Router frontend
- tRPC backend routers
- Drizzle ORM schema
- Supabase auth/database
- domain primitives around channels, posts, comments, members, notifications, reports

The current implementation already leans toward:
- channel-based organization
- post/comment discussion model
- anonymous + real identity community support

The current problem is not missing primitives.
The problem is that the UX and product framing still feel too feed-first.

## Target Product Shape
Reposition the app into 3 major surfaces:

1. Boards
- company-wide boards
- group-company boards
- free board
- technical discussion board
- Q&A / help board
- knowledge sharing board
- culture / hobby board
- anonymous suggestion / anonymous concern board

2. Spaces
- project spaces
- study groups
- task-force spaces
- interest-based internal groups
- member-based participation
- pinned resources / purpose / links / notices

3. Feed
- only an aggregated optional view
- latest across subscribed boards/spaces
- highlights, not the main mental model

## Product Principles
- Board-first, not social-feed-first
- Lightweight, practical, familiar
- Reuse current primitives as much as possible
- Prefer migration-safe additive changes
- Avoid destructive rewrites in the first pass
- Anonymous posting must be configurable per board/space
- Admin moderation/reporting flows must continue to work
- Mobile responsiveness must remain acceptable

## Domain Strategy
Do not immediately replace `channels`.
Instead, evolve `channels` into a more general community container that can represent:
- board
- space

Then differentiate semantics via metadata and UI behavior.

Possible additive metadata:
- type: board | space
- scope: company | subsidiary | department | project | interest
- postingMode: real_only | anonymous_allowed | anonymous_only
- membershipType: open | request | invite
- isListed: boolean
- parentId: nullable
- defaultSort: latest | hot | pinned
- purpose: discussion | knowledge | announcement | social

## UX Strategy
- Logged-in landing should not default to `/feed`
- Sidebar should prioritize boards and spaces
- Terminology should move away from generic feed-first language
- Boards and spaces should share primitives but feel different in UX
- Feed should remain available but visually downgraded

## Out of Scope for this phase
- full realtime messaging
- DM system
- voice/video
- complex permission engine
- enterprise workflow automation
- deep org-chart integration

## Engineering Constraints
- Keep TypeScript strong and explicit
- Reuse current components where practical
- Minimize broad churn
- Preserve current auth flow
- Preserve existing post/comment functionality unless explicitly refactoring
- Prefer additive schema migrations
- Keep PRs/reports reviewable

## Required Working Style
Before implementing any major change:
1. Audit current files and behavior
2. Explain keep / change / remove
3. Propose the smallest safe implementation slice
4. Then implement only the scoped task

## Expected Output Format
Always report with this compact structure:

summary:
- what changed
- why

changed_files:
- file paths only

verification:
- what was checked
- what still needs manual checking

risks:
- key migration or UX risks

next_steps:
- smallest logical next task