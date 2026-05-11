# Profile Section Spec

## Summary

Implement the Profile section for Garden Roof Deck / AI Garden. Profile should be the home for user/garden settings, including editing the garden created during onboarding.

## Answer to product question

Yes — Profile is a good place to edit the garden created during onboarding. The onboarding setup is a user-owned configuration object, not a one-time-only wizard artifact. Profile should expose it as “Garden profile” / “Garden setup” so the user can correct name, location, USDA zone, sun exposure, and growing spaces after setup.

## Goals

- Add a real Profile route/screen reachable from bottom navigation.
- Show the current garden setup summary:
  - garden name
  - location
  - hardiness zone
  - sun exposure
  - growing spaces
  - garden created date/week context if useful
- Allow editing the garden setup values captured during onboarding:
  - name
  - location label
  - hardiness zone
  - sun exposure
  - growing spaces
- Preserve onboarding-created metadata where appropriate:
  - `id`
  - `createdAt`
  - existing coordinates/source fields unless user explicitly changes location manually
- Save changes through `GardenSetupRepository.saveSetup` so native SQLite and web localStorage stay consistent.
- Keep “Use current location” available from Profile edit, using the same opt-in location detection service as onboarding.
- Keep UI calm and settings-oriented, not another onboarding flow.

## Non-goals

- No account/login/profile identity yet.
- No cloud sync/account settings yet.
- No reminders implementation in this feature.
- No destructive reset/delete garden action in the first version.
- No migration of existing setup records beyond normal save behavior.

## UX proposal

### Bottom nav

- Profile tab routes to `/profile` and has active state on that route.

### Profile screen sections

1. Header
   - Title: `Profile`
   - Subtitle/copy: settings for this garden journal.

2. Garden profile card
   - Shows garden name and location.
   - Metadata chips/rows for USDA zone, sun exposure, growing spaces, and created date/week.
   - Primary action: `Edit garden setup`.

3. Future placeholders (intentionally non-functional or clearly marked)
   - Preferences / AI style, reminders, export/sync can be listed as “Coming later” only if useful, but avoid fake controls.

### Edit garden setup

Use an inline edit panel or modal-like screen state on `/profile` with fields:

- Garden name text input
- Location text input
- “Use current location” action
- Hardiness zone chips/dropdown using existing `hardinessZones`
- Sun exposure choices using existing `sunExposureOptions`
- Growing space multi-select using existing `growingSpaceOptions`
- Save and Cancel actions

Validation:

- Garden name required.
- Location label required.
- Zone may be `Not sure`/blank.
- Growing spaces optional.

Save behavior:

- Manual edits to location label set `locationSource = 'manual'` and clear coordinates only if the user changed the label manually from the saved value.
- Location detection sets `locationSource = 'detected'`, coordinates, detected label, and detected zone when available.
- Saving preserves `createdAt` through repository existing-setup behavior.

## Data model notes

Current `GardenSetup` already contains the needed fields after onboarding/location detection:

- `name`
- `locationLabel`
- `locationSource`
- `latitude` / `longitude`
- `hardinessZone`
- `hardinessZoneSource`
- `sunExposure`
- `growingSpaces`
- `createdAt` / `updatedAt`

No new schema should be required for the first Profile version.

## Testing

Add tests for pure view-model helpers if created, especially:

- profile summary formatting
- edit draft save normalization if separated from UI

UI implementation is React Native/Expo heavy, so pure helper tests are preferred over brittle component tests.

## Risks

- Profile edit should not accidentally reset `createdAt`; rely on repository behavior and avoid clearing setup before saving.
- Location detection in Profile must remain opt-in.
- Avoid adding fake account/profile controls that look real but do nothing.
