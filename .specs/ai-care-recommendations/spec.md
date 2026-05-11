# AI Care Recommendations Spec

## Summary

Add AI-assisted care recommendations for a plant, generated from the plant's local history and shown in the Plant Detail `Care` tab. Recommendations must remain user-controlled: AI can suggest care actions, but it must not automatically mutate plants, care history, or recommendation statuses without explicit user action.

This is the third of four care-related specs:

1. Care section foundation — implemented.
2. Quick care logging — implemented.
3. AI care recommendations — current spec.
4. Care profile / plant preferences — later.

## Product intent

The Care tab now has structure and manual logging. The next step is to make it proactive: use the Garden Agent to inspect plant context and suggest practical care actions.

The user experience should feel like:

- “Look at this plant's recent record.”
- “Tell me what I might need to do next.”
- “Let me choose whether to save, dismiss, or act on that suggestion.”

## Goals

- Add a Care-tab action to request AI care recommendations for the current plant.
- Reuse existing Garden Agent/backend architecture.
- Build compact plant-care context from local data:
  - plant profile,
  - recent care events,
  - active recommendations,
  - recent observations/photos metadata,
  - AI insights,
  - recent Ask AI messages if useful.
- Return structured recommendation output.
- Persist accepted/generated recommendations locally as `CareRecommendationRecord`s.
- Show diagnostics-aware failure states using existing AI diagnostics patterns.
- Keep all mutations explicit and user-controlled.

## Non-goals

- No autonomous care event creation.
- No automatic recommendation completion/dismissal from AI output.
- No recurring schedule engine.
- No notifications/reminders.
- No care profile/preferences storage yet.
- No photo upload in this care recommendation request.
- No streaming.
- No Tailscale Serve/Funnel changes.

## Existing state

Implemented foundation:

- Care tab has next-action card, grouped recommendations, care history, AI care notes.
- Quick care logging can create manual `care_events`.
- Plant Detail already loads:
  - `plant`,
  - `careEvents`,
  - `careRecommendations`,
  - `observations`,
  - `photos`,
  - `aiInsights`,
  - conversation/messages.
- Garden Agent backend already supports structured photo and plant-chat requests.
- Runtime diagnostics already distinguish API unreachable, AI provider unconfigured, and request failed.

Existing local recommendation model:

```ts
type CareRecommendationRecord = {
  id: string;
  plantId?: string | null;
  observationId?: string | null;
  recommendationType: string;
  title: string;
  body?: string | null;
  dueOn?: string | null;
  status: 'suggested' | 'accepted' | 'completed' | 'dismissed';
  source: 'manual' | 'ai_suggested' | 'system';
};
```

## Proposed UX

### Entry point

In the Care tab, near the recommendations section, add an action:

- `Ask AI for care suggestions`

Button states:

- idle,
- loading: `Checking plant history…`,
- unavailable diagnostics,
- success with one or more suggested recommendations.

### Recommendation preview

When AI returns suggestions, show a preview before persisting or changing statuses.

For each suggestion:

- title,
- recommendation type,
- rationale/body,
- optional due date,
- confidence,
- source/citations if available,
- actions:
  - `Save suggestion`,
  - `Dismiss`.

V1 can persist suggestions immediately after the AI response only if the UI labels them clearly as AI-suggested and user can dismiss later. Recommended safer default: preview first, then save selected suggestions.

### After save

- Create `CareRecommendationRecord` with:
  - `source='ai_suggested'`,
  - `status='suggested'`,
  - `recommendationType` from output,
  - `title`, `body`, optional `dueOn`.
- Reload Plant Detail.
- Recommendation appears in existing recommendations section and may drive next-action card.

### Failure / unavailable states

Reuse diagnostics copy:

- API unreachable: `Garden API is unreachable from this device.`
- AI unconfigured: `AI provider is not configured on the server.`
- request failed: `AI care recommendation failed; try again.`

No raw errors, provider details, stack traces, or secrets.

## Backend API

Add dedicated endpoint:

```http
POST /agent/care-recommendations
```

Through platform routing:

```text
/api/garden-roof-deck/agent/care-recommendations
```

Why dedicated endpoint: care recommendations have a different schema and persistence meaning than plant chat or photo analysis.

### Request shape

```ts
type CareRecommendationRequest = {
  requestId: string;
  plantId: string;
  occurredAt: string;
  context: CareRecommendationContext;
};
```

Context should include compact, safe records only:

- plant profile,
- recent care events,
- active/dismissed/completed recommendations summary,
- recent observations,
- recent photos metadata only — no local URIs,
- care-relevant AI insights,
- optional recent Ask AI messages.

### Output shape

```ts
type CareRecommendationOutput = {
  summary: string;
  recommendations: Array<{
    recommendationType: string;
    title: string;
    body?: string | null;
    dueOn?: string | null;
    confidence: number;
    rationale?: string | null;
    sources?: Array<{ kind: string; id?: string | null; label?: string | null }>;
  }>;
  confidence: number;
};
```

The model should be instructed to:

- be cautious,
- avoid medical/pesticide certainty,
- prefer observation/check actions when uncertain,
- not invent plant history,
- not prescribe restricted chemicals,
- return no recommendations if context is too thin.

## Frontend architecture

Likely additions:

- `GardenAgentCareContextBuilder.ts`
- care recommendation request/response types in garden-agent types.
- `GardenAgentApiClient.submitCareRecommendations(...)`
- `GardenAgentCareService.requestCareRecommendations(...)`
- `CareRecommendationRepository.createRecommendation(...)`

The service should:

1. Check diagnostics health first.
2. Build compact care context from `PlantDetailRecord`.
3. Call backend endpoint.
4. Return either structured output or diagnostics.
5. Let UI decide what to persist.

## Local persistence

Add repository support for creating recommendations:

```ts
createRecommendation(input: {
  id: string;
  plantId: string;
  recommendationType: string;
  title: string;
  body?: string | null;
  dueOn?: string | null;
  status?: 'suggested';
  source?: 'ai_suggested';
}): Promise<CareRecommendationRecord>
```

No schema migration expected.

## Acceptance behavior

- User taps AI suggestion action.
- App checks API/AI health before request.
- Backend returns structured suggestions.
- User can save individual suggestions.
- Saved suggestions appear in Recommendations and can affect Next Action.
- Failed/unavailable states are clear and safe.
- No care events are created by AI.
- No existing recommendations are auto-completed/dismissed.

## Testing strategy

Backend:

- schema alias tests,
- route success with monkeypatched agent method,
- unconfigured/failure path,
- run persistence.

Frontend:

- care context builder omits local URIs and limits records,
- service checks diagnostics before backend call,
- API client posts to `/agent/care-recommendations`,
- recommendation repository creates AI-suggested rows,
- helper tests for preview/save behavior where practical.

Validation:

```bash
npm run typecheck
npm test -- --runInBand
cd backend && .venv/bin/pytest
npm run build:web && npm run smoke:web
cd /srv/projects/openclaw-app-platform && scripts/app-platform validate
cd /srv/projects/openclaw-app-platform && scripts/app-platform smoke garden-roof-deck
```

## Open questions

- Preview first vs auto-save AI suggestions? Recommendation: preview first.
- How many suggestions max? Recommendation: 1–3.
- Should due dates be allowed in v1? Recommendation: yes, optional ISO date if model has enough context; otherwise null.
- Should there be a dismiss action in this spec? Recommendation: only dismiss preview suggestions locally; persisted recommendation dismiss/complete actions can be a later mini-spec if not already present.
