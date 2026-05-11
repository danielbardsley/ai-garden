# Runtime + AI Plumbing Runbook

## Expo Go over Tailscale

Use the project script so Expo Go gets the same API route every time:

```bash
npm run start:go:tailscale
```

The script:

- forces `NODE_ENV=development`
- detects the host Tailscale IPv4 address for `REACT_NATIVE_PACKAGER_HOSTNAME`
- sets `EXPO_PUBLIC_API_ORIGIN=https://openclaw.tail8c3304.ts.net`
- sets `EXPO_PUBLIC_API_BASE_PATH=/api/garden-roof-deck/`
- starts Expo Go on port `8081`

Expected Expo Go URL shape:

```text
exp://<tailscale-ip>:8081
```

Health check:

```bash
curl -sS https://openclaw.tail8c3304.ts.net/api/garden-roof-deck/health
```

A healthy AI-enabled backend returns `agentConfigured: true` without exposing any secret value.

## Runtime env files

Docker Compose uses the project-root `.env` file as the canonical runtime env file:

```text
/srv/projects/garden-roof-deck/.env
```

`backend/.env` is local backend development only. Do not rely on it for deployed Compose runtime.

Never print or commit real `.env` contents. Committed examples should use blank placeholders only:

- `.env.example`
- `backend/.env.example`

If root `.env` is missing, reconstruct it from a secure secret source using the example file as a shape. Do not paste keys into chat or logs.

## Restart persistence

The Garden API Compose service uses `restart: unless-stopped` so it can recover after host reboot once Docker starts.

Platform Caddy is owned by `/srv/projects/openclaw-app-platform`; persistence for that container should be handled in the platform repo or host service runbook.
