# Care Section Foundation Decisions

## Accepted direction

### Split care roadmap into four specs

Decision: care work will be split into four specs:

1. Care section foundation.
2. Quick care logging.
3. AI care recommendations.
4. Care profile / plant preferences.

Rationale: the foundation is primarily read/display UI, while logging, AI recommendation generation, and care-profile storage each introduce separate data and UX concerns.

Status: accepted.

### Foundation is read-only

Decision: this first care section slice will not add mutation flows.

Rationale: a structured read-only dashboard gives immediate value and creates the UI target for later logging/recommendation actions without mixing too many concerns.

Status: accepted.

### Use existing local data only

Decision: use `careEvents`, `careRecommendations`, `aiInsights`, and plant status/action fields already loaded by Plant Detail.

Rationale: no backend or schema work is needed for the foundation.

Status: accepted.

## Deferred

- Quick logging buttons/forms.
- Accept/dismiss/complete recommendation actions.
- Backend-generated AI care recommendations.
- Persistent care profile/preferences.
- Notifications/reminders.
