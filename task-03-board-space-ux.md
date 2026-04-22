# task-03-board-space-ux.md

Use `master.md` as the governing instruction.

## Task
Differentiate the UX between boards and spaces while continuing to reuse the current post/comment system.

## Goal
Make the product feel like:
- Blind-style boards for open or anonymous discussion
- Slack-style lightweight spaces for team building and knowledge sharing

## Focus Areas
- header area
- metadata display
- pinned content area
- post composer entry points
- sorting/filter tabs
- membership CTA

## Required UX Direction

### Boards
- strong category identity
- easy browsing of latest/hot/pinned
- anonymous posting support where allowed
- clearer public discussion framing
- notice/pinned posts emphasized

### Spaces
- purpose-driven header
- member-oriented feel
- pinned resources / shared links / quick intro
- join/leave CTA clarity
- discussion + knowledge sharing framing

### Post Composer Presets
Support lightweight presets such as:
- 일반글
- 질문
- 정보공유
- 팀모집
- 익명고민

Map these to the current data model using flair/category fields where possible.
Do not over-engineer a new content model unless necessary.

## Constraints
- no realtime chat
- no DMs
- no voice/video
- no heavy workspace infra
- reuse current components first

## Validation
- board pages and space pages should feel meaningfully different
- post creation should still work
- anonymous indicators should remain clear
- existing posts should continue rendering

## Report Format
summary
changed_files
verification
risks
next_steps