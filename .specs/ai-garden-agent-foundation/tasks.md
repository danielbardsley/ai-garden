# AI Garden Agent Foundation Tasks

## Spec

- [x] Define AI-first product direction.
- [x] Accept backend implementation as part of the foundation.
- [x] Recommend proper agent framework.
- [x] Define OpenAI-first backend provider strategy.
- [x] Define app-to-backend event/context model.
- [x] Define backend agent APIs.
- [x] Define agent run lifecycle and persistence.
- [x] Define local AI output persistence.
- [x] Define initial agents and guardrails.

## Framework decision — pending confirmation

- [x] Confirm Agno vs Strands before implementation. Decision: Agno.
- [x] Confirm whether v1 sends image bytes/vision or metadata-only context. Decision: metadata-only; photos remain local.
- [ ] Confirm queue strategy: in-process async first vs persisted job worker from day one.

## Backend implementation — pending

- [x] Add FastAPI backend under Garden Roof Deck repo.
- [x] Add `uv` project and `.venv` workflow.
- [x] Add backend `.env.example` with OpenAI/provider settings.
- [x] Add health route under `/api/garden-roof-deck/health`.
- [x] Add agent event submission route.
- [x] Add agent run status route.
- [x] Add Agno dependency and first Garden Agent wiring.
- [x] Add OpenAI provider/model configuration.
- [x] Add structured output schemas for capture reflection.
- [x] Add backend agent run persistence.
- [x] Add tests with mocked provider.

## Mobile implementation — pending

- [x] Add API client respecting `/api/garden-roof-deck/` base path.
- [ ] Add local `ai_insights` schema migration if needed.
- [ ] Add repositories for AI insights and AI tags/recommendations persistence.
- [x] Build compact context packet after camera save.
- [x] Submit `photo.captured` event non-blockingly after local save.
- [ ] Poll/fetch run result or accept synchronous development response.
- [ ] Persist returned tags/insights locally.
- [ ] Show Plant Detail AI insight card.
- [ ] Show Gallery AI tags in lightbox.
- [ ] Add Home garden brief integration point.

## Platform/deployment — pending

- [x] Register backend/API with OpenClaw App Platform if not already registered.
- [x] Validate routes under `/api/garden-roof-deck/`.
- [x] Keep frontend web path `/apps/garden-roof-deck/` stable.

## Validation — pending

- [x] Backend tests pass.
- [x] `npm run typecheck`.
- [x] `npm run build:web`.
- [x] `npm run smoke:web`.
- [x] `scripts/app-platform validate`.
- [x] `scripts/app-platform smoke garden-roof-deck`.
- [ ] Expo Go smoke with backend down: capture still works.
- [x] Local API smoke with backend up/no key: graceful mock agent behavior.
- [ ] Expo Go smoke with OpenAI key: real AI output persists and displays.

## Checkpoint — pending

- [ ] Commit revised spec.
- [ ] Commit implementation after validation passes.
