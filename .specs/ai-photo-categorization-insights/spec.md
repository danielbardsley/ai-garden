# AI Photo Categorization + Insight Persistence Spec

## Summary

Implement the first user-visible AI output loop for Garden Roof Deck. After a local camera photo is saved, the app should submit a compact metadata/context packet to the dedicated Python agent API, receive structured categorization output, persist AI-derived tags and insights locally, and show those outputs in Gallery and Plant Detail.

Photos remain stored locally on device as the durable journal source of truth, but the captured image should be uploaded/transmitted to the dedicated Python API for AI categorization. The backend may pass the image to OpenAI vision-capable models for this categorization run. The backend should not become the durable photo store in this slice.

## Goals

- Convert the existing best-effort `photo.captured` backend submission into a useful persisted local result.
- Use the FastAPI + Agno backend as the AI execution boundary.
- Keep OpenAI configured server-side through backend `.env` for this phase.
- Keep durable photo storage local while uploading/transmitting the captured image to the backend for AI categorization.
- Persist AI-derived outputs separately from human/system facts.
- Show AI tags in Gallery lightbox.
- Show a concise AI insight/note in Plant Detail timeline for the captured observation/photo.
- Keep capture/save fully functional when backend is unavailable, no key is configured, or an agent run fails.
- Establish the durable context that future Plant Agent Chat can use.

## Non-goals

- No plant chat UI yet.
- No user-managed OpenAI keys yet; that belongs in a later settings/account spec.
- No cloud sync.
- No automatic changes to plant identity, status, or care schedule without user review.
- No push notifications or background OS scheduling.

## Existing foundation

The AI backend foundation already provides:

- FastAPI backend under `/api/garden-roof-deck/`.
- Agno + OpenAI configuration.
- `POST /agent/events` for `photo.captured`.
- `GET /agent/runs/{runId}`.
- backend `agent_runs` persistence.
- mock/no-key capture reflection behavior.
- mobile best-effort event submission after local camera save.

This spec builds on that foundation by making the returned AI output durable and visible in the app.

## User flow

1. User captures and saves a photo locally.
2. App writes observation/photo/system tag rows to local SQLite.
3. App submits `photo.captured` metadata/context to backend without blocking navigation.
4. App includes the captured photo file plus compact context in the backend categorization request.
5. User lands on Plant Detail immediately.
6. If the agent response succeeds, app persists:
   - AI photo tags,
   - AI insight linked to plant/photo/observation,
   - optional care recommendation candidate if returned and valid.
7. Plant Detail timeline displays the AI insight near the photo entry.
8. Gallery lightbox displays AI tags for the photo.
9. If backend is unavailable or no key is configured, local capture still succeeds; UI either shows no AI output or a subtle pending/unavailable state.

## Photo upload and retention

The app should upload/transmit the captured photo to the Python API for the categorization request. This is separate from durable photo storage:

- Mobile remains the durable owner of the photo file in app document storage.
- Backend receives the image only to perform the AI categorization run.
- Backend should not persist the image by default.
- If temporary disk storage is required for framework/provider APIs, store under a temp/runtime path and delete after the run.
- Backend `agent_runs` may store metadata, run status, and structured output, but not image bytes or base64 blobs.
- The request should include metadata/context alongside the image.

Recommended endpoint shape for v1:

```http
POST /api/garden-roof-deck/agent/photo-categorizations
Content-Type: multipart/form-data

fields:
- event: JSON string matching the photo captured event/context
- photo: image/jpeg or image/png file
```

`POST /agent/events` can remain for metadata-only events and future non-photo events. Photo categorization should use the multipart endpoint so image handling is explicit.

## Backend changes

### Structured output contract

Refine the capture categorization output into a stable app contract. The backend should use a vision-capable OpenAI model when an image is supplied:

```json
{
  "summary": "Short observation summary.",
  "tags": [
    { "label": "flowering", "confidence": 0.72 },
    { "label": "tomato", "confidence": 0.91 }
  ],
  "category": {
    "label": "growth_update",
    "confidence": 0.66
  },
  "insight": {
    "title": "New growth check-in",
    "body": "The Sungold has a fresh photo logged; compare against the next capture for fruit color and leaf posture.",
    "kind": "summary",
    "confidence": 0.7
  },
  "careRecommendation": null
}
```

Recommended category labels for v1:

- `growth_update`
- `flowering`
- `fruiting`
- `harvest_ready`
- `watering_check`
- `pest_or_damage_watch`
- `health_check`
- `general_photo_log`

### Endpoint behavior

Add a dedicated multipart endpoint for photo categorization:

```http
POST /agent/photo-categorizations
```

The endpoint should return `runId`, `status`, and structured `output` inline for v1. Preserve `GET /agent/runs/{runId}` for debugging and later async worker/polling evolution.

