# Care Profile / Plant Preferences Spec

## Summary

Add a plant-specific care profile to the Plant Detail `Care` tab. The care profile stores stable preferences and known care patterns for each plant: light preference, watering rhythm, fertilizer cadence, pruning/harvest notes, soil/moisture preferences, location quirks, and user notes. This gives the Care tab a durable memory layer beyond individual care events and AI recommendations.

This is the fourth of four care-related specs:

1. Care section foundation — implemented.
2. Quick care logging — implemented.
3. AI care recommendations — implemented.
4. Care profile / plant preferences — current spec.

## Product intent

Care events say what happened. Recommendations say what might happen next. The care profile says what is generally true for this plant.

The care profile should answer:

- What does this plant prefer?
- How often do I usually water or fertilize it?
- What are the location-specific quirks?
- What should AI and future recommendations know before advising me?

## Goals

- Add plant-specific care profile data model and local persistence.
- Render a care profile section in Plant Detail `Care`.
- Let the user manually edit care preferences.
- Include care profile context in future AI care recommendation requests and Ask AI context.
- Keep v1 local-first and manual-first.
- Preserve existing care logging/recommendation behavior.

## Non-goals

- No automatic profile rewriting by AI in v1.
- No cloud sync.
- No reminders/notifications.
- No complex scheduling engine.
- No full botanical encyclopedia profile.
- No required fields.
- No backend persistence endpoint.

## Existing state

The Care tab now includes:

- next action card,
- quick care logging,
- AI care suggestion request and preview/save,
- recommendations section,
- care history,
- care-relevant AI notes.

Local storage already has plant records, care events, care recommendations, AI insights, and AI messages. There is no stable care profile table yet.

## Proposed care profile fields

Recommended v1 fields:

```ts
type CareProfileRecord = {
  id: string;
  plantId: string;
  lightPreference?: string | null;
  wateringRhythm?: string | null;
  soilMoisturePreference?: string | null;
  fertilizerCadence?: string | null;
  pruningNotes?: string | null;
  harvestNotes?: string | null;
  locationNotes?: string | null;
  generalNotes?: string | null;
  source: 'manual' | 'ai_assisted' | 'system';
  createdAt: string;
  updatedAt: string;
};
```

All fields optional. Empty profile is valid.

## UX

### Care profile card

Add a `Care profile` section in the Care tab, likely below Next Action / Quick Log and above Recommendations.

Read mode shows compact rows:

- Light
- Water rhythm
- Moisture
- Fertilizer
- Pruning
- Harvest
- Location notes
- Notes

Only show populated rows by default. If empty, show:

`No care profile yet. Add what this plant tends to prefer.`

### Edit flow

Recommended v1: inline expandable editor in the Care tab.

Actions:

- `Edit profile` or `Add profile`
- fields are short multiline text inputs,
- `Save profile`,
- `Cancel`.

No pickers required in v1; free text keeps it flexible.

### After save

- Upsert local profile for the plant.
- Reload Plant Detail.
- Card updates immediately.

### Failure state

- Keep editor open.
- Preserve text.
- Show `Could not save care profile. Try again.`

## Data design

Add SQLite migration for `care_profiles`:

```sql
CREATE TABLE IF NOT EXISTS care_profiles (
  id TEXT PRIMARY KEY,
  plant_id TEXT NOT NULL REFERENCES plants(id),
  light_preference TEXT,
  watering_rhythm TEXT,
  soil_moisture_preference TEXT,
  fertilizer_cadence TEXT,
  pruning_notes TEXT,
  harvest_notes TEXT,
  location_notes TEXT,
  general_notes TEXT,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_care_profiles_plant_active
  ON care_profiles(plant_id)
  WHERE deleted_at IS NULL;
```

Add repository:

```text
src/features/garden-records/repositories/CareProfileRepository.ts
```

Methods:

- `getProfileForPlant(plantId)`
- `upsertProfile(input)`

Update `PlantDetailRecord` to include optional `careProfile`.

Update `PlantRepository.getPlantDetail` to fetch and map care profile.

## AI context integration

Once the profile exists, include it in:

- `GardenAgentCareContextBuilder`,
- `GardenAgentChatContextBuilder`.

The AI should use it as preference/context, not as absolute truth if newer observations conflict.

## Future AI-assisted profile updates

Not in v1, but this spec should leave room for later:

- AI suggests profile edits from repeated care logs.
- User reviews and accepts changes.
- Source can become `ai_assisted`.

## Testing strategy

- Migration/schema test if practical.
- Repository tests for fetch/upsert.
- Mapper tests for care profile row.
- Plant detail repository includes profile.
- Context builder tests include care profile and omit nothing sensitive.
- Typecheck/build tests.

Validation:

```bash
npm run typecheck
npm test -- --runInBand
npm run build:web && npm run smoke:web
```

Manual:

- Open Plant Detail → Care.
- Add profile fields.
- Save.
- Navigate away/back.
- Confirm profile persists.
- Ask AI/care suggestions later should include profile context.

## Open questions

- Should fields be free text or controlled options? Recommendation: free text v1.
- Should profile live on plant row or separate table? Recommendation: separate `care_profiles` table for clean evolution.
- Should AI auto-update profile? Recommendation: no; future AI-assisted review only.
- Should profile show empty fields in read mode? Recommendation: hide empty fields, show concise empty state.
