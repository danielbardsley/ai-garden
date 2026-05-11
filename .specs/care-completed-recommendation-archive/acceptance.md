# Care Completed Recommendation Archive Acceptance Criteria

## Functional acceptance

- Completed/dismissed recommendation cards can be swiped away.
- Card follows finger while swiping.
- Completed/dismissed cards also have a `Hide` fallback button.
- Hidden cards are soft-deleted and no longer appear after reload/navigation.
- Active recommendations are not archive-swipable in this spec.
- Archive failure restores the card and shows safe error copy.

## Validation commands

```bash
npm run typecheck
npm test -- --runInBand
npm run build:web && npm run smoke:web
```

## Manual acceptance

- Complete a recommendation.
- Swipe or hide it from completed/dismissed section.
- Navigate away/back.
- Confirm the hidden completed card stays hidden.


## Validation results — 2026-05-09

- `npm run typecheck` passed.
- `npm test -- --runInBand` passed: 15 suites, 60 tests.
- `npm run build:web && npm run smoke:web` passed.
- Manual Expo Go completed-card swipe/hide smoke remains for Daniel.
