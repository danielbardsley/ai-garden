# Plant Records Storage Decisions

## Decision 1 — Local-first SQLite for v1

Use on-device SQLite for plant records, observations, photo metadata, care history, AI labels, and conversation shells.

Rationale: the user prefers local storage for now and wants to defer cloud storage. SQLite is structured enough for timeline/gallery queries while keeping the app offline-capable.

## Decision 2 — Store image metadata, not image blobs

SQLite stores local URI, thumbnail URI, dimensions, timestamps, tags, and associations. It should not store large binary image blobs.

Rationale: media files belong in the device file/media layer; SQLite should index and relate them.

## Decision 3 — Use UUIDs and tombstones from the start

Use stable UUID primary keys and `created_at`, `updated_at`, `deleted_at` on mutable entities.

Rationale: this keeps future cloud sync possible without a painful ID migration.

## Decision 4 — Separate human facts from AI-derived output

AI labels, tags, identifications, recommendations, and conversation messages should be stored separately from core plant facts.

Rationale: AI output should be reviewable, replaceable, and auditable; it should not silently overwrite user-entered plant records.

## Decision 5 — Seed current design fixtures into SQLite for early implementation

The current design mock data should become deterministic seed/demo data when the database is empty.

Rationale: this lets the UI move from hardcoded fixtures to repository-backed data without losing the current look and testability.

## Decision 6 — Web export uses deterministic fixture fallback for now

Expo SQLite is used on native/device builds. Web static export currently uses deterministic fixture-backed repositories instead of SQLite because Expo SQLite's web bundle requires a WASM asset path that broke the platform web export.

Rationale: the user's storage goal is device-local SQLite. Keeping web export healthy matters for platform validation, and web persistence can be revisited separately if it becomes a product requirement.
