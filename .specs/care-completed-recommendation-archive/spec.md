# Care Completed Recommendation Archive Spec

## Summary

Allow completed/dismissed care recommendations to be swiped away from the Care tab after they are no longer useful. This should hide them from the visible Care UI while preserving the database record for provenance/audit.

## Problem

Next Action completion now moves completed recommendations into the completed/dismissed section. That is useful for confirmation, but completed items can accumulate and clutter the Care tab. Users should be able to clear those completed recommendation cards with the same swipe-away interaction pattern.

## Product intent

- Active recommendation swipe/Mark done = mark completed.
- Completed recommendation swipe = archive/hide from visible list.

This keeps the Care tab focused on current and recent useful guidance while preserving historical records locally.

## Goals

- Add swipe-away interaction to completed/dismissed recommendation cards.
- Hide archived completed recommendations from the visible Care tab.
- Preserve records in SQLite using soft-delete or archive status.
- Keep completed recommendation removal local-only; no backend call.
- Add a fallback button such as `Hide` for accessibility/web/testing.
- Reuse the finger-following swipe behavior from Next Action where practical.

## Non-goals

- No permanent hard delete.
- No backend/AI endpoint.
- No undo queue in v1 unless trivial.
- No bulk clear button in v1.
- No care event mutation.
- No Tailscale/platform changes.

## Data model / persistence

Preferred implementation:

- Soft-delete completed recommendation by setting `deleted_at` and `updated_at`.
- Existing `PlantRepository.getPlantDetail` already filters `deleted_at IS NULL`, so hidden recommendations disappear after reload.

Repository API:

```ts
careRecommendationRepository.archiveRecommendation(recommendationId: string): Promise<void>
```

Implementation:

```sql
UPDATE care_recommendations
SET deleted_at = ?, updated_at = ?
WHERE id = ? AND deleted_at IS NULL;
```

Alternative considered:

- Add `status='archived'`.

Recommendation: use `deleted_at` because the existing schema already supports soft deletion and query filtering.

## UI behavior

For completed/dismissed recommendations:

- Card follows finger while swiping right.
- On successful threshold, card animates away.
- It is optimistically removed from local recommendation state.
- Repository archives it in background.
- If archive fails, restore it and show safe error copy.

Fallback action:

- Add compact `Hide` button on completed/dismissed recommendation cards.

Active recommendations should not use this archive interaction in this spec; active items are still managed through Next Action completion or future accept/dismiss flows.

## Tests

- Repository test for `archiveRecommendation` update.
- Care UI/helper behavior can be covered through existing visible list filtering or component-safe typecheck.
- Existing next action tests should continue passing.

## Validation

```bash
npm run typecheck
npm test -- --runInBand
npm run build:web && npm run smoke:web
```

## Manual acceptance

- Complete a Next Action so it appears in completed/dismissed.
- Swipe the completed card right, or tap Hide.
- Card follows finger and disappears.
- Navigate away/back; card remains hidden.
- Active recommendations and Next Action behavior remain unchanged.
