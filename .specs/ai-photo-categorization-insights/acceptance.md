# AI Photo Categorization + Insight Persistence Acceptance

## Spec acceptance

- Spec keeps durable photo storage local while allowing backend image upload for AI categorization.
- Spec defines structured categorization output.
- Spec defines local persistence for AI tags and insights.
- Spec defines where AI output appears in Plant Detail and Gallery.
- Spec keeps capture/save resilient when backend or OpenAI is unavailable.

## Implementation acceptance

- Camera photo save still completes before/without AI output.
- Backend accepts uploaded photo + context and returns structured capture categorization output.
- Mobile persists AI photo tags with `source = 'ai'`.
- Mobile persists a linked AI insight with provenance.
- Gallery lightbox displays AI tags for categorized photos.
- Plant Detail timeline displays a compact AI insight for categorized photo observations.
- Backend/no-key/failure paths do not block local capture or photo visibility.

## Validation acceptance

- Backend tests pass.
- `npm run typecheck` passes.
- `npm run build:web` passes.
- `npm run smoke:web` passes.
- `scripts/app-platform validate` passes.
- `scripts/app-platform smoke garden-roof-deck` passes.
- Manual Expo Go no-backend/no-key regression passes.
- Manual Expo Go OpenAI-key image categorization smoke passes when key is configured.
