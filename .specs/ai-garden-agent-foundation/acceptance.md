# AI Garden Agent Foundation Acceptance

## Spec acceptance

- The spec reflects Daniel's direction that Garden Roof Deck should use a proper agent framework.
- The spec includes a backend as part of the foundation.
- The spec recommends Agno first and explains Strands as an alternative to confirm.
- The spec keeps OpenAI as the initial provider with server-side `.env` secrets.
- The spec preserves provider/framework agnosticism at the mobile-app boundary.
- The spec keeps local capture/timeline/gallery non-blocking and resilient.

## Implementation acceptance

- Backend exposes health and agent endpoints under `/api/garden-roof-deck/`.
- OpenAI key is read server-side only.
- Agent framework is installed and used for at least Capture Reflection Agent.
- Mobile app never calls OpenAI directly.
- Camera save submits AI event/context without blocking navigation.
- Backend failures do not break local capture/timeline/gallery.
- AI-derived tags/insights are stored with source/provenance.
- Plant Detail can display a concise AI insight when available.

## Validation acceptance

- Backend tests pass with mocked provider.
- `npm run typecheck` passes.
- `npm run build:web` passes.
- `npm run smoke:web` passes.
- `scripts/app-platform validate` passes.
- `scripts/app-platform smoke garden-roof-deck` passes.
- Expo Go manual smoke passes with backend down.
- Expo Go manual smoke passes with backend configured but no OpenAI key.
- Expo Go manual smoke passes with backend OpenAI key configured.
