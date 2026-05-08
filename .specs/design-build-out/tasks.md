# Design Build-Out Tasks

## Spec / source review

- [x] Fetch Claude Design handoff bundle.
- [x] Read handoff README.
- [x] Read design transcript for user intent.
- [x] Read `AI Garden.html` and imported design files.
- [x] Create implementation spec.

## Implementation plan

- [x] Add Expo Router route layout if missing.
- [x] Create design tokens/theme module.
- [x] Create mocked plant/photo data module.
- [x] Create reusable design primitives (`PhotoTreatment`, status dot, icon button, section header, tab bar).
- [x] Implement home/dashboard route.
- [x] Implement plant detail route with Timeline / Ask AI / Care visual tabs.
- [x] Implement gallery route with local mock filtering.
- [x] Implement camera route with mocked viewfinder/scanning/identified states.
- [x] Add optional static photo lightbox/modal if low-risk.
- [x] Ensure no real AI/camera/storage functionality was added.

## Validation

- [x] `npm run typecheck`
- [x] `npm run build:web`
- [x] `npm run smoke:web`
- [x] `scripts/app-platform validate`
- [x] `scripts/app-platform smoke garden-roof-deck`
- [ ] Manual Expo Go/web spot check if the dev server is running.

## Checkpoint

- [x] Update acceptance/decisions if implementation deviates from spec.
- [ ] Commit design build-out after validation passes.
