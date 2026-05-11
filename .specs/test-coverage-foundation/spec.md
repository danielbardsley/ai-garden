# Test Coverage Foundation Spec

## Status

Draft for implementation.

## Problem

Garden Roof Deck now has meaningful local-first storage, camera capture, AI identification, backend agent routes, and clean-slate onboarding assumptions, but automated coverage is thin:

- backend has 5 pytest tests
- frontend has no test framework or coverage gate
- current validation depends mostly on typecheck, build, smoke tests, and manual Expo Go checks

Recent regressions around clean-slate storage, add-to-inventory data shape, and camera confirmation UI show that the project needs automated tests before the feature surface grows further.

## Goal

Establish frontend and backend test tooling with coverage reporting and enforce an 80% coverage target for both sides.

The first implementation should prioritize high-value tests around current behavior, not exhaustive UI snapshot coverage.

## Non-goals

- Do not build a full CI pipeline unless it is already trivial from local scripts.
- Do not require native device/emulator tests for the first coverage gate.
- Do not make live OpenAI calls in tests.
- Do not test Expo Camera hardware behavior directly.
- Do not block future UI iteration with brittle screenshots or broad snapshot tests.

## Coverage target

### Backend

- Tooling: `pytest` + `pytest-cov`.
- Target: at least 80% line coverage for `backend/app`.
- Command: should be available as a documented backend coverage command, preferably:

```bash
cd backend
. .venv/bin/activate
pytest --cov=app --cov-report=term-missing --cov-fail-under=80
```

### Frontend

- Tooling: Jest with Expo/React Native-compatible configuration unless implementation discovery strongly favors Vitest for pure TypeScript units.
- Target: at least 80% line coverage for application TypeScript under `src/`.
- Command:

```bash
npm run test:coverage
```

Frontend coverage should exclude generated/build artifacts and non-source folders.

## Test strategy

### Backend focus areas

1. Health/config routes
   - health returns app status, provider, model, and configured flag.
2. Agent schemas and route validation
   - photo categorization accepts image uploads.
   - photo identification accepts image uploads.
   - invalid/missing image uploads fail cleanly.
3. Agent behavior without OpenAI key
   - deterministic mock output.
   - no live provider calls.
4. Photo identification output shaping
   - `visualCommonName`/`openIdentification` fields serialize with frontend aliases.
   - weak/no-match behavior can return no `plantMatches`.
5. Agent run repository
   - run created/updated with status and output/error.
   - output does not store image bytes/base64.
6. Config
   - defaults are safe.
   - model/provider settings are reflected in health/agent behavior.

### Frontend focus areas

Prefer pure/service tests first, then component tests where they are stable.

1. Garden agent context builders
   - plant inventory context contains only metadata, no local photo URI/image bytes.
   - launched-from plant prior is passed in request shape.
2. Garden agent API client/service
   - web skips native-only uploads.
   - non-OK responses return `null` without throwing.
   - successful identification response is passed through.
3. Camera capture service
   - clean-slate save does not require seeded `season-2026`.
   - add-to-inventory uses `visualCommonName` first.
   - fallback name extraction trims sentence-like IDs.
   - persisted observation note is clean.
   - pre-save AI tags/insight are persisted after save.
   - duplicate post-save categorization is not triggered for pre-save analysis.
4. View model helpers
   - latest photo selection.
   - plant swatches and relative dates.
5. Camera confirmation presentation logic
   - no confident inventory match displays clean visual name.
   - add-to-inventory CTA appears when visual ID has no confident match.
   - confident match uses inventory plant name.
6. Plant detail display helpers
   - long sentence-like plant names are clamped/sanitized.
   - description fallback is safe for new plants.
7. Home screen data hook behavior where practical
   - home data includes photos so plant cards can show latest image.

## Frontend testability expectations

Some logic currently lives inline in React components. Implementation may extract small pure helpers to make tests stable, for example:

- camera identification display model / CTA decision helper
- plant title cleanup helper
- add-to-inventory name extraction helper

Extraction is acceptable when it improves coverage and readability without changing product behavior.

## Mocking expectations

- Mock `react-native` `Platform.OS` when needed.
- Mock Expo filesystem/camera/sqlite APIs rather than invoking device APIs.
- Prefer repository/service-level tests with simple fakes over large component mocks.
- Backend tests must use `TestClient` and local temporary SQLite/data directories.
- Backend tests must not require `OPENAI_API_KEY`.

## Scripts and documentation

Add or update scripts so the common validation loop is clear:

```bash
npm test
npm run test:coverage
npm run typecheck
npm run build:web
npm run smoke:web
```

Backend coverage command should be documented in this spec and/or project docs/scripts.

If practical, add a root-level convenience command for all tests later, but it is not required for the first pass.

## Risks

- Expo/Jest configuration can be noisy with ESM packages and React Native transforms.
- Native SQLite abstractions need careful mocking.
- Achieving 80% frontend coverage may require extracting logic from UI components.
- Coverage thresholds can become brittle if broad UI files are included before they are testable.

## Recommended implementation slices

1. Backend coverage gate
   - Add `pytest-cov`.
   - Expand backend tests until `backend/app` reaches 80%.
2. Frontend test harness
   - Add Jest/Expo test dependencies and config.
   - Add one passing smoke/unit test.
   - Add coverage collection for `src/`.
3. Frontend pure/service coverage
   - Context builder, API client/service, view models, name cleanup helpers.
4. Frontend storage/service coverage
   - Camera capture service with mocked repositories/filesystem.
5. Frontend component/presentation coverage
   - Camera confirmation model/helper tests; minimal component tests if stable.
6. Enforce thresholds
   - Enable 80% coverage thresholds once tests are sufficient.

## Open questions

- Should frontend threshold be enforced globally immediately, or introduced after the initial test harness lands and enough tests are written in the same branch?
- Should coverage artifacts be ignored in git as `coverage/` and `backend/htmlcov/`?
- Should backend and frontend test coverage become part of the app-platform validation command later?
