# AI Care Profile Generation Tasks

## Planning

- [x] Create spec files.
- [x] Review existing care profile repository/UI and Garden Agent care recommendation pattern.

## Backend

- [x] Add care profile draft schemas.
- [x] Add `GardenAgent.run_care_profile_draft`.
- [x] Add `POST /agent/care-profile-draft` route.
- [x] Persist agent run audit/debug record.
- [x] Add backend tests for schema, route success, unconfigured/failure, run persistence.

## Frontend agent/client

- [x] Add TypeScript request/output/response types.
- [x] Add care profile draft context builder.
- [x] Add API client method.
- [x] Add service method with diagnostics preflight.
- [x] Add tests.

## Persistence

- [x] Extend care profile upsert input to accept `source`.
- [x] Save AI-reviewed drafts with `source='ai_assisted'`.
- [x] Preserve manual edit source behavior.
- [x] Add repository tests.

## UI

- [x] Add `Draft with AI` / `Improve with AI` action to Care Profile card.
- [x] Add loading/diagnostics states.
- [x] Populate editable draft fields from AI response.
- [x] Show “AI draft — review before saving.” copy.
- [x] Save reviewed draft through existing profile save path.
- [x] Ensure no automatic save before user confirmation.

## Validation

- [x] `npm run typecheck`
- [x] `npm test -- --runInBand`
- [x] `cd backend && .venv/bin/pytest`
- [x] `npm run build:web && npm run smoke:web`
- [x] Platform validate/smoke if backend container is rebuilt.
- [ ] Manual Expo Go smoke. Requires Daniel’s Expo Go session.

## Delivery

- [x] Update acceptance results.
- [x] Add memory note.
