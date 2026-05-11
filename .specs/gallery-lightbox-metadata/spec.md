# Gallery Lightbox Metadata Spec

## Summary

Improve the Gallery photo lightbox header so it does not repeat the plant name/id and does not show confusing relative offsets such as `-4d`. Replace the duplicate line with more useful photo metadata.

## Goals

- Keep the primary header date.
- Replace the secondary plant-id/name line with useful context that is not a duplicate of the visible plant name elsewhere.
- Prefer photo source/context such as `Camera capture`, `Saved to plant`, or AI/manual tag counts.
- Avoid raw IDs in user-facing gallery UI.
- Avoid negative relative-day labels in Gallery; use formatted dates instead.

## Non-goals

- No new gallery filtering or tagging UI.
- No database schema change.
- No redesign of the lightbox.
