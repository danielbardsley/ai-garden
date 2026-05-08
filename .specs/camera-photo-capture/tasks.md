# Camera Photo Capture Tasks

## Spec

- [x] Define capture user flow.
- [x] Define permission states.
- [x] Define SQLite observation/photo writes.
- [x] Define mocked/manual plant association behavior.
- [x] Define web fallback behavior.
- [x] Define validation gates.

## Implementation — pending

- [x] Install Expo SDK 54-compatible camera dependency.
- [x] Add camera permission handling.
- [x] Replace mocked camera viewfinder with native camera on device.
- [x] Preserve graceful web fallback for static export.
- [x] Add plant picker or selected-plant save panel.
- [x] Add repository/service write API for captured photo transaction.
- [x] Wire Plant Detail “Log a new photo” to `/camera?plantId=<id>`.
- [x] Save captured photo metadata to SQLite.
- [x] Create observation row on save.
- [x] Add optional system photo tags.
- [x] Reload/navigate so Plant Detail and Gallery show the new photo.
- [x] Keep AI identification mocked/manual.

## Validation — pending

- [x] `npm run typecheck`
- [x] `npm run build:web`
- [x] `npm run smoke:web`
- [x] `scripts/app-platform validate`
- [x] `scripts/app-platform smoke garden-roof-deck`
- [ ] Expo Go camera permission/capture/save smoke test.
- [ ] Verify Gallery shows saved photo.
- [ ] Verify Plant Detail timeline shows saved photo.

## Checkpoint — pending

- [x] Update decisions if implementation differs.
- [ ] Commit after validation passes.
