# Care Section Foundation Acceptance Criteria

## Functional acceptance

- Care tab shows a next-action card.
- Care tab shows existing care recommendations with source/status/due information.
- Care tab shows existing care history events in readable cards.
- Care tab shows care-relevant AI notes when present.
- Empty states are helpful when care data is sparse.
- No new backend calls are introduced.
- No care data is mutated in this slice.
- Timeline and Ask AI tabs still work.

## Validation commands

```bash
npm run typecheck
npm test -- --runInBand
npm run build:web && npm run smoke:web
```

## Manual acceptance

- Open Expo Go.
- Visit a plant detail page.
- Tap `Care`.
- Confirm the section is readable and does not look like a placeholder.
- Confirm plants with/without recommendations both render sensible states.


## Validation results — 2026-05-09

- `npm run typecheck` passed.
- `npm test -- --runInBand` passed: 11 suites, 45 tests.
- `npm run build:web && npm run smoke:web` passed.
- Manual Expo Go Care tab smoke remains for Daniel.
