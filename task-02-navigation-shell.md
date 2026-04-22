# task-02-navigation-shell.md

Use `master.md` as the governing instruction.

## Task
Refactor the app shell so the product feels board-first instead of feed-first.

## Goal
Change the product framing without breaking the current core flows.

## Focus Files
- apps/web/src/app/page.tsx
- apps/web/src/app/(main)/**/*
- apps/web/src/components/Sidebar.tsx
- any layout/navigation components used by the main app

## Required Changes
1. Logged-in landing should no longer default to `/feed`
2. Introduce a primary destination such as:
- /home
- /boards
- /spaces
3. Sidebar should prioritize:
- 공지 / 필독
- 공통 게시판
- 그룹사 게시판
- 기술 / 정보공유
- 자유 / 문화
- 익명 게시판
- 내 공간
- 탐색
- 피드(부가 기능)

4. Terminology should move away from overly feed-centric wording
5. `/feed` must continue to work, but as a secondary surface

## Constraints
- keep auth flow working
- keep current routing stable where possible
- do not redesign everything at once
- focus on shell, hierarchy, and framing

## Validation
- verify landing redirect behavior
- verify sidebar navigation renders correctly
- verify `/feed` remains reachable
- verify no obvious broken links/routes in main shell

## Report Format
summary
changed_files
verification
risks
next_steps