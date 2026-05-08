# Plant Records Storage Spec

## Summary

Add a local-first SQLite storage model for Garden Roof Deck. The goal is to support the current UI's real data needs while keeping the implementation device-local for now. The schema should cover plants, growing locations, observations/timeline entries, photos, care events, AI-derived labels/tags, and lightweight AI conversation history. The model should be designed so future cloud sync can be added without replacing the core app data model.

This spec is for data modeling and storage behavior only. It does not implement cloud sync, real AI calls, camera capture, weather integration, or push reminders.

## Goals

- Replace hardcoded design fixture data with a durable local SQLite model.
- Support the current screens:
  - Home dashboard: active plants, statuses, “on your list today,” latest entries.
  - Plant detail: plant profile, timeline, photos, care notes/history, per-plant AI context.
  - Gallery: photo grid filterable by plant, date, and eventually location.
  - Camera flow: future photo capture can save a photo/observation and optional AI plant match.
- Preserve local-first behavior: the app works offline and stores data on-device.
- Keep cloud sync possible later through stable UUIDs, timestamps, tombstones, and sync metadata.
- Keep schema legible and easy to migrate.

## Non-goals

- No cloud backend or account system in this phase.
- No multi-device sync implementation.
- No actual image upload or remote media storage.
- No live AI provider integration.
- No real camera implementation.
- No weather provider integration.
- No notification/reminder scheduler implementation.

## Technology choice

Use SQLite on device.

Recommended Expo package:

- `expo-sqlite`

Storage layer should be isolated behind a small repository/service API so future migration to synced storage can reuse app screens and domain models.

## Data modeling principles

- Every domain row gets a stable `id` UUID generated on-device.
- Every mutable row gets:
  - `created_at`
  - `updated_at`
  - `deleted_at` nullable tombstone for future sync/conflict handling.
- Prefer additive migrations with integer schema versions.
- Avoid putting large binary image blobs in SQLite. Store local URI/file references and metadata in SQLite.
- Store derived AI outputs separately from human-entered facts.
- Keep dates as ISO-8601 strings in UTC where they are timestamps; use local-date strings (`YYYY-MM-DD`) for garden dates like planted date or observation date.
- Keep enum-like values as text with app-level validation.

## Core entities

### Plant

A plant record represents one tracked growing subject. It can be a single plant, pot, container, crop variety, or repeated seasonal planting depending on user preference.

Fields:

- `id` UUID primary key.
- `display_name` text, e.g. `Sungold`, `Genovese`, `Meyer`.
- `common_name` text nullable, e.g. `Cherry tomato`.
- `scientific_name` text nullable, e.g. `Solanum lycopersicum`.
- `variety_name` text nullable.
- `description` text nullable.
- `status_kind` text: `good`, `warn`, `idle`, `archived`.
- `status_label` text nullable, e.g. `Fruiting`, `Watch`.
- `next_action_label` text nullable, e.g. `Water tomorrow`.
- `location_id` UUID nullable FK to `locations`.
- `planted_date` local date nullable.
- `started_year` integer nullable.
- `archived_at` timestamp nullable.
- `cover_photo_id` UUID nullable FK to `photos`.
- `glyph` text nullable, short display stamp like `St`.
- `primary_color` text nullable hex.
- `secondary_color` text nullable hex.
- `sort_order` integer nullable.
- `created_at`, `updated_at`, `deleted_at`.

Supports UI:

- Home plant grid.
- Plant detail header/profile.
- Status chips and today list.
- Gallery filters.
- Future archived seasons.

### Location

A named growing place on the roof deck/garden.

Fields:

- `id` UUID primary key.
- `name` text, e.g. `South planter`, `Kitchen rail box`.
- `kind` text nullable: `container`, `bed`, `rail_box`, `hanging_basket`, `indoor`, `other`.
- `description` text nullable.
- `sun_exposure` text nullable: `full_sun`, `part_sun`, `shade`, `unknown`.
- `sort_order` integer nullable.
- `created_at`, `updated_at`, `deleted_at`.

Supports UI:

- Plant detail location row.
- Gallery filtering by location later.
- Weather/care context later.

### Season

Optional season grouping for multi-year tracking.

Fields:

- `id` UUID primary key.
- `year` integer not null.
- `name` text nullable, e.g. `2026 roof deck`.
- `notes` text nullable.
- `started_on` local date nullable.
- `ended_on` local date nullable.
- `created_at`, `updated_at`, `deleted_at`.

Supports UI:

