# Design Build-Out Acceptance

## Must pass

- Home, Gallery, Camera, and Plant Detail routes exist and render.
- Bottom navigation and camera FAB navigate between routes.
- Plant tiles navigate to plant detail.
- Gallery chips filter local mock data.
- Camera route shows mocked visual flow only; no camera permission or AI request.
- Ask AI tab is visual/static only; no live AI request.
- Design reflects the AI Garden handoff: earthy botanical palette, editorial serif-like headings, warm paper/forest surfaces, stylized plant/photo cards, organic shapes, floating bottom nav.
- Validation gates pass:
  - `npm run typecheck`
  - `npm run build:web`
  - `npm run smoke:web`
  - `scripts/app-platform validate`
  - `scripts/app-platform smoke garden-roof-deck`

## Should pass

- Web route remains safe under `/apps/garden-roof-deck/`.
- Expo Go route remains usable with the known Tailscale dev command when desired:
  `NODE_ENV=development REACT_NATIVE_PACKAGER_HOSTNAME=100.109.137.10 EXPO_UNSTABLE_HEADLESS=0 CI=0 npx expo start --lan --go --port 8085`

## Deferred

- Real camera/photo integration.
- Real AI chat/plant ID/care advice.
- Persistent garden records.
- Auth/profile/reminders/notifications.
- Weather/location integrations.
