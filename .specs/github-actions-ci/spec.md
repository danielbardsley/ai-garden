# GitHub Actions CI Pipeline Spec

## Summary

Create a GitHub Actions build pipeline for Garden Roof Deck / AI Garden so every commit pushed to GitHub and every pull request validates the frontend and backend before merge/deploy.

## Goals

- Run frontend dependency install from `package-lock.json` using `npm ci`.
- Run frontend TypeScript checks with `npm run typecheck`.
- Run frontend Jest tests with `npm test -- --runInBand`.
- Build the Expo web export with `npm run build:web`.
- Run the web smoke check with `npm run smoke:web`.
- Run backend tests in Python 3.12 using isolated dependencies.
- Keep CI free of production secrets; tests must use fake/test environment values only.
- Trigger on pushes to `master` and pull requests targeting `master`.
- Prefer clear, separate frontend and backend jobs so failures are easy to diagnose.

## Non-goals

- No deployment from GitHub Actions yet.
- No mobile native builds yet.
- No Docker image publishing yet.
- No required branch-protection configuration in this change; the workflow should make branch protection possible later.

## Proposed workflow

Add `.github/workflows/ci.yml` with two jobs:

### Frontend job

- Runner: `ubuntu-latest`
- Node: 22, matching local runtime closely enough for Expo/React Native tooling
- Install with `npm ci`
- Run:
  - `npm run typecheck`
  - `npm test -- --runInBand`
  - `npm run build:web`
  - `npm run smoke:web`

### Backend job

- Runner: `ubuntu-latest`
- Python: 3.12
- Install `uv`
- Run backend dependency sync/install from `backend/pyproject.toml`
- Run backend pytest from `backend/`

## CI environment

The workflow must not require real provider keys. If backend/frontend tests require env vars, define safe fake values in workflow `env` or rely on defaults already used by tests.

Suggested safe defaults if needed:

- `GARDEN_AGENT_PROVIDER=mock` or equivalent test-safe provider if the backend supports it
- `GARDEN_AGENT_MODEL=test-model`
- `DATA_DIR=/tmp/garden-roof-deck-ci`

## Risks

- Expo web export may be slower in GitHub-hosted runners but should be acceptable.
- Backend dependency installation includes AI provider SDKs; dependency cache should be added if CI becomes slow.
- If backend tests currently rely on local `.env`, they must be adjusted or the workflow must supply non-secret defaults.
