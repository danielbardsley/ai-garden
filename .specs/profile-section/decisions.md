# Profile Section Decisions

- Profile is the correct home for editing onboarding-created garden setup because it is garden/user configuration.
- First version is garden settings only; account identity, reminders, sync, and export are deferred.
- Use existing local-first garden setup persistence instead of adding a new settings store.
- Keep location detection opt-in and reuse the onboarding service.
- Do not include destructive reset/delete garden controls in the initial implementation.
