# AI Care Recommendations Acceptance Criteria

## Functional acceptance

- Care tab includes an AI care suggestion action.
- Action checks diagnostics before backend request.
- Backend endpoint returns structured recommendations.
- UI previews recommendations before persistence.
- User can save individual suggestions.
- Saved suggestions appear in recommendations section after reload.
- Saved suggestions use `source='ai_suggested'` and `status='suggested'`.
- API unreachable, AI unconfigured, and request-failed states show safe copy.
- No care event is created by AI suggestions.
- Existing recommendation statuses are not auto-mutated.

## Validation commands

```bash
npm run typecheck
npm test -- --runInBand
cd backend && .venv/bin/pytest
npm run build:web && npm run smoke:web
cd /srv/projects/openclaw-app-platform && scripts/app-platform validate
cd /srv/projects/openclaw-app-platform && scripts/app-platform smoke garden-roof-deck
```

## Manual acceptance

- Open Expo Go.
- Visit Plant Detail → Care.
- Tap `Ask AI for care suggestions`.
- Confirm preview suggestions appear.
- Save one suggestion.
- Confirm it appears in Recommendations and persists after navigating away/back.
- Confirm no care history event was created automatically.


## Validation results — 2026-05-09

- `npm run typecheck` passed.
- `npm test -- --runInBand` passed: 13 suites, 51 tests.
- `cd backend && .venv/bin/pytest` passed: 19 tests.
- `npm run build:web && npm run smoke:web` passed.
- Rebuilt/recreated `ocapp-garden-roof-deck-api`.
- Local `POST /agent/care-recommendations` smoke returned `status=succeeded`, `providerConfigured=true`, and output present.
- Platform `validate` and `smoke garden-roof-deck` passed with known ignored `.env` warnings.
- Manual Expo Go suggestion preview/save/persistence smoke remains for Daniel.
