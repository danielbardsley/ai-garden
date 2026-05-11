# Remove Specimen Stamp Spec

## Summary

Remove the decorative specimen stamp / glyph concept from Garden Roof Deck. Images and garden setup cards should no longer show bottom-corner text such as `leaf`, initials, or symbolic stamps as an image overlay.

## Goals

- Remove the specimen stamp selection from garden onboarding.
- Stop persisting a garden glyph/stamp from setup.
- Stop rendering glyph/stamp overlays in shared photo treatments.
- Remove decorative `glyph` props from plant cards, gallery cards, camera preview chips, and onboarding cards where they exist only as visual stamps.
- Keep photo placeholders, colors, layout, and plant identity text otherwise intact.

## Non-goals

- No database migration for already-saved `glyph` values in local setup; ignored fields can remain harmlessly stored.
- No redesign of image cards beyond removing the stamp overlay.
- No change to bottom navigation/icon glyphs; those are app icons, not specimen stamps.
