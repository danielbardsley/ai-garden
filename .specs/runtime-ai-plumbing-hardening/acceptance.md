# Runtime + AI Plumbing Hardening Acceptance Criteria

## Functional acceptance

- Running one documented command starts Expo Go for Garden Roof Deck over Tailscale.
- The generated Expo Go URL is reachable from a tailnet device.
- Native API calls use the Tailscale HTTPS API route by default for Expo Go testing.
- API URL composition does not duplicate `/api/garden-roof-deck` if origin/path env values are imperfect.
- The app distinguishes at least these AI states:
  - API unreachable from device
  - API reachable but AI provider unconfigured
  - AI provider configured but request failed
- When backend health reports `agentConfigured=true` and the phone can reach the API, the app does not show a generic “no AI” warning.
- Garden API container has restart persistence configured.
- Runtime env file expectations are documented and secrets remain uncommitted.

## Validation commands

Completed validation:

```bash
npm run typecheck
npm test
cd backend && .venv/bin/pytest
cd /srv/projects/garden-roof-deck && docker compose config
cd /srv/projects/openclaw-app-platform && scripts/app-platform validate
cd /srv/projects/openclaw-app-platform && scripts/app-platform smoke garden-roof-deck
curl -sS https://openclaw.tail8c3304.ts.net/api/garden-roof-deck/health
# Expo Go /status requires running npm run start:go:tailscale
```

## Manual acceptance

- Daniel opens Expo Go with the provided `exp://...` link.
- Camera flow reaches AI identification without a false “no AI” warning when backend is configured.
- If the API URL is intentionally broken, warning copy points to API reachability instead of implying AI is not configured.
- If the provider key is intentionally absent in a safe test environment, warning copy says AI provider is not configured.

## Rollout notes

- Do not print real `.env` contents in logs or Slack.
- Do not change Tailscale Serve unless explicitly approved.
- If Docker containers are recreated, re-run health and Tailscale route checks.
- Make a checkpoint commit before starting the subsequent Ask AI feature.


## Validation results — 2026-05-09

- `npm run typecheck` passed.
- `npm test -- --runInBand` passed: 8 suites, 35 tests.
- `cd backend && .venv/bin/pytest` passed: 13 tests.
- `docker compose config` passed and includes `restart: unless-stopped`.
- `scripts/app-platform validate` passed with expected warnings for ignored real `.env` files.
- `scripts/app-platform smoke garden-roof-deck` passed.
- `scripts/app-platform secrets garden-roof-deck` reported 2 expected high findings for real ignored `.env` files: `.env` and `backend/.env`; no secret values were printed.
- `npm run build:web && npm run smoke:web` passed.
- Recreated Garden API with compose project `ocapp-garden-roof-deck`; Docker inspect reports `unless-stopped running healthy`.
- Local health returned `agentConfigured=true`.
- Tailscale health returned `agentConfigured=true`.

## Manual follow-up

- Daniel should run `npm run start:go:tailscale`, open the printed Expo Go URL, and confirm the camera flow no longer shows generic AI unavailable when backend health is configured/reachable.
