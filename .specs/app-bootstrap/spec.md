# Garden Roof Deck — Expo App Bootstrap Spec

## Status

Draft bootstrap spec. Design and theme are intentionally out of scope until the follow-up design spec.

## Purpose

Create the initial Expo React Native application scaffold for tracking what Dan grows in his garden / roof deck over multiple years.

The app will eventually support:

- a longitudinal plant/garden log
- image gallery capture and browsing
- camera-backed plant/photo submissions
- AI-assisted plant labeling and plant-care Q&A

This spec covers only the initial app bootstrap and project structure needed to support future feature specs.

## App identity

- Working app slug: `garden-roof-deck`
- App kind: Expo React Native app
- Project path: `/srv/projects/garden-roof-deck`
- Platform app registry status: active after scaffold validation
- Expected frontend base path for Expo web, if hosted later: `/apps/garden-roof-deck/`
- Expected API base path, if backend is added later: `/api/garden-roof-deck/`

## Scope

### In scope

- Create a new standalone project repository at `/srv/projects/garden-roof-deck`.
- Bootstrap an Expo React Native app scaffold.
- Keep the initial app minimal and design-neutral.
- Establish folders for future app modules without implementing full features.
- Include basic configuration for camera/media permissions placeholders.
- Include notes for future AI, gallery, and plant-care integration.
- Make Expo web path/base-path considerations explicit for future hosted deployment.
- Add minimal README and project metadata.

### Out of scope

- Visual design, theme, typography, color palette, spacing system, or branding.
- Production gallery implementation.
- Plant database/schema implementation.
- AI agent implementation.
- Backend/API implementation.
- Authentication/account sync.
- Cloud photo storage.
- Native app store packaging.
- Platform registry/deployment unless explicitly requested after scaffold creation.

## Initial user stories

- As Dan, I want a clean app scaffold ready for a garden/roof-deck tracking app.
- As Dan, I want the project to anticipate photo capture and gallery browsing without committing to UI design yet.
- As Dan, I want future AI features to be planned around plant labeling and plant-care questions.
- As Dan, I want the Expo app to be web-hostable under a path prefix later.

## Functional placeholders

The bootstrap app should include only simple placeholder screens or files for future areas:

- Home / garden overview placeholder
- Gallery placeholder
- Plant-care AI placeholder
- Settings/permissions placeholder, if navigation is included

The placeholder UI should remain intentionally plain.

## Camera and media access notes

Future implementation will need:

- camera permission request flow
- media library/image picker flow
- image metadata capture where useful
- graceful no-permission states
- web fallback behavior for file upload/camera capture

The bootstrap should include dependency/config planning but does not need to request permissions until the feature is implemented.

## AI integration notes

Future implementation will likely need two AI modes:

1. Vision-assisted labeling for submitted plant/garden photos.
2. Conversational plant-care Q&A with enough context about Dan's historical garden records.

The bootstrap should leave integration points for:

- image submission payloads
- structured plant observations
- care-question prompts
- backend proxy or hosted agent API

No AI provider should be hard-coded in the bootstrap spec.

## Data direction

Future data model concepts may include:

- growing season / year
- location or container/bed/roof-deck area
- plant variety
- planting date
- observations
- harvest notes
- photos
- AI labels and confidence
- care recommendations

No durable schema is required for the bootstrap.

## Technical constraints

- Use Expo / React Native.
- Prefer TypeScript.
- Keep the app base-path aware for future Expo web hosting.
- Avoid committing design choices before the design spec.
- Keep code structure legible and expandable.
- Avoid global dependency installation; use project-local package management.

## Open questions

- Final app name and slug.
- Whether this should have a backend immediately or start local-only.
- Whether photos should be stored locally, synced, or uploaded.
- Preferred AI provider / OpenClaw agent integration path.
- Whether plant records are private-only or shareable.
- Whether roof deck zones/containers need a map-style representation.


## Implementation notes

- Scaffolded with `scripts/app-platform create garden-roof-deck --kind expo --register`.
- Added `package.json` `main: expo-router/entry` so Expo Router web export resolves correctly.
- Added `tsconfig.json` extending `expo/tsconfig.base` so `npm run typecheck` performs a real TypeScript validation.
- Added `expo.experiments.baseUrl: /apps/garden-roof-deck` so Expo web export emits path-prefix-safe asset URLs.
- Added plain placeholders for plant records, image gallery, AI care assistant, and permissions planning.
