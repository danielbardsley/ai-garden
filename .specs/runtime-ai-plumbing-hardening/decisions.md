# Runtime + AI Plumbing Hardening Decisions

## Proposed decisions

### Canonical Expo Go API route

Use the Tailscale HTTPS Caddy route for native Expo Go API calls:

- Origin: `https://openclaw.tail8c3304.ts.net`
- API base path: `/api/garden-roof-deck/`

Rationale: this matches the deployed web/API front door, avoids direct host-port coupling, and is the route Daniel can use from a phone on the tailnet.

Status: accepted.

### API URL builder should tolerate accidental duplicate path

If `EXPO_PUBLIC_API_ORIGIN` accidentally includes `/api/garden-roof-deck`, the app should not produce `.../api/garden-roof-deck/api/garden-roof-deck`.

Rationale: this exact class of setup mistake can produce misleading “no AI” symptoms.

Status: accepted.

### Root `.env` is the Compose runtime source

Treat `/srv/projects/garden-roof-deck/.env` as the runtime env file used by Docker Compose. Treat `backend/.env` as local backend development only, or phase it out if it creates confusion.

Rationale: Compose already depends on root `.env`; keeping two active env files increases drift risk.

Status: accepted.

### Restart policy for app API containers

Use `restart: unless-stopped` for the Garden API container.

Rationale: after EC2 reboot, the API should come back without manual intervention. `unless-stopped` still respects deliberate operator stops.

Status: accepted.

### Diagnostics before Ask AI

Implement a small diagnostics/health classification layer before building Ask AI.

Rationale: Ask AI depends on the same API/AI plumbing; hardening now reduces false negatives and demo friction.

Status: accepted by direction from Daniel on 2026-05-09.

## Deferred decisions

- Caddy persistence is a separate platform follow-up; this pass records the dependency but only changes the Garden API service restart policy.
- Contextual warning copy only for this pass; full diagnostics screen is deferred until there is a recurring need.
- Expo Go standardizes on port `8081` for now; override with `EXPO_GO_PORT` if needed.