- Timeline grouped by year.
- Future year-over-year comparisons.

### Observation

A timeline entry. This is the primary journal/event row. A photo can exist without an observation, but most captured photos should be associated with one.

Fields:

- `id` UUID primary key.
- `plant_id` UUID nullable FK to `plants`.
- `season_id` UUID nullable FK to `seasons`.
- `location_id` UUID nullable FK to `locations`.
- `observed_on` local date not null.
- `observed_at` timestamp nullable.
- `title` text nullable.
- `note` text nullable.
- `kind` text: `photo`, `note`, `care`, `harvest`, `issue`, `milestone`, `ai_identification`, `other`.
- `mood` text nullable: `good`, `watch`, `problem`, `neutral`.
- `height_value` real nullable.
- `height_unit` text nullable.
- `created_at`, `updated_at`, `deleted_at`.

Supports UI:

- Plant detail timeline.
- Home latest-entry summaries.
- Gallery date grouping.
- Future measurements and issue history.

### Photo

Metadata for a locally stored image or imported media item.

Fields:

- `id` UUID primary key.
- `observation_id` UUID nullable FK to `observations`.
- `plant_id` UUID nullable FK to `plants` for direct filtering.
- `location_id` UUID nullable FK to `locations`.
- `local_uri` text not null.
- `thumbnail_uri` text nullable.
- `mime_type` text nullable.
- `width` integer nullable.
- `height` integer nullable.
- `taken_at` timestamp nullable.
- `captured_on` local date nullable.
- `source` text: `camera`, `library`, `import`, `generated_placeholder`.
- `is_cover_candidate` integer boolean default 0.
- `created_at`, `updated_at`, `deleted_at`.

Supports UI:

- Gallery grid.
- Plant cover cards.
- Lightbox.
- Future camera capture.

### Photo tag

Human or AI-generated tags for photos.

Fields:

- `id` UUID primary key.
- `photo_id` UUID not null FK to `photos`.
- `tag` text not null.
- `source` text: `manual`, `ai`, `system`.
- `confidence` real nullable, 0.0–1.0.
- `created_at`, `updated_at`, `deleted_at`.

Supports UI:

- Lightbox “AI auto-tags”.
- Gallery search/filter later.

### AI plant identification

A structured AI result from a photo. This is separate from a confirmed plant record because AI suggestions should not automatically overwrite user data.

Fields:

- `id` UUID primary key.
- `photo_id` UUID not null FK to `photos`.
- `observation_id` UUID nullable FK to `observations`.
- `suggested_common_name` text nullable.
- `suggested_scientific_name` text nullable.
- `suggested_variety_name` text nullable.
- `confidence` real nullable.
- `raw_summary` text nullable.
- `accepted_plant_id` UUID nullable FK to `plants`.
- `accepted_at` timestamp nullable.
- `created_at`, `updated_at`, `deleted_at`.

Supports UI:

- Camera “Pretty sure I know this one” result bubble.
- Save to existing plant / create new plant.
- Future AI auditability.

### Care event

A structured care action or care history item.

Fields:

- `id` UUID primary key.
- `plant_id` UUID not null FK to `plants`.
- `observation_id` UUID nullable FK to `observations`.
- `event_type` text: `water`, `fertilize`, `prune`, `repot`, `inspect`, `treat_pests`, `harvest`, `move`, `other`.
- `event_date` local date not null.
- `note` text nullable.
- `source` text: `manual`, `ai_suggested`, `system`.
- `created_at`, `updated_at`, `deleted_at`.

Supports UI:

- Plant detail Care tab.
- Timeline care history.
- Future reminders.

### Care recommendation

A local record of a recommendation, usually AI-generated later, that the user can accept/dismiss.

Fields:

- `id` UUID primary key.
- `plant_id` UUID nullable FK to `plants`.
- `observation_id` UUID nullable FK to `observations`.
- `recommendation_type` text: `water`, `prune`, `fertilize`, `inspect`, `diagnose`, `other`.
- `title` text not null.
- `body` text nullable.
- `due_on` local date nullable.
- `status` text: `suggested`, `accepted`, `dismissed`, `completed`.
- `source` text: `manual`, `ai`, `system`.
- `created_at`, `updated_at`, `deleted_at`.

Supports UI:

- Home “On your list today”.
- Future reminder scheduling.

### AI conversation

A per-plant or general garden conversation container.

Fields:

