# Garden Roof Deck

Expo React Native bootstrap for tracking what Dan grows in his garden / roof deck over multiple years.

Managed by OpenClaw App Platform.

- App path: `/apps/garden-roof-deck/`
- API path: `/api/garden-roof-deck/`
- App kind: Expo React Native
- Bootstrap spec: `.specs/app-bootstrap/`

## Current scope

This repository is intentionally in bootstrap form. Visual design and theme are deferred to the next spec.

The scaffold anticipates future modules for:

- plant records by season/year and location/container
- image gallery capture/import
- camera and media permission flows
- AI-assisted plant photo labeling
- AI plant-care Q&A

## Scripts

```bash
npm run start
npm run web
npm run build:web
npm run smoke:web
npm run typecheck
```

## Future hosting paths

Expo web should remain compatible with path-prefix hosting:

- frontend: `/apps/garden-roof-deck/`
- API, if used: `/api/garden-roof-deck/`
