# Care Next Action Deduplication Acceptance Criteria

## Functional acceptance

- If Next Action comes from an active recommendation, that recommendation is not shown again in the active Recommendations list.
- If another active recommendation exists, it remains visible below.
- Inactive/completed/dismissed recommendations still show in the lower group.
- If Next Action uses plant fallback, Recommendations list is not deduped.
- Empty copy communicates no other recommendations when the only active recommendation is promoted.

## Validation commands

```bash
npm run typecheck
npm test -- --runInBand
npm run build:web && npm run smoke:web
```

## Manual acceptance

- Open Plant Detail → Care.
- Confirm Next Action is not duplicated immediately below in Recommendations.
- Confirm additional recommendations still show.


## Validation results — 2026-05-09

- `npm run typecheck` passed.
- `npm test -- --runInBand` passed: 15 suites, 58 tests.
- `npm run build:web && npm run smoke:web` passed.
- Manual Expo Go visual smoke remains for Daniel.
