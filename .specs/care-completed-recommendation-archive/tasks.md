# Care Completed Recommendation Archive Tasks

## Planning

- [x] Create spec files.
- [x] Review completed recommendation rendering and repository API.

## Persistence

- [x] Add `archiveRecommendation(recommendationId)` to `CareRecommendationRepository`.
- [x] Soft-delete using `deleted_at` and `updated_at`.
- [x] Add repository test.

## UI

- [x] Add swipe-away wrapper for inactive/completed recommendation cards.
- [x] Add `Hide` fallback button.
- [x] Optimistically remove archived card from local recommendation state.
- [x] Roll back and show safe error copy on failure.
- [x] Ensure active recommendations are not archived by this interaction.

## Validation

- [x] `npm run typecheck`
- [x] `npm test -- --runInBand`
- [x] `npm run build:web && npm run smoke:web`
- [ ] Manual Expo Go smoke. Requires Daniel’s Expo Go session.

## Delivery

- [x] Update acceptance results.
- [x] Add memory note.
