# AI Home Title Decisions

- The title should be context-aware and personalized, but Home must render without waiting for AI.
- Any AI title must be sanitized and length-limited before display.
- The app should have deterministic local fallback copy for offline, missing-secret, or failed-provider cases.
- Generated titles should use compact derived context, not raw full records.
- The title should remain short and layout-safe rather than becoming a daily briefing.
- Cache the latest AI-generated title locally so Home can show a good title immediately on normal app opens.
- Regenerate only when title is stale or compact context materially changes; avoid regenerating on every open.
- A subtle animated/loading title is acceptable only for first generation or refresh, not as a blocking page load.
- Keep the current “garden/deck is waking up” warmth as the tone anchor for generated and fallback titles.
- Time of day and garden state should shape title generation whenever available; calm garden-state copy beats generic greetings.
- Highly contextual generation is required; generic pleasant copy is only acceptable as fallback when context is thin.
