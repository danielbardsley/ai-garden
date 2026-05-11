# AI Care Recommendations Tasks

## Planning

- [x] Create spec files.
- [x] Review current care foundation, quick logging, Garden Agent route/service patterns.

## Backend

- [x] Add care recommendation request/context/output schemas.
- [x] Add `GardenAgent.run_care_recommendations` with structured output.
- [x] Add `POST /agent/care-recommendations` route.
- [x] Persist agent run audit/debug record.
- [x] Return safe provider-unconfigured/failure response.
- [x] Add backend tests for schema aliases, route success, failure/unconfigured, run persistence.

## Frontend agent/client

- [x] Add TypeScript request/output/response types.
- [x] Add care context builder that omits local URIs and limits records.
- [x] Add API client method.
- [x] Add service method with diagnostics preflight.
- [x] Add tests.

## Local persistence

- [x] Add care recommendation repository create method.
- [x] Persist AI suggestions as `source='ai_suggested'`, `status='suggested'` only after user saves.
- [x] Add repository tests.

## Care tab UI

- [x] Add `Ask AI for care suggestions` action.
- [x] Add loading state.
- [x] Add diagnostics/failure state.
- [x] Show AI suggestion preview cards.
- [x] Add `Save suggestion` action per suggestion.
- [x] Reload Plant Detail after save.
- [x] Do not create care events or auto-complete recommendations.

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
