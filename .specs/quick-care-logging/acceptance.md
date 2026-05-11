# Quick Care Logging Acceptance Criteria

## Functional acceptance

- Care tab has an obvious way to log care.
- User can choose a care type from common chips.
- User can optionally add a note.
- Saving creates a local manual `CareEventRecord` for the current plant.
- New care event appears in Care history after save.
- Event persists after navigating away/back.
- Failed save keeps the note and shows a concise error.
- No backend or AI call is required.
- No recommendations are auto-completed in this slice.

## Validation commands

```bash
npm run typecheck
npm test -- --runInBand
npm run build:web && npm run smoke:web
```

## Manual acceptance

- Open Expo Go.
- Visit Plant Detail → Care.
- Log `Watered` with no note.
- Confirm it appears in Care history.
- Log `Pest check` with a note.
- Navigate away/back and confirm both entries persist.


## Validation results — 2026-05-09

- `npm run typecheck` passed.
- `npm test -- --runInBand` passed: 11 suites, 46 tests.
- `npm run build:web && npm run smoke:web` passed.
- Manual Expo Go persistence smoke remains for Daniel.
