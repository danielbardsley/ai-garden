# Garden Roof Deck / AI Garden

Expo React Native app for tracking what Dan grows in his garden / roof deck over multiple years, with local-first garden records and AI-assisted photo/care workflows.

Managed by OpenClaw App Platform.

- App path: `/apps/garden-roof-deck/`
- API path: `/api/garden-roof-deck/`
- App kind: Expo React Native
- Bootstrap spec: `.specs/app-bootstrap/`

## Current scope

The app now includes:

- local SQLite plant, observation, photo, care, recommendation, and AI conversation records
- mobile camera capture through Expo Go with local photo saves
- AI photo identification/categorization plumbing through the FastAPI backend
- plant-scoped Ask AI chat
- AI-assisted care profiles and care recommendations
- weather/zone context for the home screen
- Expo web static export for hosted preview paths

Still intentionally deferred:

- photo-library import / media picker flows
- reminders and user profile screens
- cloud sync and multi-device conflict handling

## Scripts

```bash
npm run start
npm run start:go:tailscale
npm run web
npm run build:web
npm run smoke:web
npm run typecheck
npm test -- --runInBand
```

Backend tests:

```bash
cd backend
python -m pytest -q
```

## Hosting paths

Expo web should remain compatible with path-prefix hosting:

- frontend: `/apps/garden-roof-deck/`
- API: `/api/garden-roof-deck/`

## Runtime + AI plumbing

See `docs/runtime-ai-plumbing.md` for Expo Go over Tailscale, AI health diagnostics, runtime env expectations, and restart persistence.
