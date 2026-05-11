# Plant Detail Ask AI Tasks

## Planning

- [x] Create spec directory and files.
- [x] Review existing Plant Detail, garden-agent, backend route, and local storage architecture.
- [x] Confirm final scope/defaults before implementation or proceed with recommended defaults.

## Backend API

- [x] Add plant chat schemas: request, context, output, sources.
- [x] Add `POST /agent/plant-chat` route.
- [x] Add `GardenAgent.run_plant_chat` with structured output.
- [x] Store plant chat runs in `AgentRunRepository`.
- [x] Ensure provider-unconfigured and agent errors return safe failure responses.
- [x] Add backend tests for schema, route success, unconfigured/failure path, and run persistence.

## Frontend types and API client

- [x] Add TypeScript request/response/chat output types.
- [x] Add API client method for `plant-chat`.
- [x] Reuse diagnostics handling for API unreachable/unconfigured/request failed.
- [x] Add API client/service tests.

## Context builder

- [x] Add `GardenAgentChatContextBuilder`.
- [x] Include compact plant profile, observations, photo metadata, AI insights, care records, recent messages.
- [x] Omit local file URIs and secret/provider details.
- [x] Limit record counts to fit prompt budget.
- [x] Add context-builder tests.

## Local conversation persistence

- [x] Add/extend local model types for conversation messages.
- [x] Add SQLite migration/table for `ai_conversation_messages`.
- [x] Add repository methods: list by conversation/plant, create user message, create assistant message, mark failed.
- [x] Integrate with existing `usePlantDetailRecord` or add focused chat hook.
- [x] Add repository tests and migration coverage.

## Plant Detail UI

- [x] Replace `StaticChat` with stateful `PlantChat` component.
- [x] Render existing local messages.
- [x] Add prompt chips and editable input.
- [x] Add send/disabled/loading states.
- [x] Add diagnostics banner/copy for API unreachable, AI unconfigured, request failed.
- [x] Add retry affordance where practical.
- [x] Preserve Timeline/Care tabs and existing layout.

## Answer persistence and UX behavior

- [x] Persist user message immediately as pending/sent/failed according to implementation choice.
- [x] Persist assistant answer with `sourceRunId`.
- [x] Do not automatically create `AiInsightRecord` from chat answers in v1.
- [x] Keep failed user messages visible with retry/delete if practical.

## Validation

- [x] `npm run typecheck`
- [x] `npm test -- --runInBand`
- [x] backend `.venv/bin/pytest`
- [x] `docker compose config`
- [x] Recreate backend container if backend code changes need deployment.
- [x] Local health check.
- [x] Tailscale health check.
- [x] Platform `validate` and `smoke garden-roof-deck` after deploy/build.
- [ ] Manual Expo Go smoke: ask a plant question and receive contextual answer. Requires Daniel’s Expo Go session.

## Delivery

- [x] Update `acceptance.md` with validation results.
- [x] Update `decisions.md` with implemented decisions/deviations.
- [ ] Commit checkpoint if requested/appropriate, mindful of the pre-existing dirty repo. Deferred until Daniel wants a checkpoint over the broader dirty feature set.
