# AI Photo Categorization + Insight Persistence Tasks

## Spec

- [x] Define post-capture categorization flow.
- [x] Keep durable photo storage local while uploading/transmitting image to backend for AI categorization.
- [x] Define backend structured output contract.
- [x] Define local AI tag persistence.
- [x] Define local AI insight persistence.
- [x] Define Plant Detail and Gallery UI integration.
- [x] Define validation gates.

## Backend implementation — pending

- [x] Refine `CaptureReflectionOutput` schema to include tag objects, category, insight, optional care recommendation.
- [x] Update Agno prompt/instructions for categorization labels.
- [x] Add multipart `POST /agent/photo-categorizations` endpoint returning inline output.
- [x] Keep `GET /agent/runs/{runId}` returning stored output.
- [x] Add backend tests for no-key/mock structured output.
- [x] Add backend tests for multipart image upload response/run output shape.

## Mobile persistence — pending

- [x] Add `AiInsightRecord` model type.
- [x] Add `ai_insights` SQLite migration/table.
- [x] Add `AiInsightRepository`.
- [x] Add `PhotoRepository.createAiTags` if missing.
- [x] Add `PhotoRepository.listTagsForPhoto` or lightbox-ready tag query.
- [x] Enhance `GardenAgentService` to upload/transmit image plus context and persist returned tags/insights.
- [x] Ensure failures are swallowed/logged and never block camera save.
- [x] Deduplicate tags/insights for repeated runs.

## UI implementation — pending

- [x] Load AI insights with Plant Detail record.
- [x] Show compact AI insight in Plant Detail timeline/photo entry.
- [x] Load photo tags for Gallery lightbox.
- [x] Show AI tags in Gallery lightbox.
- [x] Preserve existing local photo rendering.

## Validation — pending

- [x] Backend tests pass.
- [x] `npm run typecheck`.
- [x] `npm run build:web`.
- [x] `npm run smoke:web`.
- [x] `scripts/app-platform validate`.
- [x] `scripts/app-platform smoke garden-roof-deck`.
- [ ] Expo Go capture with backend down still works.
- [x] Local API multipart smoke with backend no-key/mock handles photo upload and returns mock AI output.
- [ ] Expo Go capture with OpenAI key uploads image and persists/displays real vision categorization output.

## Checkpoint — pending

- [ ] Commit spec.
- [ ] Commit implementation after validation.
