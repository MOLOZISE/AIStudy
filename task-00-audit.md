# task-00-audit.md

Use `master.md` as the governing instruction.

## Task
Perform a no-code product and architecture audit for the current repository.

## Goal
Identify how to pivot the current implementation from feed-centric to board-first, while reusing as much of the current system as possible.

## Inspect at minimum
- apps/web/src/app
- apps/web/src/components
- packages/api/src/routers
- packages/db/src/schema/index.ts
- any existing CLAUDE.md or repo guidance files

## Deliverables
Produce a structured report with:

1. current_state
- current top-level product mental model
- current navigation shape
- current core domain objects
- current anonymous/real identity support
- current feed dependence points

2. keep_change_remove
- what should be kept as-is
- what should be reframed
- what should be demoted
- what should be deferred

3. information_architecture_proposal
- recommended top navigation
- recommended sidebar grouping
- boards vs spaces distinction
- role of feed after the pivot

4. domain_model_proposal
- how to evolve `channels`
- required metadata additions
- compatibility considerations with posts/comments/members

5. phase_plan
- phase 1: safest structural pivot
- phase 2: UX differentiation
- phase 3: feed downgrade and cleanup

6. concrete_file_targets
- exact files likely touched in phase 1

## Constraints
- Do not write code
- Do not propose destructive rewrites first
- Favor migration-safe, incremental change
- Be specific to this repo, not generic

## Report Format
summary
current_state
keep_change_remove
information_architecture_proposal
domain_model_proposal
phase_plan
concrete_file_targets
risks