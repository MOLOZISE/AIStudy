# task-01-domain-schema.md

Use `master.md` as the governing instruction.

## Task
Implement the first migration-safe domain evolution so that existing `channels` can represent both boards and spaces.

## Goal
Keep all existing post/comment/member flows working while enabling the app to model:
- board
- space

## Focus Files
- packages/db/src/schema/index.ts
- packages/api/src/routers/channels.ts
- packages/api/src/routers/posts.ts
- packages/types/**/* if needed
- any validation/schema helpers tied to channels

## Required Changes
Add additive metadata to channels, such as:
- type
- scope
- postingMode
- membershipType
- isListed
- parentId
- defaultSort
- purpose

## Compatibility Requirements
- existing rows must remain valid
- existing APIs should not break
- posts remain attached to channels/spaces via the same channel linkage
- join/leave/request flows should remain compatible
- defaults must make old channels behave sensibly

## Do Not
- remove existing columns
- force destructive renames in the first pass
- introduce a separate new table if not necessary
- refactor unrelated domains

## Validation
- type-check affected packages
- lint affected files if configured
- ensure channel listing/query endpoints still work
- note any required DB push / migration steps

## Report Format
summary
changed_files
migration_notes
verification
risks
next_steps