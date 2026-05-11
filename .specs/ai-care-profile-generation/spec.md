# AI Care Profile Generation Spec

## Summary

Add an AI-assisted workflow that drafts or updates a plant's Care Profile from local plant context. The user must review and explicitly save generated profile fields. AI should never overwrite care profile preferences automatically.

This builds on:

- Care section foundation
- Quick care logging
- AI care recommendations
- Care profile / plant preferences

## Product intent

The care profile is valuable, but typing it manually can be tedious. AI should be able to look at the plant's identity, location, care history, observations, recommendations, and chat context, then propose a useful starter profile or improvements to an existing one.

The experience should feel like:

- “Draft a care profile for this plant.”
- “Show me exactly what you would fill in.”
- “Let me edit/save only what I agree with.”

## Goals

- Add Care tab action to generate/draft a care profile with AI.
- Reuse Garden Agent backend and diagnostics flow.
- Build compact profile-generation context from local plant data.
- Return structured fields matching `CareProfileRecord` editable fields.
- Preview generated fields before persistence.
- Let the user edit the draft before saving.
- Save as local care profile with `source='ai_assisted'` when generated/accepted.
- Preserve existing manual edit flow.
- Include safe caveats/uncertainty when context is thin.

## Non-goals

- No automatic profile overwrite.
- No cloud sync.
- No autonomous care events or recommendation status changes.
- No streaming.
- No photo upload inside this request.
- No Tailscale Serve/Funnel changes.
- No hard botanical truth claims when context is uncertain.

## Existing state

Care Profile v1 includes local fields:

- lightPreference
- wateringRhythm
- soilMoisturePreference
- fertilizerCadence
- pruningNotes
- harvestNotes
- locationNotes
- generalNotes

The Care tab already has a manual inline editor and persists profiles through `CareProfileRepository.upsertProfile`.

AI context builders already include the care profile in Ask AI and AI care recommendations once present.

## Proposed UX

### Entry point

In the Care Profile card, add an action:

- `Draft with AI` when profile is empty.
- `Improve with AI` when profile already exists.

### Loading and diagnostics

States:

- loading: `Drafting care profile…`
- API unreachable: existing diagnostics copy
- AI unconfigured: existing diagnostics copy
- request failed: `AI care profile draft failed; try again.`

### Draft preview

AI returns a structured draft. Show it in the existing editor fields before saving, with visual copy:

`AI draft — review before saving.`

The user can edit fields before saving.

### Save behavior

When saving an AI-generated draft:

- Use existing care profile upsert flow.
- Store `source='ai_assisted'` if the profile originated from the AI draft.
- If the user manually edits later from scratch, source can become `manual`.

Implementation may need to extend `CareProfileRepository.upsertProfile` to accept `source`.

## Backend API

Add dedicated endpoint:

```http
POST /agent/care-profile-draft
```

Platform route:

```text
/api/garden-roof-deck/agent/care-profile-draft
```

### Request shape

```ts
type CareProfileDraftRequest = {
  requestId: string;
  plantId: string;
  occurredAt: string;
  context: CareProfileDraftContext;
};
```

Context includes:

- plant profile/identity,
- existing care profile if any,
- recent care events,
- saved care recommendations,
- observations/photo metadata with no local URIs,
- AI insights,
- recent Ask AI messages if useful.

### Output shape

```ts
type CareProfileDraftOutput = {
  summary: string;
  profile: {
    lightPreference?: string | null;
    wateringRhythm?: string | null;
    soilMoisturePreference?: string | null;
    fertilizerCadence?: string | null;
    pruningNotes?: string | null;
    harvestNotes?: string | null;
    locationNotes?: string | null;
    generalNotes?: string | null;
  };
  confidence: number;
  caveats?: string[];
  sources?: Array<{ kind: string; id?: string | null; label?: string | null }>;
};
```

The agent should:

- prefer concise practical phrases,
- avoid pretending it knows precise care rhythms without evidence,
- include uncertainty in `generalNotes` or `caveats`,
- use existing profile as context, not as mandatory overwrite target,
- keep fields blank/null if unsupported.

## Frontend architecture

Likely additions:

- `GardenAgentCareProfileContextBuilder.ts` or reuse care recommendation context if it is sufficiently broad.
- request/output/response types.
- `GardenAgentApiClient.submitCareProfileDraft(...)`.
- `GardenAgentCareProfileService.requestCareProfileDraft(...)` with diagnostics preflight.
- Care Profile card action to request draft and populate editor.

## Persistence changes

Extend care profile upsert input to accept:

```ts
source?: 'manual' | 'ai_assisted'
```

Rules:

- manual edits from the normal edit button default to `manual`,
- AI drafts saved after review use `ai_assisted`,
- no automatic save from AI response.

## Testing strategy

Backend:

- schema alias tests,
- route success with monkeypatched agent method,
- unconfigured/failure path,
- run persistence.

Frontend:

- context builder omits local URIs and includes existing profile,
- service diagnostics preflight,
- API client posts to `/agent/care-profile-draft`,
- repository source handling,
- Care Profile UI typecheck.

Validation:

```bash
npm run typecheck
npm test -- --runInBand
cd backend && .venv/bin/pytest
npm run build:web && npm run smoke:web
cd /srv/projects/openclaw-app-platform && scripts/app-platform validate
cd /srv/projects/openclaw-app-platform && scripts/app-platform smoke garden-roof-deck
```

## Manual acceptance

- Open Plant Detail → Care.
- Tap `Draft with AI` / `Improve with AI`.
- Confirm fields populate in editable draft mode.
- Edit one field.
- Save.
- Navigate away/back and confirm profile persists.
- Confirm no care event or recommendation status was changed.
