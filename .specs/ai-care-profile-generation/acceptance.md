# AI Care Profile Generation Acceptance Criteria

## Functional acceptance

- Care Profile card has AI draft/improve action.
- Action checks diagnostics before backend request.
- Backend returns structured profile draft.
- Draft fields populate editable UI but are not saved automatically.
- User can edit draft before saving.
- Saved AI draft persists with `source='ai_assisted'`.
- API unreachable, AI unconfigured, and request-failed states show safe copy.
- No care event is created.
- No recommendation status is changed.

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
- Tap `Draft with AI` or `Improve with AI`.
- Confirm editable fields populate.
- Edit one field and save.
- Navigate away/back and confirm persistence.


## Validation results — 2026-05-09

- `npm run typecheck` passed.
- `npm test -- --runInBand` passed: 15 suites, 56 tests.
- `cd backend && .venv/bin/pytest` passed: 22 tests.
- `npm run build:web && npm run smoke:web` passed.
- Rebuilt/recreated `ocapp-garden-roof-deck-api`.
- Local `POST /agent/care-profile-draft` smoke returned `status=succeeded`, `providerConfigured=true`, and output present.
- Platform `validate` and `smoke garden-roof-deck` passed with known ignored `.env` warnings.
- Manual Expo Go draft/edit/save/persistence smoke remains for Daniel.
