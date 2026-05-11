# AI Care Recommendations Decisions

## Proposed decisions

### Dedicated endpoint

Decision: add `POST /agent/care-recommendations` rather than overloading plant chat.

Rationale: care recommendations have structured persistence and action semantics distinct from conversational answers.

Status: accepted.

### Preview before persistence

Decision: show AI suggestions as preview cards; only save a suggestion when the user taps `Save suggestion`.

Rationale: keeps mutations explicit and prevents noisy recommendation history.

Status: accepted.

### Maximum 1–3 suggestions

Decision: prompt/validate for a small recommendation set.

Rationale: mobile care UI should stay actionable; more than three suggestions becomes triage work.

Status: accepted.

### Optional due dates

Decision: allow optional `dueOn` when context supports it; otherwise null.

Rationale: forced dates create false precision.

Status: accepted.

### No auto-completion or care events

Decision: AI suggestion flow does not create care events or complete/dismiss existing recommendations.

Rationale: these are explicit user actions and likely deserve their own UX.

Status: accepted.
