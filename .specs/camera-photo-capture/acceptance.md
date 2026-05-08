# Camera Photo Capture Acceptance

## Spec acceptance

- Camera/photo capture scope is documented.
- Real AI, cloud sync, and media upload are explicitly deferred.
- Data writes are mapped to existing SQLite tables.
- Web fallback behavior is defined.
- Manual Expo Go validation path is defined.

## Implementation acceptance

- Camera route requests permission on device.
- Permission denied state is usable and readable.
- User can capture a photo in Expo Go.
- User can select or confirm an existing plant.
- Save creates an observation row and photo row in SQLite.
- Saved photo appears in Plant Detail timeline.
- Saved photo appears in Gallery.
- Web export continues to pass.
- Validation passes:
  - `npm run typecheck`
  - `npm run build:web`
  - `npm run smoke:web`
  - `scripts/app-platform validate`
  - `scripts/app-platform smoke garden-roof-deck`
- Expo Go manual capture smoke test passes.
