# Care Profile / Plant Preferences Tasks

## Planning

- [x] Create spec files.
- [x] Review current storage migrations, PlantDetailRecord, and care context builders.

## Data/model

- [x] Add `CareProfileRecord` type.
- [x] Add SQLite migration for `care_profiles`.
- [x] Add row mapper.
- [x] Add `CareProfileRepository` with get/upsert.
- [x] Include `careProfile` in `PlantDetailRecord`.
- [x] Load care profile in `PlantRepository.getPlantDetail`.
- [x] Add repository/mapper tests.

## UI

- [x] Add Care Profile card to Care tab.
- [x] Add empty state.
- [x] Add inline editor with free-text fields.
- [x] Save/upsert profile and reload Plant Detail.
- [x] Preserve field values on failed save.
- [x] Show concise failure/success copy.

## AI context

- [x] Add care profile to care recommendation context builder.
- [x] Add care profile to plant chat context builder.
- [x] Add/update context builder tests.

## Validation

- [x] `npm run typecheck`
- [x] `npm test -- --runInBand`
- [x] `npm run build:web && npm run smoke:web`
- [ ] Manual Expo Go smoke: add/edit profile and confirm persistence. Requires Daniel’s Expo Go session.

## Delivery

- [x] Update acceptance results.
- [x] Add memory note.
