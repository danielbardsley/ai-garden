# Care Section Foundation Tasks

## Planning

- [x] Capture four candidate care specs for follow-up.
- [x] Create Care Section Foundation spec files.
- [x] Review current Plant Detail care UI and existing record shapes.

## UI implementation

- [x] Replace `CareNotes` with richer `CareSection`.
- [x] Add next-action card using recommendations first, then `plant.nextActionLabel`.
- [x] Add recommendations section grouped by suggested/active vs completed/dismissed.
- [x] Add care history section from existing `careEvents`.
- [x] Add care-relevant AI notes section.
- [x] Add empty states for no action/no recommendations/no care history.
- [x] Preserve existing Plant Detail style and mobile layout.

## Helpers/tests

- [x] Add pure helper functions for next action selection, sorting, labels, and care insight filtering.
- [x] Add or update tests where practical.

## Validation

- [x] `npm run typecheck`
- [x] `npm test -- --runInBand`
- [x] `npm run build:web && npm run smoke:web`
- [ ] Manual Expo Go smoke of Plant Detail Care tab. Requires Daniel’s Expo Go session.

## Delivery

- [x] Update acceptance results.
- [x] Add memory note with the three follow-up care specs.
