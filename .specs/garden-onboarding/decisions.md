# Garden Onboarding Decisions

- Use the imported design as visual/product direction, not as production code to copy directly.
- Keep the botanical-journal voice and specimen-card visual language.
- Broaden onboarding content beyond roof decks/balconies to support standard back gardens, in-ground beds, raised beds, allotments/community plots, greenhouses, patios, containers, and indoor/window growing.
- Remove the prototype's starter seedlings / “what's already growing” step. Plant creation should happen after setup through the app's add-plant/camera flow.
- Keep onboarding local-first. No auth, cloud sync, account setup, or remote profile requirement.
- Prefer storing v1 setup as JSON in existing local app settings unless implementation reveals a strong reason for a dedicated gardens table.
- Remove skip from the production onboarding flow; new users should complete setup before entering the app.
- Defer goals and experience level to the future Profile/preferences feature instead of collecting them in onboarding v1.
- Route users to Home after onboarding completion, with a prominent first-plant add/capture prompt rather than launching camera/add-plant directly.
