# Care Completed Recommendation Archive Decisions

## Proposed decisions

### Soft-delete, do not hard delete

Decision: hide completed recommendation cards by setting `deleted_at`, not by hard deleting.

Rationale: preserves local provenance and aligns with existing table pattern/query filters.

Status: accepted.

### Completed cards only

Decision: this archive interaction applies only to inactive/completed/dismissed recommendations.

Rationale: active recommendation lifecycle is handled through Next Action completion; archiving active suggestions needs a separate dismiss/skip design.

Status: accepted.

### Keep Hide fallback

Decision: add a `Hide` button in addition to swipe.

Rationale: discoverability, accessibility, and web/dev testing.

Status: accepted.
