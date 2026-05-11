# Runtime + AI Plumbing Hardening Tasks

## Spec and planning

- [x] Create feature spec directory.
- [x] Capture current brittle points from reboot/Expo Go debugging.
- [x] Resolve open questions with Daniel or make explicit implementation defaults.

## Expo Go runtime script

- [x] Add `scripts/start-expo-go-tailscale.sh` or equivalent package script.
- [x] Ensure script sets `NODE_ENV=development`.
- [x] Ensure script discovers/uses Tailscale IPv4 for `REACT_NATIVE_PACKAGER_HOSTNAME`.
- [x] Ensure script sets canonical native API env:
  - `EXPO_PUBLIC_API_ORIGIN=https://openclaw.tail8c3304.ts.net`
  - `EXPO_PUBLIC_API_BASE_PATH=/api/garden-roof-deck/`
  - `EXPO_PUBLIC_BASE_PATH=/apps/garden-roof-deck/`
- [x] Print Expo Go URL and health URL when possible.
- [x] Document manual fallback command.

## Client API URL hardening

- [x] Update `src/services/platform.ts` URL composition.
- [x] Prevent duplicate `/api/garden-roof-deck` if origin includes path accidentally.
- [x] Keep web same-origin behavior.
- [x] Add/update tests for URL composition.

## Diagnostics and AI warning copy

- [x] Add health/diagnostics client service.
- [x] Classify API unreachable vs AI unconfigured vs AI request failed.
- [x] Update camera flow warning/error copy to use classified diagnostics.
- [x] Avoid leaking raw errors/secrets in UI.
- [x] Add tests for diagnostics classification where practical.

## Backend health contract

- [x] Verify `/health` has safe agent fields.
- [x] Add/update backend tests for configured and unconfigured agent state.
- [x] Consider whether `/agent/status` is needed; defer unless there is a UI need.

## Restart persistence

- [x] Add `restart: unless-stopped` to Garden API Compose service.
- [x] Verify `docker compose config` accepts the compose file.
- [x] Recreate/restart service and verify restart policy via `docker inspect`.
- [x] Record platform Caddy persistence as platform follow-up or implement in platform repo if in scope.

## Env durability and secret hygiene

- [x] Confirm `.env` and `backend/.env` are ignored.
- [x] Ensure `.env.example` files are committed and do not contain real secrets.
- [x] Document canonical runtime env file and backend local-dev env expectations.
- [x] Add a safe `.env` reconstruction runbook that does not print secrets.
- [x] Run platform secret scan and address or document findings.

## Validation

- [x] `npm run typecheck`
- [x] `npm test` or targeted frontend tests
- [x] backend pytest suite
- [x] `docker compose config`
- [x] `scripts/app-platform validate`
- [x] `scripts/app-platform smoke garden-roof-deck`
- [x] Local health route returns 200 and `agentConfigured=true` when configured.
- [x] Tailscale health route returns 200.
- [ ] Expo Go packager `/status` reachable over Tailscale. Manual/start-script validation remains for Daniel when ready to reload Expo Go.
- [ ] Manual Expo Go smoke: app opens and AI warning is absent when backend configured/reachable. Requires Daniel’s phone/Expo Go session.

## Delivery

- [x] Update `acceptance.md` with validation results.
- [x] Update `decisions.md` with final choices.
- [ ] Commit checkpoint before larger Ask AI work. Deferred until Daniel approves committing the broader pre-existing uncommitted feature set.
