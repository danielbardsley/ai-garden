# Care Next Action Completion Spec

## Summary

Allow the user to complete or dismiss the current Care tab `Next Action` directly from the highlighted card. The primary interaction should be a swipe-away gesture. Completing the promoted recommendation should remove it from the current Next Action position and promote the next most important recommendation.

## Problem

The Care tab now promotes one active recommendation into `Next Action` and dedupes it from the Recommendations list. However, once the user completes that action, there is no direct way to clear it from the top card. The user needs a fast “done” gesture so the Care tab can advance to the next thing.

## Product intent

The Care tab should behave like a lightweight care queue:

1. Show the most important action at the top.
2. User completes it.
3. User swipes it away.
4. The next recommendation is promoted automatically.

This should make Care feel actionable rather than just informational.

## Goals

- Add a swipe-away completion interaction for Next Action when it is backed by a recommendation.
- Mark the promoted recommendation as `completed` locally.
- Refresh/recompute Care tab so the next active recommendation becomes Next Action.
- Preserve inactive/completed recommendation visibility in the lower section.
- Provide a non-gesture fallback button for accessibility and web/dev ergonomics.
- Avoid creating care events automatically in v1.
- Preserve plant fallback Next Action behavior when no recommendation backs the card.

## Non-goals

- No backend endpoint.
- No AI call.
- No automatic care event creation.
- No reminder/scheduler engine.
- No undo queue in v1 unless trivial.
- No recommendation dismissal workflow beyond completion.
- No Tailscale/platform routing changes.

## Current state

Care Next Action Deduplication added:

- selected Next Action carries `recommendationId` when backed by a recommendation,
- that promoted recommendation is hidden from active Recommendations,
- remaining active recommendations appear below.

This spec builds on `recommendationId` to mutate that recommendation's local status.

## Proposed behavior

### Swipe interaction

When Next Action is backed by a recommendation:

- user swipes the card horizontally,
- UI marks recommendation as completed,
- card leaves the top position,
- next active recommendation becomes Next Action,
- completed recommendation appears in completed/dismissed section.

### Fallback interaction

Add a visible compact action, e.g.:

- `Mark done`

This supports:

- web testing,
- accessibility,
- devices/contexts where swipe is unreliable.

### Plant fallback case

If Next Action is derived from `plant.nextActionLabel` and has no `recommendationId`:

- do not show swipe-complete behavior,
- optionally show muted text: `Log care to update this action.`

## Data/persistence

Add repository support for updating recommendation status:

```ts
careRecommendationRepository.markCompleted(recommendationId: string): Promise<void>
```

Implementation:

- update `care_recommendations.status = 'completed'`,
- update `updated_at`,
- no care event insertion,
- no recommendation deletion.

Potential future extension:

- `dismissRecommendation(id)`
- `acceptRecommendation(id)`
- `completeRecommendationAndLogCare(...)`

## UI implementation notes

React Native swipe options:

- If existing dependencies already support swipe gestures, use them.
- Otherwise implement a lightweight `PanResponder` / `Animated` interaction directly in the card.
- Keep behavior conservative: require a clear horizontal threshold before completion.
- Also keep `Mark done` button regardless of swipe implementation.

Recommendation: implement button first and swipe second if gesture complexity threatens stability.

## Sorting / promotion

After completion:

- reload Plant Detail or locally update recommendation status,
- rebuild care action presentation,
- next active due/oldest recommendation is promoted by existing sorting.

No special new ranking required in this spec.

## Tests

Add/update tests for:

- `markCompleted` repository update.
- Next Action completion handler calls repository and reloads.
- helper behavior already ensures completed recommendation moves to inactive and next active item promotes.
- fallback plant next action has no completion affordance if practical to test.

## Validation

```bash
npm run typecheck
npm test -- --runInBand
npm run build:web && npm run smoke:web
```

## Manual acceptance

- Create or save two active care recommendations.
- Open Plant Detail → Care.
- First recommendation is in Next Action.
- Swipe it away or tap Mark done.
- The first recommendation moves to completed/dismissed section.
- The second recommendation becomes Next Action.
- No care event is created automatically.
