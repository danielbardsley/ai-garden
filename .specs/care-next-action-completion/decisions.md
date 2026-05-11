# Care Next Action Completion Decisions

## Proposed decisions

### Complete recommendation, do not delete

Decision: swiping away Next Action marks the backing recommendation `completed` rather than deleting it.

Rationale: preserves history/provenance and lets it appear in completed/dismissed section.

Status: accepted.

### No automatic care event in v1

Decision: completing a Next Action does not create a care event automatically.

Rationale: a recommendation such as “check leaves” may not map cleanly to a logged care event; explicit logging remains separate.

Status: accepted.

### Button fallback plus swipe

Decision: include a `Mark done` button even if swipe exists.

Rationale: improves accessibility and makes the behavior discoverable/testable.

Status: accepted.

### Existing ranking is enough

Decision: no new ranking algorithm; once completed, existing due/sort logic selects the next active recommendation.

Rationale: keeps the feature focused and predictable.

Status: accepted.
