# AI Garden Agent Foundation Decisions

## Decision 1 — Use a backend with a proper agent framework

Garden Roof Deck should use a real backend-powered agent system rather than a custom Expo-only agent layer.

Rationale: Daniel explicitly wants a proper agent framework and is comfortable implementing a backend now. This better supports the AI-first product direction and keeps secrets server-side.

## Decision 2 — Recommend Agno first, keep Strands as an alternative

Use Agno on a FastAPI backend as the initial recommendation.

Rationale: Agno is lightweight, Python/FastAPI-friendly, supports practical app agents/tools/structured outputs, and fits the current OpenAI-first product backend need. Strands remains a credible alternative, especially if the project becomes more AWS/Bedrock-centric or its tool ecosystem is preferred.

## Decision 3 — OpenAI key lives backend-side only

Use OpenAI initially, with `OPENAI_API_KEY` in backend `.env`, not Expo public environment variables.

Rationale: mobile/client-bundled secrets are not acceptable for a real AI feature. The app should call `/api/garden-roof-deck/...`; the backend owns provider credentials.

## Decision 4 — Keep provider details behind domain endpoints

The mobile app should submit garden-domain events/context and receive garden-domain structured outputs. It should not know OpenAI or Agno request shapes.

Rationale: this preserves provider/framework flexibility and keeps app code focused on product behavior.

## Decision 5 — AI execution is non-blocking for core capture

Camera save, timeline, and gallery must continue working even if backend/agent calls fail.

Rationale: local-first capture is foundational plumbing. AI should enrich it asynchronously, not make it brittle.
