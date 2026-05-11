# Test Coverage Foundation Tasks

## Spec

- [x] Create test coverage foundation spec.
- [x] Document frontend/backend 80% coverage target.
- [x] Identify likely tooling and high-value test areas.

## Backend tooling

- [x] Add `pytest-cov` to backend dev dependencies.
- [x] Add/document backend coverage command.
- [x] Ensure backend coverage artifacts are gitignored.

## Backend tests

- [x] Expand health/config tests.
- [x] Add agent schema serialization tests for `visualCommonName`, `openIdentification`, and `plantMatches` aliases.
- [x] Add agent route tests for missing/invalid image behavior.
- [x] Add no-key failure tests and test-local monkeypatched agent doubles; production mocks removed.
- [x] Add agent run repository tests for status/output/error persistence.
- [x] Verify backend coverage reaches at least 80% for `backend/app`.

## Frontend tooling

- [x] Choose and install frontend test runner (`jest`/Expo preferred unless blocked).
- [x] Add `npm test` script.
- [x] Add `npm run test:coverage` script.
- [x] Configure coverage collection for `src/`.
- [x] Ensure frontend coverage artifacts are gitignored.
- [x] Add a first smoke/unit test to prove the harness.

## Frontend testability extraction

- [ ] Extract camera identification display/CTA helper if needed.
- [ ] Extract plant-name cleanup helper if needed.
- [ ] Extract add-to-inventory name extraction helper if needed.

## Frontend tests

- [x] Test garden agent context builder excludes image bytes/local URIs.
- [x] Test garden agent API client web skip and non-OK behavior.
- [x] Test view model helpers including latest photo lookup.
- [x] Test camera capture service clean-slate save does not require `season-2026`.
- [x] Test add-to-inventory uses `visualCommonName` first.
- [x] Test fallback name extraction cleans sentence-like IDs.
- [x] Test pre-save AI tags and insight persistence path.
- [ ] Test camera confirmation helper for confident match vs low/no match vs add-to-inventory.
- [ ] Test plant detail title/description sanitization helpers.
- [ ] Verify frontend coverage reaches at least 80% for `src/`.

## Validation

- [x] Backend: `pytest --cov=app --cov-report=term-missing --cov-fail-under=80`.
- [x] Frontend: `npm run test:coverage`.
- [x] `npm run typecheck`.
- [x] `npm run build:web`.
- [x] `npm run smoke:web`.
- [x] Platform validate/smoke still pass.

## Delivery

- [ ] Update spec decisions if tooling choice changes.
- [ ] Commit coverage spec separately from implementation if practical.
- [ ] Commit implementation after validation.
