# Legacy: Company Community Platform

This folder contains remnants from the previous `company-community` project before AIStudy pivot.

## Files

- `community-seed.ts` — Default boards/spaces seed for company community platform
  - **Status**: Deprecated (not used in AIStudy)
  - **Reason**: AIStudy focuses on AI-powered learning, not community boards/spaces
  - **Usage**: Reference only. Do not run `pnpm db:seed` unless explicitly seeding legacy data

## Why Remove from Build?

AIStudy is centered on:
- Problem banks & workbooks
- Gamified learning (XP, levels, quests)
- Study progression tracking
- Community features secondary to learning

Legacy community boards/spaces are not part of Phase 1 MVP.

## If You Need to Reference

Refer to `community-seed.ts` for:
- Board/space metadata schema
- Channel organization patterns
- Old visibility/membership rules (may inform future community revival)
