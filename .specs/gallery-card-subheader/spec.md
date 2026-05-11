# Gallery Card Subheader Spec

## Summary

Fix the Gallery page card/list metadata so plant names are not shown twice. The subheader under or near a plant/photo card should provide different useful context instead of repeating the plant name.

## Problem

Current Gallery UI can show the same plant name in both the main label and subheader/secondary label. This makes the card feel redundant and wastes a useful metadata slot. A separate relative offset such as `-4d` is also unclear to users, especially when fixture/future dates are involved.

## Goals

- Do not repeat the plant name in the Gallery card subheader when the primary label is already the plant name.
- Replace the duplicate subheader with more useful metadata.
- Use data already available locally; no backend or schema change.
- Avoid negative relative-day copy like `-4d` in Gallery.
- Keep the lightbox header metadata cleanup already done.

## Proposed subheader content

For a plant/photo card where the title is the plant name, use a compact metadata line such as:

- Latest photo date, e.g. `Photo May 8`
- Number of saved photos for that plant, e.g. `3 photos`
- Optional status/next-action if date/photo count is unavailable, e.g. `Needs water` or `Fruiting`

Recommended first implementation:

`{photoCount} photo(s) · latest {short date}`

Examples:

- `1 photo · latest May 8`
- `4 photos · latest May 11`
- `No photos yet` if empty

## Non-goals

- No redesign of Gallery layout.
- No new persisted metadata.
- No new relative-date system.
- No changes to plant detail timeline copy unless it is directly causing the Gallery issue.

## Open implementation notes

- Inspect the exact Gallery area from the screenshot. The duplicated name may be in a card component outside the lightbox header, not the previously fixed lightbox metadata.
- Prefer adding a small view-model formatter with tests so copy behavior stays stable.
