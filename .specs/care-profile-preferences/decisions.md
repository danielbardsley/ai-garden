# Care Profile / Plant Preferences Decisions

## Proposed decisions

### Separate care profile table

Decision: store care profile data in a separate `care_profiles` table rather than adding columns to `plants`.

Rationale: profile fields are a distinct care domain and may grow independently.

Status: accepted.

### Free-text fields in v1

Decision: use free-text fields instead of controlled pickers for light/water/fertilizer/etc.

Rationale: this is fastest and flexible for a personal garden journal; structured options can come later.

Status: accepted.

### Manual-first profile updates

Decision: user edits profile manually in v1.

Rationale: AI should not rewrite stable care preferences without review.

Status: accepted.

### Include profile in AI context

Decision: include care profile in Ask AI and AI care recommendation context.

Rationale: stable plant preferences should improve care advice.

Status: accepted.