- `id` UUID primary key.
- `plant_id` UUID nullable FK to `plants`.
- `title` text nullable.
- `scope` text: `plant`, `garden`, `photo`.
- `created_at`, `updated_at`, `deleted_at`.

### AI message

Message history for local display/context. Store lightweight content only; do not store provider secrets.

Fields:

- `id` UUID primary key.
- `conversation_id` UUID not null FK to `ai_conversations`.
- `role` text: `user`, `assistant`, `system`.
- `body` text not null.
- `photo_id` UUID nullable FK to `photos`.
- `created_at`, `updated_at`, `deleted_at`.

Supports UI:

- Plant detail Ask AI tab.
- Future AI continuity per plant.

### App setting

Small key-value table for local settings.

Fields:

- `key` text primary key.
- `value_json` text not null.
- `updated_at` timestamp not null.

Initial uses:

- schema initialization marker.
- default theme.
- garden zone/location label later.
- migration status.

## Proposed schema tables

- `schema_migrations`
- `app_settings`
- `locations`
- `seasons`
- `plants`
- `observations`
- `photos`
- `photo_tags`
- `ai_plant_identifications`
- `care_events`
- `care_recommendations`
- `ai_conversations`
- `ai_messages`

## Suggested indexes

- `plants(status_kind)`
- `plants(location_id)`
- `plants(deleted_at)`
- `observations(plant_id, observed_on desc)`
- `observations(location_id, observed_on desc)`
- `observations(kind, observed_on desc)`
- `photos(plant_id, captured_on desc)`
- `photos(location_id, captured_on desc)`
- `photos(observation_id)`
- `photo_tags(photo_id)`
- `photo_tags(tag)`
- `care_events(plant_id, event_date desc)`
- `care_recommendations(status, due_on)`
- `ai_conversations(plant_id, updated_at desc)`
- `ai_messages(conversation_id, created_at)`

## Domain model mapping

Initial TypeScript domain models should map closely to SQLite rows but avoid leaking SQL details into UI components.

Recommended modules:

- `src/features/storage/database.ts`
  - opens SQLite DB
  - runs migrations
  - exposes transaction helpers
- `src/features/storage/migrations/`
  - versioned migration SQL or TS migration functions
- `src/features/garden-records/models/`
  - TypeScript types for Plant, Location, Observation, Photo, CareEvent, etc.
- `src/features/garden-records/repositories/`
  - `PlantRepository`
  - `ObservationRepository`
  - `PhotoRepository`
  - `CareRepository`
  - `AiContextRepository`
- `src/features/garden-records/seed/`
  - one-time seed from current design fixture data for development/demo

## Repository API requirements

The first implementation slice should support:

- initialize database and run migrations.
- seed demo data once if database is empty.
- list active plants for home grid.
- list plants requiring attention for today list.
- get plant by id.
- get plant timeline grouped/sortable by observed date.
- list gallery photos with optional plant filter.
- get or create per-plant AI conversation shell.

Future APIs:

- create/update/archive plant.
- create observation.
- attach photo metadata to observation.
- create care event.
- create care recommendation.
- store AI tags/identification results.

## Migration strategy

Use a simple integer schema migration table:

`schema_migrations(version integer primary key, applied_at text not null)`

Migration v1 should create all core tables and indexes. Later migrations should be additive where possible.

## Seed/demo data strategy

Because the current UI is based on fixture plants, migration to real storage should include a dev/demo seed that inserts equivalent records into SQLite when no plants exist.

Rules:

- Seed only when the plants table is empty.
- Mark generated placeholder photos with `source = 'generated_placeholder'` and local URI values that clearly indicate placeholder data.
- Keep seed deterministic so screenshots and smoke tests remain stable.
- Do not re-seed after the user has created real data.

## Future cloud sync compatibility

Not implemented now, but keep the model ready:

- UUID primary keys.
- `created_at`, `updated_at`, `deleted_at` on mutable tables.
- Do not depend on SQLite autoincrement IDs in app code.
- Consider adding later:
  - `sync_state`
  - `remote_id`
  - `last_synced_at`
  - `device_id`
  - conflict metadata

No sync columns are required in v1 unless they simplify implementation.

## Acceptance criteria

- Spec exists under `.specs/plant-records-storage/` with tasks, decisions, and acceptance criteria.
- Schema supports every current UI concept without requiring fake component-local data long-term.
- Schema supports future camera/gallery/AI/weather-adjacent features without overbuilding cloud sync.
- Implementation plan is local-first SQLite.
- No implementation is done as part of this spec-writing task.
