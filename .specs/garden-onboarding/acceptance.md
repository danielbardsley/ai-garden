# Garden Onboarding Acceptance Criteria

## Product acceptance

- New users without garden setup see onboarding before the main app and cannot skip setup.
- Existing users with setup go directly to the main app.
- User can name the garden and choose a short glyph/stamp.
- User can enter a coarse location and choose/skip hardiness zone.
- User can choose sun exposure.
- User can select from broad garden-space options including standard back garden/in-ground/raised bed choices.
- Flow does not include a “what's already growing” / starter plants step.
- Completion persists setup locally.
- Completion routes to Home with a clear next action to add/capture the first plant.
- Bottom nav is hidden during onboarding.

## Technical acceptance

- Onboarding works in Expo Go and web export.
- Garden setup is loaded through a repository/service, not hard-coded component state.
- Storage errors have user-visible copy and retry path.
- The implementation does not break current demo/sample data.
- TypeScript typecheck passes.
- Jest tests cover route decision, validation, persistence, no-skip behavior, and garden-space options.