`POST /agent/events` remains useful for metadata-only events such as plant viewed or garden daily brief.

### Backend persistence

Continue storing backend run output in `agent_runs.output_json` for debugging/dedupe.

Do not make backend the source of truth for user journal photos or displayed journal data in this slice. Mobile local SQLite remains the source of truth for displayed AI tags/insights. Backend stores structured run output and diagnostics only.

## Mobile data model

### AI photo tags

Use existing `photo_tags` table if it supports:

- `photo_id`
- `tag`
- `source = 'ai'`
- `confidence`

Add repository method if needed:

```ts
PhotoRepository.createAiTags(photoId: string, tags: AiTagInput[]): Promise<void>
PhotoRepository.listTagsForPhoto(photoId: string): Promise<PhotoTagRecord[]>
```

Deduplicate by `photo_id + source + normalized tag` where practical.

### AI insights

Add local `ai_insights` table if not already present.

Fields:

- `id` text primary key.
- `plant_id` text nullable.
- `photo_id` text nullable.
- `observation_id` text nullable.
- `scope` text not null: `plant`, `photo`, `garden`, `care`.
- `kind` text not null: `summary`, `attention`, `care_note`, `daily_brief`, `tagging`, `risk`.
- `title` text nullable.
- `body` text not null.
- `status` text not null: `draft`, `active`, `dismissed`, `archived`.
- `confidence` real nullable.
- `source_run_id` text nullable.
- `created_at`, `updated_at`, `deleted_at`.

Repository methods:

```ts
AiInsightRepository.createInsight(input): Promise<AiInsightRecord>
AiInsightRepository.listInsightsForPlant(plantId: string): Promise<AiInsightRecord[]>
AiInsightRepository.listInsightsForPhoto(photoId: string): Promise<AiInsightRecord[]>
```

## Mobile service flow

Add a service responsible for handling backend output after `photo.captured`:

```ts
GardenAgentService.submitPhotoCapturedBestEffort({ plant, photo, observation })
```

Enhance it to:

1. submit event/context plus the captured image file to the photo categorization endpoint,
2. read inline output or fetch run output,
3. validate output shape,
4. persist AI tags,
5. persist AI insight,
6. swallow/log failures without affecting local capture.

The Camera Capture service should remain focused on local save and event submission, not AI persistence details.

## UI requirements

### Plant Detail timeline

For photo observations with an AI insight:

- Show a compact AI insight row/card near the photo entry.
- Label it subtly as AI-derived, e.g. `AI note`.
- Use concise copy; do not overwhelm the timeline.
- If no insight exists, current timeline behavior remains unchanged.

### Gallery lightbox

For photos with AI tags:

- Show tags below photo metadata/details.
- Distinguish AI tags from system/manual tags only if visually useful.
- Keep layout readable on mobile.

### Pending/error states

No intrusive error is needed for agent failures in v1.

Optional subtle states:

- `AI note pending` shortly after capture.
- No display if backend/key unavailable.

## Guardrails

- Never overwrite human-entered observation notes automatically.
- Store AI content with `source = 'ai'` or `source_run_id` provenance.
- Send the captured image to the backend only for the categorization run; do not persist image bytes in backend run records.
- Do not infer plant identity as fact from metadata-only context.
- Keep backend failures non-blocking.
- Deduplicate repeated AI outputs for the same photo/run.
- Keep output short and structured.

## Validation

Backend:

- Add tests for structured capture output schema.
- Add tests for multipart photo categorization returning or storing output.
- Add no-key/mock behavior tests.

Mobile:

- `npm run typecheck`.
- Camera save still works if backend is down.
- Camera save persists AI tags/insight if backend returns vision categorization output.
- Gallery lightbox shows AI tags.
- Plant Detail timeline shows AI insight.
- Existing Gallery/Plant Detail photo rendering remains intact.

Platform:

- `npm run build:web`.
- `npm run smoke:web`.
- `scripts/app-platform validate`.
- `scripts/app-platform smoke garden-roof-deck`.

Manual Expo Go:

- Test with no backend/no key: capture still works, no blocking error.
- Test with backend no key: mock output can persist/display if enabled.
- Test with backend + OpenAI key: real image-based categorization output persists/display.

## Open questions

- What backend temp-file deletion strategy should be used for uploaded images?
- What max upload size and image compression/resizing should the mobile client apply before upload?
- Should no-key mock output persist in normal development, or should it only be returned for tests/debugging?
- Should the first AI insight appear directly in the timeline, or as a collapsible detail under the photo?
- Should AI tags be visible on gallery tiles or only in lightbox?
- Should care recommendations from this flow be persisted now, or deferred until care workflows are more mature?
