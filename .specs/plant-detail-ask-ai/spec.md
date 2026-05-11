# Plant Detail Ask AI Spec

## Summary

Replace the current static “Ask AI” placeholder on Plant Detail with a real plant-scoped chat experience backed by the existing Garden Agent FastAPI backend. The feature should let Daniel ask practical questions about a specific plant using local plant/photo/observation/AI-insight context, receive concise contextual answers, and persist the conversation locally so useful advice remains part of the plant history.

This is the next product step after runtime/AI plumbing hardening: the app already has backend health diagnostics, AI photo identification/categorization, local plant records, photo history, AI insights, and a Plant Detail tab labelled `Ask AI`. This spec turns that tab into an actual AI assistant while keeping local-first UX and safe fallback behavior.

## Product rationale

Garden Roof Deck should become AI-first. Plant Detail is the natural place for a conversational garden assistant because the user is already thinking about one plant and the app can provide rich context without asking the user to restate it.

Ask AI should feel like:

- “Help me understand this plant from what you already know.”
- “Use my recent photos and notes, not generic plant advice only.”
- “Give me practical next steps, but don’t pretend certainty.”

## Goals

- Add a real Ask AI chat flow on Plant Detail.
- Scope each chat to one plant initially.
- Build compact client-side context from existing local records:
  - plant profile,
  - latest observations,
  - latest photos metadata,
  - AI insights/tags where available,
  - care events/recommendations where available.
- Add a backend endpoint for plant-scoped chat through the existing Garden Agent.
- Return concise, structured answers with optional suggested follow-up questions.
- Persist user questions and AI answers locally per plant.
- Show backend/API/AI configuration diagnostics using the hardening work instead of generic failure copy.
- Keep the UI usable when AI is unavailable; existing timeline/care screens must not regress.
- Avoid exposing secrets, raw stack traces, or provider-specific details in the app.

## Non-goals

- No streaming responses in this slice. Use a normal request/response path first.
- No garden-wide chat yet, except route/schema should leave room for future `scope=garden`.
- No photo upload inside chat yet. The chat may reference existing photo metadata and AI insights, but attaching new photos to a chat message is out of scope.
- No autonomous writes to care events, recommendations, plant status, or observations from an answer.
- No push notifications or reminders.
- No public/Funnel exposure changes.
- No full cloud sync/account system.
- No multi-user conversation sharing.

## Existing state

- Plant Detail has tabs: `Timeline`, `Ask AI`, `Care`.
- `Ask AI` currently renders `StaticChat`, a visual placeholder with disabled input.
- Local records already expose `PlantDetailRecord` containing:
  - `plant`,
  - `observations`,
  - `photos`,
  - `careEvents`,
  - `careRecommendations`,
  - `aiInsights`,
  - `conversation`.
- `GardenAgentService` already has backend calls for photo identification/categorization and health diagnostics.
- Backend route `/agent/events` exists and agent run persistence exists, but chat needs a domain-specific endpoint/schema.
- Runtime hardening added API URL normalization and health diagnostics.

## User experience

### Entry point

On Plant Detail, user taps `Ask AI` tab.

Initial state should show:

- a friendly plant-scoped assistant intro,
- recent context hint such as photo count or latest observation date,
- 3–5 suggested prompt chips,
- enabled text input if API/AI health is usable,
- diagnostics warning if unavailable.

Suggested prompts should be contextual where possible:

- `Should I water this today?`
- `What changed since the last photo?`
- `Why might leaves be yellowing?`
- `What should I watch next?`
- `Summarize this plant’s progress.`

### Asking a question

1. User types a question or taps a prompt chip.
2. The message appears immediately as a user bubble.
3. UI enters sending/thinking state.
4. Client builds compact plant context from local records.
5. Client POSTs the question/context to the backend Ask AI endpoint.
6. Backend runs the Garden Agent and returns a concise answer.
7. Client persists both messages locally.
8. UI shows the AI answer, optional follow-up chips, and a retry affordance if the request failed.

### Answer style

AI answers should be:

- short by default: 2–5 bullets or short paragraphs,
- plant-specific, referencing local context when available,
- cautious about diagnosis from photos/notes,
- practical: include one or more next actions when relevant,
- transparent when context is limited.

Example answer shape:

```text
Your Sungold looks generally on track from the latest photo and notes.

• The recent tags point more to growth/update than a pest issue.
• If the top leaves are curling in afternoon sun, check soil moisture before watering.
• Next: take another photo in 2–3 days from the same angle so we can compare growth.
```

### Failure states

Use diagnostics-aware copy:

- API unreachable: `Garden API is unreachable from this device.`
- AI unconfigured: `AI provider is not configured on the server.`
- Request failed: `AI request failed; try again.`

User messages that failed to send should remain visible with retry/delete affordance if practical.

## API design

### Endpoint

Add a domain-specific endpoint:

```http
POST /api/garden-roof-deck/agent/plant-chat
```

Request:

```json
{
  "messageId": "client-message-id",
  "conversationId": "conversation-id",
  "plantId": "plant-id",
  "occurredAt": "2026-05-09T18:30:00Z",
  "question": "Should I water today?",
  "context": {
    "plant": {},
    "recentObservations": [],
    "recentPhotos": [],
    "recentAiInsights": [],
    "careEvents": [],
    "careRecommendations": [],
    "conversationSummary": null,
    "recentMessages": [],
    "app": { "schemaVersion": 1 }
  }
}
```

