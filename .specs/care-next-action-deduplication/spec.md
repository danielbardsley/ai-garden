# Care Next Action Deduplication Spec

## Summary

Make the Care tab's `Next action` card act as the promoted top care recommendation, then remove that same item from the visible Recommendations list. This keeps the Care tab's command-center feel without showing the same recommendation twice.

## Problem

The Care tab currently has both:

- a featured `Next action` card, and
- a Recommendations section.

The Next Action is selected from active/due recommendations or a plant fallback. When it comes from a recommendation, the same recommendation can also appear in the Recommendations section, creating visual duplication and uncertainty about whether these are two distinct actions.

## Product intent

- `Next action` = one highlighted thing to do first.
- `Recommendations` = the remaining recommendation backlog/history.

The user should not see the exact same recommendation twice in the same Care tab state.

## Goals

- Promote one active/due recommendation into the Next Action card.
- Exclude the promoted recommendation from the active Recommendations list.
- Keep completed/dismissed recommendations visible in their grouped/history-like section.
- Preserve fallback behavior when no recommendation is available.
- Keep provenance visible in the Next Action card: due date, source, status.
- Preserve AI care recommendation save behavior and quick care logging behavior.
- Add tests for selection/deduplication logic.

## Non-goals

- No recommendation completion/dismissal workflow.
- No new backend or AI endpoint.
- No scheduling/reminder engine.
- No Tailscale/platform route changes.
- No care event mutation.

## Current behavior

Care Section Foundation introduced:

- `selectNextCareAction(plant, recommendations)`
- `groupCareRecommendations(recommendations)`
- Next Action card rendered first
- Recommendations block renders active and inactive recommendations

The selected Next Action can be the same object shown in the active recommendation list.

## Proposed behavior

Add helper logic that returns both:

```ts
type CareActionPresentation = {
  nextAction: NextCareAction;
  promotedRecommendationId?: string | null;
  groups: {
    active: CareRecommendationRecord[];
    inactive: CareRecommendationRecord[];
  };
};
```

Rules:

1. If Next Action came from a recommendation, remember that recommendation id.
2. Active Recommendations should exclude that id.
3. Inactive/completed/dismissed recommendations remain unchanged.
4. If Next Action falls back to `plant.nextActionLabel`, do not remove anything from Recommendations.
5. If all active recommendations are promoted/hidden, show empty copy such as:
   `No other recommendations queued.`

Implementation can either:

- add a new helper like `buildCareActionPresentation`, or
- extend `selectNextCareAction` to include source recommendation id.

Recommended: add `buildCareActionPresentation` while preserving existing helper names where possible.

## UI copy

Recommendations section title can stay `Recommendations`, but empty state should communicate deduplication:

- when no active leftovers: `No other recommendations queued.`
- when no recommendations at all: `No recommendations yet. Ask AI or log care over time to build suggestions.`

Optional but nice:

- If active list is deduped, label active group as `Other recommendations`.

## Tests

Add/update tests in care section helper tests:

- promoted active recommendation is excluded from active group,
- fallback plant next action does not exclude recommendations,
- inactive recommendations remain visible,
- empty active leftovers returns expected grouping.

## Validation

```bash
npm run typecheck
npm test -- --runInBand
npm run build:web && npm run smoke:web
```

## Manual acceptance

- Create/save or inspect a plant with one active recommendation.
- Care tab shows that recommendation in Next Action only.
- Recommendations section does not repeat it.
- Add a second recommendation; Next Action shows the top one and Recommendations shows the other.
