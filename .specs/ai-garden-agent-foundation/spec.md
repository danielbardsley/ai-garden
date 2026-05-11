# AI Garden Agent Foundation Spec

## Summary

Build the first AI-first foundation for Garden Roof Deck as a real backend-powered agent system. The mobile app remains local-first for capture and browsing, but AI execution should run behind a FastAPI backend using a proper agent framework, with OpenAI as the initial LLM provider and a provider-portable architecture where practical.

This is the foundation for making actual usage AI-driven: captured photos, plant history, care activity, and garden context should flow into an efficient behind-the-scenes agent that generates useful insights, tags, care suggestions, and daily briefs without making the user manually manage every journal detail.

## Product direction

Garden Roof Deck should become AI-first. Manual screens still matter, but the product should increasingly be driven by an efficient background garden agent that:

- reacts to meaningful garden events,
- reasons over plant/photo/observation/care context,
- creates concise and useful outputs,
- avoids unnecessary LLM calls,
- records provenance and run history,
- can evolve from simple tool use into richer agent workflows.

## Goals

- Add a backend API for agent execution under `/api/garden-roof-deck/`.
- Use a proper Python agent framework from the start.
- Use OpenAI initially, with key supplied in backend `.env`.
- Keep provider/model selection isolated enough that later providers are possible.
- Define app-to-backend event submission for captured photos and future journal events.
- Define agent run lifecycle, persistence, retries, and dedupe.
- Define compact context construction from local app data sent by the client or synced later.
- Implement first agent capabilities:
  - capture reflection after photo save,
  - AI photo tags,
  - plant insight card,
  - care recommendation candidate,
  - garden daily brief.
- Keep capture/timeline/gallery usable if backend or AI is unavailable.
- Preserve static web validation and mobile Expo Go workflows.

## Non-goals

- No full cloud sync/account system in this slice unless required for agent context transport.
- No autonomous destructive actions.
- No push notifications yet.
- No paid/public exposure changes without explicit operator confirmation.
- No sending raw image bytes to OpenAI vision models until the media/privacy path is explicitly designed.
- No replacing local SQLite as the mobile source of truth for capture and timeline browsing.

## Agent framework recommendation

### Recommendation: Agno on FastAPI backend

Use `Agno` as the initial Python agent framework, running behind a FastAPI backend service.

Rationale:

- Daniel wants a proper agent framework, and adding a backend now is acceptable.
- Agno is lightweight and pragmatic for application agents, tools, structured outputs, memory/session concepts, and provider abstraction.
- It fits FastAPI/Python well, matching this workspace’s Python/FastAPI preference.
- It should be easier to keep efficient and understandable than heavier graph/orchestration frameworks for the first slice.
- It leaves room to add tools for plant context, photo metadata, care history, and future weather/sync without hand-rolling all agent conventions.

### Alternative considered: Strands Agents

Strands is also a credible backend agent framework, especially if we want a more AWS-aligned agent/tool ecosystem. It may be worth revisiting if the deployment target or tool ecosystem becomes AWS-centric.

Why not choose it first:

- Garden Roof Deck’s current platform is a lightweight app-platform/FastAPI setup, not explicitly AWS Bedrock-centric.
- Agno appears better suited for a compact product backend agent slice with OpenAI-first development.

### Provider strategy

Use OpenAI initially, configured server-side only.

The backend should expose app-domain agent endpoints and should not leak OpenAI-specific shapes to the mobile app. Provider details live in backend configuration and agent/provider modules.

Provider portability should focus on:

- model name/config separated from domain code,
- structured output schemas defined in app/domain terms,
- tool inputs/outputs independent of OpenAI,
- run metadata capable of storing provider/model/token usage generically.

## Backend architecture

Add or extend a backend for Garden Roof Deck under the platform route:

```text
/api/garden-roof-deck/
```

Recommended project layout if adding backend inside the app repo:

```text
backend/
  pyproject.toml
  .env.example
  src/garden_roof_deck_api/
    main.py
    config.py
    agent/
      garden_agent.py
      models.py
      prompts.py
      tools.py
      schemas.py
    routes/
      health.py
      agent.py
    repositories/
      agent_run_repository.py
    storage/
      database.py
```

Use `uv` with a project-local `.venv` for Python dependencies.

## Environment and secrets

Backend `.env` should include:

```text
OPENAI_API_KEY=...
GARDEN_AGENT_MODEL=gpt-4.1-mini   # or current preferred efficient OpenAI model
GARDEN_AGENT_PROVIDER=openai
```

Do not expose the OpenAI key through Expo public environment variables.

The mobile app should call the backend API, not OpenAI directly.

## API surface

### Health

```http
GET /api/garden-roof-deck/health
```

Returns backend readiness and whether agent provider configuration is present, without exposing secrets.

### Submit event

```http
POST /api/garden-roof-deck/agent/events
```

Request:

```json
{
  "eventId": "client-generated-id",
  "eventType": "photo.captured",
  "entityType": "photo",
  "entityId": "photo-id",
  "plantId": "plant-id",
  "occurredAt": "2026-05-08T04:30:00Z",
  "context": { }
}
```

Response:

```json
{
  "runId": "run-id",
  "status": "queued"
}
```

