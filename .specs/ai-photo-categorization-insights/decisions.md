# AI Photo Categorization + Insight Persistence Decisions

## Decision 1 — Auto-categorization before plant chat

Implement photo categorization and insight persistence before plant chat.

Rationale: chat will be more useful once the app has durable AI context: tags, summaries, categories, and insights linked to plants/photos/observations.

## Decision 2 — Upload photo for categorization, but keep durable storage local

Upload/transmit the captured photo to the Python API for the categorization run. The backend may use a vision-capable OpenAI model, but should not become durable photo storage.

Rationale: real photo categorization needs the image. Local photo storage remains the journal source of truth; backend image handling is transient and scoped to AI processing.

## Decision 3 — Mobile local SQLite remains source of truth for displayed AI outputs

Backend stores run/debug output, but mobile persists the tags/insights it displays.

Rationale: the app remains local-first and usable offline. Cloud sync/source-of-truth decisions belong to a later spec.

## Decision 4 — AI outputs do not overwrite human facts

AI summaries, categories, tags, and care candidates should be stored as AI-derived content with provenance.

Rationale: trust and future editability require separating observed/human-entered facts from model inference.