Response:

```json
{
  "runId": "run-id",
  "status": "succeeded",
  "providerConfigured": true,
  "output": {
    "answer": "...",
    "summary": "One-line memory of this exchange.",
    "suggestedQuestions": ["What should I watch next?"],
    "confidence": 0.7,
    "sources": [
      { "kind": "observation", "id": "observation-id", "label": "Latest photo note" }
    ]
  }
}
```

### Why a dedicated endpoint instead of only `/agent/events`

`/agent/events` is useful for background event processing, but chat needs:

- a direct question field,
- conversation id/message id semantics,
- chat-specific output schema,
- easy client typing,
- future support for retry/thread history.

The backend may still store the run internally as an agent event with `eventType='plant.chat_requested'`.

## Backend design

Add schemas under `backend/app/agent/schemas.py`:

- `PlantChatRequest`
- `PlantChatContext`
- `PlantChatOutput`
- `PlantChatSource`

Add route under `backend/app/api/routes/agent.py`:

- `POST /agent/plant-chat`

Add `GardenAgent.run_plant_chat(request)` using the existing Agno/OpenAI setup.

Prompt guidance:

- You are Garden Roof Deck’s plant-specific garden assistant.
- Answer only from the provided context plus general horticultural knowledge.
- Prefer practical next steps.
- State uncertainty when context is thin.
- Do not claim medical/toxicology/pesticide certainty.
- Do not invent observations, dates, photos, or plant facts.
- Return structured output only.

Persistence:

- Continue storing backend agent runs in `AgentRunRepository` for audit/debug.
- Local mobile app remains the source of truth for visible conversation messages in this slice.

## Frontend design

### New/updated feature modules

Add or extend under `src/features/garden-agent/`:

- `GardenAgentChatContextBuilder.ts`
- `GardenAgentChatService.ts` or methods on `GardenAgentService`
- chat request/response types in `types.ts`
- tests under `__tests__/`

Add local persistence under `src/features/garden-records/`:

- conversation/message repository if not already present,
- model types for `AiConversationMessageRecord`,
- database migration for message table(s),
- hook integration so Plant Detail can render messages.

Recommended local table shape:

```text
ai_conversation_messages
  id text primary key
  conversation_id text not null
  plant_id text null
  role text not null -- user | assistant | system
  body text not null
  status text not null -- pending | sent | failed
  source_run_id text null
  created_at text not null
  metadata_json text null
```

Keep any conversation summary optional. If added, store it separately or in `ai_conversations` metadata/title fields.

### Plant Detail UI

Replace `StaticChat` with a stateful `PlantChat` component.

It should include:

- message list,
- prompt chips,
- text input,
- send button,
- loading/sending state,
- retry affordance for failed AI answer,
- diagnostics banner if API/AI unavailable.

Initial implementation can keep the visual style close to existing placeholder.

### Context budget

Build compact context. Suggested limits:

- plant profile: full safe fields,
- observations: latest 8–12,
- photos: latest 8–12 metadata only, no image bytes,
- AI insights: latest 5–8,
- care events/recommendations: latest/relevant 8–12,
- recent chat messages: latest 6–10.

Do not include local file URIs in context. Use `localOnly: true` or omit path fields.

## Data privacy and safety

- Backend receives plant notes/metadata and question text.
- Backend does not receive image bytes in chat v1.
- Do not include local file URIs, OpenAI keys, raw env values, or stack traces.
- Answers should not prescribe unsafe pesticide/chemical actions as certainty.
- Care advice should be framed as suggestions and encourage observation/checking conditions.

## Performance and reliability

- Preflight health diagnostics before sending or handle endpoint failure with classified copy.
- Use one backend call per user question.
- Add a reasonable client timeout if existing fetch utilities support it; otherwise defer explicit cancellation.
- Keep the UI responsive and preserve the typed question on failure.
- No streaming yet; avoid complex partial-message state.

## Testing strategy

Frontend:

- context builder omits local URIs and limits record counts,
- chat service sends typed request and handles success,
- diagnostics/failure paths classify API unreachable/unconfigured/request failed,
- local message repository persists user/assistant/failed messages,
- Plant Chat component behavior where practical with service/repository mocks.

Backend:

- schema validation for plant chat request,
- route returns succeeded response with mocked agent output,
- provider-unconfigured path returns failed/skipped without leaking secrets,
- agent run repository stores plant chat runs,
- output schema validates answer/suggested questions/sources.

Validation:

- `npm run typecheck`
- `npm test -- --runInBand`
- backend `.venv/bin/pytest`
- `docker compose config`
- platform validate/smoke if backend changes are deployed
- local and Tailscale health checks
- manual Expo Go Ask AI smoke on Plant Detail

## Open questions

- Should chat messages be persisted immediately before backend success, or only after a successful response? Recommendation: persist user message immediately as `pending`, then update to `sent` or `failed`.
- Should AI answers also create `AiInsightRecord` entries? Recommendation: not automatically in v1; add a later explicit “Save as note/insight” action.
- Should the first Ask AI backend endpoint support garden-wide chat too? Recommendation: plant-scoped only, but schema should leave room for future `scope`.
- Should suggested prompt chips be static or generated from latest plant context? Recommendation: static + light context interpolation first.
