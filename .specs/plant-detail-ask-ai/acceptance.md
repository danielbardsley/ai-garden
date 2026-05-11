# Plant Detail Ask AI Acceptance Criteria

## Functional acceptance

- Plant Detail `Ask AI` tab is no longer a static placeholder.
- User can type or tap a suggested question for the current plant.
- The app sends a plant-scoped chat request to the backend through `/api/garden-roof-deck/agent/plant-chat`.
- The backend returns a structured answer with optional suggested follow-up questions.
- User and assistant messages are persisted locally and reappear when returning to the plant.
- Chat context includes relevant plant history but excludes local file URIs and secrets.
- API unreachable, AI unconfigured, and request-failed states show diagnostics-aware copy.
- Timeline and Care tabs continue to work.
- No Tailscale Serve/Funnel changes are made.

## Backend acceptance

- Plant chat schemas validate request and response shapes.
- Plant chat route succeeds with a configured provider and mocked/real agent output in tests.
- Provider-unconfigured/failure path does not leak secrets or raw stack traces.
- Agent run record is stored for plant chat requests.

## Frontend acceptance

- Context builder limits records and omits local URIs.
- Chat service handles success and failure paths.
- Local message repository persists user/assistant messages.
- Plant Detail renders existing messages, prompt chips, loading state, and failure state.

## Validation commands

```bash
npm run typecheck
npm test -- --runInBand
cd backend && .venv/bin/pytest
cd /srv/projects/garden-roof-deck && docker compose config
cd /srv/projects/openclaw-app-platform && scripts/app-platform validate
cd /srv/projects/openclaw-app-platform && scripts/app-platform smoke garden-roof-deck
curl -sS http://127.0.0.1:18100/health
curl -sS https://openclaw.tail8c3304.ts.net/api/garden-roof-deck/health
```

## Manual acceptance

- In Expo Go, open a plant detail page.
- Tap `Ask AI`.
- Ask: `Should I water this today?`
- Confirm the answer references available context or clearly says when context is limited.
- Navigate away/back and confirm messages persist.
- Temporarily break API origin in a safe dev run and confirm API reachability copy appears.


## Validation results — 2026-05-09

- `npm test -- --runInBand` passed: 10 suites, 40 tests.
- `npm run typecheck` passed.
- `cd backend && .venv/bin/pytest` passed: 16 tests.
- `docker compose config` passed.
- `npm run build:web && npm run smoke:web` passed.
- Rebuilt/recreated `ocapp-garden-roof-deck-api` with the plant chat route.
- Local health returned `agentConfigured=true`.
- Local `POST /agent/plant-chat` smoke returned `status=succeeded`, `providerConfigured=true`, and output present.
- Tailscale health returned `agentConfigured=true`.
- Platform `validate` and `smoke garden-roof-deck` passed.
- Platform secret scan still reports the two expected ignored runtime env files: `.env` and `backend/.env`; no secret values were printed.

## Manual follow-up

- Daniel should open Expo Go, visit a plant detail page, tap `Ask AI`, ask a question, and confirm messages persist after navigating away/back.
