# Care Next Action Completion Tasks

## Planning

- [x] Create spec files.
- [x] Review current Next Action card and recommendation repository implementation.

## Persistence

- [x] Add `markCompleted(recommendationId)` to `CareRecommendationRepository`.
- [x] Update `care_recommendations.status` to `completed` and `updated_at`.
- [x] Add repository tests.

## UI

- [x] Add completion handler to CareSection / Next Action card.
- [x] Show completion affordance only when Next Action has `recommendationId`.
- [x] Add `Mark done` fallback button.
- [x] Add swipe-away gesture or lightweight swipe wrapper.
- [x] Reload/recompute Plant Detail after completion.
- [x] Show safe failure copy if completion update fails.

## Behavior

- [x] Completed recommendation moves to inactive group.
- [x] Next active recommendation promotes automatically.
- [x] Plant fallback Next Action remains non-completable.
- [x] No automatic care event is created.

## Validation

- [x] `npm run typecheck`
- [x] `npm test -- --runInBand`
- [x] `npm run build:web && npm run smoke:web`
- [ ] Manual Expo Go smoke. Requires Daniel’s Expo Go session.

## Delivery

- [x] Update acceptance results.
- [x] Add memory note.
