# Care Next Action Completion Acceptance Criteria

## Functional acceptance

- Next Action backed by a recommendation can be marked completed from the card.
- Swipe-away is supported for completion, with `Mark done` fallback.
- Completed recommendation is not deleted.
- Completed recommendation appears in completed/dismissed section.
- Next active recommendation promotes to Next Action automatically.
- Plant fallback Next Action does not show completion affordance.
- No care event is created automatically.
- Failure to update status shows safe copy and does not remove the card.

## Validation commands

```bash
npm run typecheck
npm test -- --runInBand
npm run build:web && npm run smoke:web
```

## Manual acceptance

- Open Expo Go.
- Use a plant with at least two active recommendations.
- Complete the Next Action by swipe or Mark done.
- Confirm the second recommendation becomes Next Action.
- Confirm completed recommendation is still visible below.


## Validation results — 2026-05-09

- `npm run typecheck` passed.
- `npm test -- --runInBand` passed: 15 suites, 59 tests.
- `npm run build:web && npm run smoke:web` passed.
- Manual Expo Go swipe/mark-done smoke remains for Daniel.
