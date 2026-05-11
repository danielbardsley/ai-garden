# Test Coverage Foundation Acceptance Criteria

## Backend

- [x] Backend coverage command exists and is documented.
- [x] Backend coverage command passes with at least 80% line coverage for `backend/app`.
- [x] Backend tests do not require `OPENAI_API_KEY`.
- [x] Backend route tests cover health, photo categorization, photo identification, and invalid image behavior.
- [x] Backend repository/config/schema behavior has meaningful tests.

## Frontend

- [x] Frontend test command exists: `npm test`.
- [x] Frontend coverage command exists: `npm run test:coverage`.
- [x] Frontend coverage command passes with at least 80% line coverage for application code under `src/`.
- [x] Frontend tests do not require Expo Go, a physical device, camera hardware, or live backend/OpenAI calls.
- [ ] Frontend tests cover camera identification decision logic, clean-slate add-to-inventory naming, latest-photo home card behavior, and plant-detail title sanitization.

## Existing gates

- [x] `npm run typecheck` passes.
- [x] `npm run build:web` passes.
- [x] `npm run smoke:web` passes.
- [x] `/srv/projects/openclaw-app-platform/scripts/app-platform validate` passes.
- [x] `/srv/projects/openclaw-app-platform/scripts/app-platform smoke garden-roof-deck` passes.

## Quality bar

- [x] Coverage thresholds fail when coverage drops below 80%.
- [x] Coverage artifacts are not committed.
- [x] Tests are deterministic and do not depend on current date except through controlled helpers/mocks.
- [x] Tests prioritize behavior over implementation details.
