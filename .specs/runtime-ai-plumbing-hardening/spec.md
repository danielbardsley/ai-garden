# Runtime + AI Plumbing Hardening Spec

## Summary

Harden Garden Roof Deck's runtime and AI connectivity so Expo Go, deployed web, and backend containers behave predictably after restarts and during demos. This is a foundation pass before building the Plant Detail “Ask AI” feature.

## Problem

The current AI-first camera flow works, but operational edges are still brittle:

- Expo Go can be started with the wrong native API origin, producing confusing “no AI” / AI unavailable warnings even when the backend is healthy.
- Backend and Caddy containers currently use Docker `restart policy=no`, so they do not automatically recover after EC2 reboot.
- `/srv/projects/garden-roof-deck/.env` is required by Compose but was missing after reboot, while `backend/.env` still held real provider config.
- The app has no clear user-facing diagnostic that distinguishes “AI provider not configured” from “phone cannot reach API” from “request failed”.
- The operator runbook for Expo Go + Tailscale startup is implicit rather than encoded in scripts/docs.

## Goals

1. Make Expo Go startup reproducible with a single project script or documented command.
2. Make native app API URL resolution explicit and testable.
3. Add a lightweight diagnostics path that reports API reachability and AI provider configured state without exposing secrets.
4. Add container restart persistence for Garden Roof Deck API, and document/coordinate Caddy/platform persistence where appropriate.
5. Make runtime env file expectations durable and safe: examples committed, real secrets ignored, no duplicate mystery env source.
6. Improve user-facing AI warnings so they identify the likely class of failure.

## Non-goals

- Build the full “Ask AI” chat UI.
- Add streaming responses.
- Replace OpenAI/provider abstraction.
- Introduce a full secrets manager.
- Change Tailscale Serve routing unless an explicit operator action is requested.
- Implement native release/EAS builds.

## Current state

- Web URL: `https://openclaw.tail8c3304.ts.net/apps/garden-roof-deck/`.
- API health URL via Tailscale: `https://openclaw.tail8c3304.ts.net/api/garden-roof-deck/health`.
- Expo Go development URL currently uses the host tailnet IP, e.g. `exp://100.109.137.10:8081`.
- Backend `/health` returns `agentProvider`, `agentModel`, and `agentConfigured`.
- Native `apiOrigin` defaults to `http://100.109.137.10:18100` unless `EXPO_PUBLIC_API_ORIGIN` is set.
- Compose reads `/srv/projects/garden-roof-deck/.env` and maps API to `127.0.0.1:18100`.
- Caddy handles public/tailnet routes under `/apps/garden-roof-deck/` and `/api/garden-roof-deck/`.

## Proposed approach

### 1. Runtime configuration model

Use the Tailscale HTTPS route as the canonical native API origin for Expo Go:

- `EXPO_PUBLIC_API_ORIGIN=https://openclaw.tail8c3304.ts.net`
- `EXPO_PUBLIC_API_BASE_PATH=/api/garden-roof-deck/`
- Resulting native API base URL should be `https://openclaw.tail8c3304.ts.net/api/garden-roof-deck`.

Avoid setting `EXPO_PUBLIC_API_ORIGIN` to a value that already contains `/api/garden-roof-deck` unless the URL builder explicitly handles that case. The current observed restart used an origin including the API path; implementation should normalize this or standardize the command to origin-only.

### 2. Expo Go startup script

Add a script such as:

```bash
npm run start:go:tailscale
```

Expected behavior:

- Forces `NODE_ENV=development` to avoid Expo dev SSR/runtime issues observed in prior sessions.
- Sets `REACT_NATIVE_PACKAGER_HOSTNAME` to the current Tailscale IPv4 address, or documents the static current value if dynamic detection is too brittle.
- Sets `EXPO_PUBLIC_API_ORIGIN` and `EXPO_PUBLIC_API_BASE_PATH` for the native bundle.
- Starts Expo with LAN/Go mode on a predictable port, preferably `8081` unless occupied.
- Prints both Expo Go URL and backend diagnostics URL.

Candidate command shape:

