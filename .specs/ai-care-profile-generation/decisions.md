# AI Care Profile Generation Decisions

## Proposed decisions

### Preview/edit before save

Decision: AI drafts populate editable fields but do not save automatically.

Rationale: care preferences are durable and should stay user-confirmed.

Status: accepted.

### Dedicated endpoint

Decision: add `POST /agent/care-profile-draft` rather than reusing care recommendations or chat.

Rationale: profile generation has a distinct schema and persistence target.

Status: accepted.

### Save accepted AI draft as `ai_assisted`

Decision: accepted AI drafts save with `source='ai_assisted'`.

Rationale: provenance distinguishes manual preferences from reviewed AI-generated drafts.

Status: accepted.

### Leave unsupported fields blank

Decision: AI should return null/blank fields when context is too thin.

Rationale: avoids false precision in durable care preferences.

Status: accepted.
