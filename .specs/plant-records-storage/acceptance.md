# Plant Records Storage Acceptance

## Spec acceptance

- Defines local-first SQLite as the storage strategy.
- Covers current UI concepts:
  - plants
  - locations
  - seasons/years
  - observations/timeline entries
  - photos and gallery metadata
  - photo tags
  - AI identification results
  - care events and recommendations
  - per-plant AI conversations/messages
- Defines future sync-friendly ID/timestamp/tombstone strategy.
- Defines migration and seed/demo-data approach.
- Defines repository boundaries so UI is not coupled directly to SQL.

## Implementation acceptance for future work

- App initializes SQLite and runs v1 migrations idempotently.
- Empty database receives deterministic demo seed data once.
- Home, Plant Detail, and Gallery can render from repositories instead of hardcoded fixture arrays.
- Existing mocked Camera and Ask AI behavior remains mocked until their own specs.
- Validation passes:
  - `npm run typecheck`
  - `npm run build:web`
  - `npm run smoke:web`
  - `scripts/app-platform validate`
  - `scripts/app-platform smoke garden-roof-deck`
- Expo Go smoke test passes on the active development URL.

## Deferred

- Cloud sync.
- Auth/accounts.
- Remote media upload.
- Live AI calls.
- Real camera capture.
- Weather and reminders.
