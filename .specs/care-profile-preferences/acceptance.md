# Care Profile / Plant Preferences Acceptance Criteria

## Functional acceptance

- Care tab shows a Care Profile section.
- Empty profile shows helpful empty state.
- User can add/edit free-text care profile fields.
- Saving persists profile locally.
- Profile persists after navigating away/back.
- Existing care logging and recommendations still work.
- Care profile is included in AI care recommendation context.
- Care profile is included in Ask AI plant chat context.
- No backend or Tailscale changes are required.

## Validation commands

```bash
npm run typecheck
npm test -- --runInBand
npm run build:web && npm run smoke:web
```

## Manual acceptance

- Open Expo Go.
- Visit Plant Detail → Care.
- Add light/watering/location notes.
- Save.
- Navigate away/back and confirm values persist.
- Ask care suggestions or Ask AI later and verify no UI regressions.


## Validation results — 2026-05-09

- `npm run typecheck` passed.
- `npm test -- --runInBand` passed: 13 suites, 52 tests.
- `npm run build:web && npm run smoke:web` passed.
- Manual Expo Go add/edit/persistence smoke remains for Daniel.
