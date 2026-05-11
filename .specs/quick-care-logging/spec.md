# Quick Care Logging Spec

## Summary

Add lightweight care logging to the Plant Detail `Care` tab so Daniel can quickly record common actions like watering, fertilizing, pruning, repotting, rotating, harvesting, and pest checks. This builds on the Care Section Foundation, which made the Care tab a read-only dashboard. This spec adds the first mutation flow: manual, local-first creation of `CareEventRecord`s.

This is the second of four care-related specs:

1. Care section foundation — implemented.
2. Quick care logging — current spec.
3. AI care recommendations — next.
4. Care profile / plant preferences — later.

## Product intent

The Care tab should not only answer “what should I do next?”; it should also make it extremely easy to say “I did it.”

Quick logging should feel faster than writing a journal entry:

- tap a care type,
- optionally add a short note,
- save,
- immediately see it in the care history.

## Goals

- Add a visible quick logging entry point to Plant Detail `Care`.
- Let the user create a care event for the current plant.
- Support common care event types:
  - watered,
  - fertilized,
  - pruned,
  - repotted,
  - rotated,
  - harvested,
  - pest check,
  - other.
- Allow an optional note.
- Default event date to today.
- Persist to local SQLite via existing `care_events` table.
- Refresh the Care tab after saving.
- Keep the flow mobile-first and low-friction.
- Do not require backend or AI calls.

## Non-goals

- No AI-generated recommendations in this slice.
- No accepting/dismissing/completing recommendations yet.
- No recurring care schedules.
- No notifications/reminders.
- No calendar integration.
- No care profile preferences yet.
- No photo attachment to care event yet.
- No cloud sync.

## Existing state

`CareEventRecord` already exists:

```ts
type CareEventRecord = {
  id: string;
  plantId: string;
  observationId?: string | null;
  eventType: string;
  eventDate: string;
  note?: string | null;
  source: 'manual' | 'ai_suggested' | 'system';
};
```

SQLite already has `care_events` with mutable columns. Plant Detail already loads `careEvents` and the Care Section Foundation renders them newest first.

## Proposed UX

### Entry point

At the top of the Care tab, below or near the Next Action card, show a compact quick-log row or button:

- `Log care`
- or chips: `Watered`, `Fertilized`, `Pruned`, `More…`

Recommended first implementation:

- show a small `Log care` button/card,
- tapping expands an inline composer in the Care tab.

Inline composer avoids introducing navigation/modal complexity while the feature is still small.

### Composer

Composer fields:

- care type chips:
  - Watered
  - Fertilized
  - Pruned
  - Repotted
  - Rotated
  - Harvested
  - Pest check
  - Other
- optional note input,
- date defaults to today as text for now,
- actions:
  - `Save care`
  - `Cancel`

V1 can skip date picker. Default today is enough. A later pass can add edit date if needed.

### After save

- Create `CareEventRecord` with `source='manual'`.
- Clear composer.
- Refresh/reload Plant Detail record.
- New event appears in Care history immediately.
- Optional small success copy: `Care logged.`

### Failure state

If persistence fails:

- keep composer open,
- show concise error: `Could not save care. Try again.`
- do not lose typed note.

## Data design

Add repository method, likely in a new or existing care repository:

```ts
createCareEvent(input: {
  id: string;
  plantId: string;
  eventType: string;
  eventDate: string;
  note?: string | null;
  source?: 'manual';
}): Promise<CareEventRecord>
```

Recommended file:

```text
src/features/garden-records/repositories/CareEventRepository.ts
```

Use current local date in `YYYY-MM-DD` format. Keep source as `manual`.

No schema migration should be required unless implementation discovers missing columns.

## Event types

Store normalized event type values:

- `watered`
- `fertilized`
- `pruned`
- `repotted`
- `rotated`
- `harvested`
- `pest_check`
- `other`

Display labels can map these back to friendly text.

## UI integration

Update `CareSection` to accept an `onCareLogged` callback or `reload` function from `usePlantDetailRecord`.

Current Plant Detail hook returns `{ data, loading, error, reload }`. Use `reload()` after successful save.

Implementation can keep composer inside `PlantDetailScreen.tsx` initially, but repository logic should live outside the screen.

## Testing strategy

Frontend/unit:

- repository creates care event with normalized fields,
- quick-log helper maps labels/types correctly,
- Plant Detail/Care composer state is type-safe; full component test optional.

Validation:

- `npm run typecheck`
- `npm test -- --runInBand`
- `npm run build:web && npm run smoke:web`

Manual:

- In Expo Go, open Plant Detail → Care.
- Log `Watered` with no note.
- Confirm it appears in Care history.
- Log `Pest check` with a note.
- Confirm note appears and persists after navigating away/back.

## Open questions

- Should quick chips be visible immediately or hidden behind `Log care`? Recommendation: visible `Log care` button first, then inline composer.
- Should date editing be included in v1? Recommendation: no; default today.
- Should logging a care action complete a matching recommendation? Recommendation: not in this spec; handle in AI care recommendations or recommendation actions spec.
- Should care logging also create an `ObservationRecord`? Recommendation: no for v1; keep care events independent unless later timeline integration requires it.
