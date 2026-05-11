# Care Next Action Deduplication Decisions

## Proposed decisions

### Keep Next Action

Decision: keep the Next Action card as the command-center highlight.

Rationale: the Care tab should answer “what should I do first?” without requiring the user to scan all recommendations.

Status: accepted.

### Hide the promoted recommendation from active list

Decision: when Next Action is sourced from a recommendation, remove that same recommendation from the active Recommendations list.

Rationale: avoids duplicate UI and clarifies that Next Action is the top item, not a separate record.

Status: accepted.

### Keep inactive/completed/dismissed visible

Decision: only dedupe active/suggested recommendations; keep inactive history visible.

Rationale: completed/dismissed items are historical/provenance context, not competing next actions.

Status: accepted.
