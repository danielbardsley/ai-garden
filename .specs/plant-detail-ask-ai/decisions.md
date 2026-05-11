# Plant Detail Ask AI Decisions

## Proposed / recommended decisions

### Start plant-scoped only

Decision: v1 Ask AI is scoped to one plant from Plant Detail.

Rationale: plant context is already loaded locally, user intent is clear, and this avoids premature garden-wide chat complexity.

Status: accepted.

### Dedicated backend endpoint

Decision: add `POST /agent/plant-chat` instead of overloading `/agent/events` from the client.

Rationale: chat needs explicit question/conversation/message semantics and a typed output schema. Backend can still store it internally as an agent run/event.

Status: accepted.

### No streaming in v1

Decision: normal request/response only.

Rationale: keeps UI and backend state simple; streaming can be added after core UX and persistence are stable.

Status: accepted.

### Local-first conversation storage

Decision: persist visible chat messages locally in SQLite; backend stores only agent run audit/debug records.

Rationale: matches existing local-first app model and avoids adding account/cloud sync.

Status: accepted.

### No automatic insight creation from chat answers

Decision: chat answers should not automatically create timeline `AiInsightRecord` entries in v1.

Rationale: answers are conversational and may be exploratory. A later explicit “Save as note/insight” action is safer.

Status: accepted.

### Chat context excludes image bytes and local URIs

Decision: Ask AI v1 sends metadata, notes, tags, insights, and care history, not image bytes or local file paths.

Rationale: protects local file details and avoids turning chat into an image-upload feature before that UX/privacy path is designed.

Status: accepted.

## Deferred decisions

- Whether to add streaming responses.
- Whether to add garden-wide Ask AI.
- Whether to save selected answers as timeline insights/notes via explicit user action.
- Whether to summarize long conversation history into persistent memory.
- Whether to attach existing photos to a chat question.
