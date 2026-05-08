# Plant Records Storage Tasks

## Spec

- [x] Define local-first SQLite storage goals.
- [x] Define entities needed by current UI and near-future features.
- [x] Define migration and seed-data strategy.
- [x] Define repository/module structure.
- [x] Define validation and acceptance criteria.

## Implementation — pending

- [x] Add SQLite dependency (`expo-sqlite`) after confirming package compatibility with Expo SDK 54.
- [x] Create database open/init module.
- [x] Create v1 migration with core tables and indexes.
- [x] Create TypeScript domain model types.
- [x] Create repositories for plants, observations, photos, care, and AI context.
- [x] Add deterministic seed/demo data based on current design fixtures.
- [x] Wire Home screen to repository data.
- [x] Wire Plant Detail timeline/profile to repository data.
- [x] Wire Gallery to repository photo queries and plant filter.
- [x] Keep Camera and Ask AI as mocked UI until separate specs implement real behavior.

## Validation — pending

- [x] `npm run typecheck`
- [x] `npm run build:web`
- [x] `npm run smoke:web`
- [x] `scripts/app-platform validate`
- [x] `scripts/app-platform smoke garden-roof-deck`
- [ ] Expo Go smoke test on active dev URL.

## Checkpoint — pending

- [x] Update spec/decisions if implementation differs.
- [ ] Commit storage implementation checkpoint after validation passes.
