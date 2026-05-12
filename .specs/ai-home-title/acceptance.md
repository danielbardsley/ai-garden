# AI Home Title Acceptance

- [x] Home title is no longer hard-coded static greeting copy.
- [x] Title uses garden/context data when available.
- [x] Title is short, friendly, personalized, and layout-safe.
- [x] Home renders immediately with cached/fallback/loading title if AI is unavailable/slow.
- [x] Title does not regenerate on every app open when cached title is still fresh and context is unchanged.
- [x] First-generation loading animation affects only the title area.
- [x] AI/fallback output is sanitized and capped to 70 characters.
- [x] Tests cover fallback priority and title sanitization.
- [x] Validation passes.
- [x] Title context packet includes time, garden setup, plant state, weather, and recent activity when available.
- [x] Generated title uses at least one meaningful current signal when available, rather than generic garden copy.
