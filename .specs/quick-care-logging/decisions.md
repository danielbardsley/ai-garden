# Quick Care Logging Decisions

## Proposed / recommended decisions

### Inline composer first

Decision: Use an inline expandable composer in the Care tab rather than a new route or modal.

Rationale: this keeps the first logging slice simple and mobile-friendly.

Status: accepted.

### Today-only date in v1

Decision: Default event date to today and defer date editing.

Rationale: most quick logging happens immediately after care. Date editing can be added later without changing storage.

Status: accepted.

### Manual local events only

Decision: Create `care_events` with `source='manual'` only.

Rationale: AI-generated care suggestions and recommendation state transitions belong to later specs.

Status: accepted.

### Do not auto-complete recommendations

Decision: Logging care will not complete matching recommendations in this slice.

Rationale: matching logged actions to recommendation state needs explicit UX and rules.

Status: accepted.

### Do not create observations

Decision: Quick care logging creates `CareEventRecord`s only, not timeline `ObservationRecord`s.

Rationale: care history is the target surface. Timeline integration can be revisited later.

Status: accepted.