```bash
NODE_ENV=development \
REACT_NATIVE_PACKAGER_HOSTNAME=$(tailscale ip -4 | head -1) \
EXPO_PUBLIC_API_ORIGIN=https://openclaw.tail8c3304.ts.net \
EXPO_PUBLIC_API_BASE_PATH=/api/garden-roof-deck/ \
EXPO_PUBLIC_BASE_PATH=/apps/garden-roof-deck/ \
npx expo start --lan --go --port 8081 --clear
```

If package scripts cannot run shell substitution portably, add `scripts/start-expo-go-tailscale.sh` and call it from package.json.

### 3. API URL builder hardening

Update `src/services/platform.ts` so URL composition is safe and covered by tests:

- Web keeps same-origin route behavior.
- Native uses `EXPO_PUBLIC_API_ORIGIN` + `EXPO_PUBLIC_API_BASE_PATH`.
- Prevent duplicate path composition if origin accidentally includes the API path.
- Trim trailing slashes consistently.
- Add tests for:
  - web relative API path
  - native origin-only Tailscale URL
  - native origin already including API path
  - default native fallback

### 4. Diagnostics and warning clarity

Add a small client diagnostics service that can call `/health` and classify status:

- `apiReachable: true/false`
- `agentConfigured: true/false/null`
- `agentProvider`, `agentModel` when available
- `failureKind`: `api_unreachable`, `agent_unconfigured`, `request_failed`, `unknown`

Use this in AI camera warning copy and future Ask AI entry points:

- If API unreachable: “Garden API is unreachable from this device.”
- If API reachable but AI unconfigured: “AI provider is not configured on the server.”
- If request failed despite configured provider: “AI request failed; try again.”

Do not display keys, env values, or internal stack traces.

### 5. Backend health contract

Keep `/health` as the public low-cost health contract, but ensure it remains safe:

- Include app name/status.
- Include `agentConfigured`, `agentProvider`, `agentModel`.
- Do not include provider key presence details beyond boolean configured.
- Add/keep backend tests for configured and unconfigured provider state.

Optional if useful: add `/agent/status` as an AI-specific alias, but do not duplicate logic unless there is a clear UI need.

### 6. Container restart persistence

For Garden Roof Deck `compose.yaml`, add:

```yaml
restart: unless-stopped
```

for the API service.

Coordinate platform Caddy persistence separately because Caddy is owned by `/srv/projects/openclaw-app-platform`, but this spec should record the dependency:

- Garden API should restart from Compose policy.
- Platform Caddy container should also get restart persistence in the platform repo/runbook, or be started by a host service.
- Do not modify Tailscale Serve unless the existing route is absent or the user explicitly requests an apply.

### 7. Env file durability and secret hygiene

- Commit `.env.example` and `backend/.env.example` only.
- Ensure `.env` and `backend/.env` are gitignored.
- Decide whether the canonical runtime env is only project root `.env`.
- If root `.env` is canonical, remove the need for backend `.env` in deployed operation or document backend `.env` as local-dev only.
- Add a runbook section for reconstructing `.env` safely without printing secrets.
- Run `scripts/app-platform secrets garden-roof-deck` before completion and document expected findings.

## UX notes

The immediate user-visible outcome should be boring reliability:

- Expo Go link works after running the standard command.
- AI warning is specific enough to guide action.
- A healthy backend does not produce “no AI” because of client URL mismatch.
- After EC2 reboot, API/Caddy recovery is either automatic or has one documented command.

## Risks

- Expo CLI behavior can vary by SDK/version; script should remain simple and easy to edit.
- Dynamic Tailscale IP detection may fail if Tailscale is disconnected; fail loudly with a helpful message.
- Restart policies may mask crash loops; health checks and logs must remain easy to inspect.
- Any env handling changes risk exposing secrets; commands and docs must redact keys.

## Open questions

1. Should the canonical Expo Go port remain `8081`, or should we use a Garden-specific port such as `8087` to avoid conflicts?
2. Should root `.env` fully replace `backend/.env`, with backend `.env` kept only as a developer convenience?
3. Should platform Caddy restart persistence be implemented in this same work block or as a platform-hardening follow-up?
4. Do we want an in-app diagnostics screen now, or only smarter warning copy in the camera flow for this pass?
