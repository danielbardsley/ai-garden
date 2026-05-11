# Quick Care Logging Tasks

## Planning

- [x] Create spec files.
- [x] Review current Care Section Foundation implementation and repository patterns.

## Repository/data

- [x] Add `CareEventRepository` or equivalent create method.
- [x] Persist manual care events into existing `care_events` table.
- [x] Return mapped `CareEventRecord` after insert.
- [x] Add repository tests.

## UI

- [x] Add quick logging entry point to Care tab.
- [x] Add inline composer with care type chips.
- [x] Add optional note input.
- [x] Default event date to today.
- [x] Save event and reload Plant Detail data.
- [x] Show concise success/failure state.
- [x] Preserve Care Section Foundation layout.

## Validation

- [x] `npm run typecheck`
- [x] `npm test -- --runInBand`
- [x] `npm run build:web && npm run smoke:web`
- [ ] Manual Expo Go smoke: log care and confirm persistence. Requires Daniel’s Expo Go session.

## Delivery

- [x] Update acceptance results.
- [x] Add memory note.
