# Care Next Action Deduplication Tasks

## Planning

- [x] Create spec files.
- [x] Review current care section helper behavior.

## Helper logic

- [x] Add/adjust helper to identify promoted recommendation id.
- [x] Exclude promoted recommendation from active recommendation group.
- [x] Preserve inactive recommendation grouping.
- [x] Preserve plant fallback behavior.
- [x] Add tests for deduplication/fallback/inactive cases.

## UI

- [x] Update CareSection to use deduped groups.
- [x] Adjust empty copy to `No other recommendations queued.` where appropriate.
- [x] Optionally label leftover active list as `Other recommendations`.

## Validation

- [x] `npm run typecheck`
- [x] `npm test -- --runInBand`
- [x] `npm run build:web && npm run smoke:web`
- [ ] Manual Expo Go smoke. Requires Daniel’s Expo Go session.

## Delivery

- [x] Update acceptance results.
- [x] Add memory note.