### Run status

```http
GET /api/garden-roof-deck/agent/runs/{runId}
```

Returns status, output summary, errors, and usage metadata.

### Capture reflection synchronous/development endpoint

Optional for early iteration:

```http
POST /api/garden-roof-deck/agent/capture-reflection
```

Returns structured output immediately. The mobile app should still treat this as optional/non-blocking.

## Event and context model

The mobile app should submit compact context packets to the backend until cloud sync exists.

### Photo captured context

Include:

- event id/type/time,
- plant profile: id, display/common/variety names, status, location, colors if useful,
- observation: id, observed date/time, note, kind,
- photo metadata: id, local-only URI marker, width, height, captured date, source,
- recent observations for the plant,
- recent care events/recommendations,
- app version/schema version.

Do not upload image bytes in v1 unless separately specified.

### Plant viewed context

Include:

- plant profile,
- latest observations/photos metadata,
- active care recommendations,
- recent AI insights if available.

### Garden brief context

Include:

- active plant summaries,
- attention plants,
- recent observations/captures,
- due care recommendations,
- date/time and eventually weather.

## Agent capabilities

### Capture Reflection Agent

Trigger: `photo.captured`.

Outputs structured JSON:

- `summary`: concise photo/care observation text.
- `tags`: 3-6 AI tags with confidence.
- `insight`: short plant/photo insight card.
- `careRecommendation`: optional suggested action with due date/reason.
- `confidence`: overall confidence.

### Plant Attention Agent

Trigger: `plant.detail_viewed` or explicit refresh, throttled.

Outputs:

- one current plant insight,
- one suggested next action or question,
- optional care recommendation.

### Garden Brief Agent

Trigger: home refresh or explicit daily brief request, throttled.

Outputs:

- concise garden status brief,
- top 1-3 attention items,
- suggested next capture/care action.

## Backend persistence

The backend should persist run metadata for observability and dedupe. Since local app SQLite remains the user-facing data store in this slice, backend persistence can start small.

Candidate backend tables:

- `agent_runs`
- `agent_events`

Fields should include:

- ids,
- event type/entity/plant,
- status,
- input hash,
- provider/model,
- structured output JSON,
- error message,
- token usage,
- timestamps.

The backend response should return structured outputs that the mobile app can persist locally into existing or new SQLite tables.

## Mobile persistence of AI outputs

Use existing tables where possible:

- AI tags: `photo_tags.source = 'ai'`.
- Care recommendations: `care_recommendations.source = 'ai'`, `status = 'suggested'`.
- AI messages/conversations only for chat-like interactions.

Add `ai_insights` locally for reusable insight cards.

Candidate fields:

- `id`
- `plant_id`
- `photo_id`
- `observation_id`
- `scope`: `plant`, `photo`, `garden`, `care`
- `kind`: `summary`, `attention`, `care_note`, `daily_brief`, `tagging`, `risk`
- `title`
- `body`
- `status`: `draft`, `active`, `dismissed`, `archived`
- `confidence`
- `source_run_id`
- mutable timestamps/tombstone.

## Efficiency and guardrails

- Camera save must not block on AI.
- Use queue/run status and let AI output arrive later.
- Dedupe by input hash for repeated events.
- Throttle plant-view and home-brief triggers.
- Use compact structured context, not raw SQLite dumps.
- Prefer small/efficient OpenAI model for routine summaries.
- Reserve image-capable models for a later media-specific spec.
- Store all AI-derived outputs with source/provenance.
- Never overwrite human-entered facts automatically.
- Backend failure should be visible in diagnostics but quiet in normal UX.

## UI integration points

### Camera save

After local save succeeds:

1. enqueue/send `photo.captured` context to backend,
2. navigate to Plant Detail immediately,
3. show AI insight/tags when returned and locally persisted.

### Plant Detail

Show latest `ai_insights` card for the plant, with subtle AI provenance.

### Gallery

Show AI-generated tags in lightbox when available.

### Home

Replace static morning copy over time with a Garden Brief Agent output.

## Platform/deployment

- Backend should be registered with OpenClaw App Platform for `/api/garden-roof-deck/`.
- Use project-local Python `.venv` managed by `uv`.
- Do not configure public Funnel exposure unless explicitly requested.
- Keep web frontend path `/apps/garden-roof-deck/` stable.

## Validation

- Backend unit tests for schemas, provider mocking, and agent route behavior.
- `uv run pytest` or equivalent for backend.
- `npm run typecheck` for Expo app.
- `npm run build:web`.
- `npm run smoke:web`.
- `scripts/app-platform validate`.
- `scripts/app-platform smoke garden-roof-deck`.
- Manual Expo Go smoke:
  - camera save works if backend is down,
  - event submission works when backend is up,
  - OpenAI key enables real agent output,
  - AI tags/insights persist locally and display.

## Open questions

- Confirm Agno vs Strands before implementation begins.
- Should we implement a simple backend queue in-process first, or use persisted polling/jobs from day one?
- Should v1 send only metadata/text context, or include image upload/vision in the first backend agent slice?
- Should local app persist AI outputs only after backend returns, or should backend become the source of truth for AI outputs once sync exists?
