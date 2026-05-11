# Home Weather Widget Acceptance

## Product acceptance

- [x] The existing static Home weather row is replaced in-place; no new Weather screen is introduced.
- [x] The widget still appears directly below the Home greeting and above `On your list today`.
- [x] The widget keeps the same simple compact card structure: icon, two text lines, and `week N` marker.
- [x] The `week N` marker counts from the garden setup creation date when available.
- [x] The primary line uses live current weather instead of hard-coded `62°F · partly sun`.
- [x] The secondary line uses concise live garden context plus the resolved zone instead of hard-coded `Last frost 22 days ago · zone 7a`.
- [x] The resolved zone is labeled with its type, such as `USDA zone 7b`.
- [x] Location permission request explains that location is used for local weather and zone.
- [x] Permission denied/unavailable state is graceful and does not expand or break the widget.
- [x] Weather and zone failures are handled independently where possible.
- [ ] No precise location is persisted unless explicitly added as a user-controlled saved location flow.

## Technical acceptance

- [x] Current weather uses a free provider, preferably Open-Meteo, unless implementation findings justify another free provider.
- [x] Zone lookup uses a free source/estimate or falls back clearly to `zone unknown` without guessing.
- [x] Weather and zone provider responses are normalized into app-owned types.
- [x] Tests cover condition labels, widget copy formatting, normalization, key error states, and garden-age week labels.
- [x] Path-prefix web behavior remains compatible with `/apps/garden-roof-deck/`.
- [ ] Backend API behavior is covered by tests if backend endpoints are added.

## Validation results

- `npm run typecheck` passed.
- `npm test -- --runInBand` passed: 18 suites / 69 tests.
- `npm run build:web && npm run smoke:web` passed.
- Manual Expo Go location check remains pending.
- Expo crash follow-up: added `expo-location` plugin/permission config and guarded async native import; validation still passes.
