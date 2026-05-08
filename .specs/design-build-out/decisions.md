# Design Build-Out Decisions

## Decision 1 — Implement design natively, not by embedding HTML

Use React Native / Expo Router components to recreate the `AI Garden.html` visual output. Do not embed the prototype HTML/CSS/JS directly.

Rationale: the target app is cross-platform Expo React Native, and the design bundle is a prototype/handoff artifact.

## Decision 2 — Functionality limited to routes and local UI state

This phase intentionally excludes real camera, AI, persistence, upload, reminder, profile, and backend behavior. Navigation, tabs, local filtering, local modal/lightbox, and mocked camera transitions are allowed.

Rationale: user explicitly requested design build-out only, with navigation and routes.

## Decision 3 — Mock plant/photo data is acceptable

Use the handoff's mock plant/photo dataset as fixture content for visual rhythm and navigation. Production models can replace it later.

Rationale: the prototype is data-rich and the visuals rely on plant-specific statuses, timelines, and swatches.

## Decision 4 — Preserve path-prefix web validation

Any design implementation must continue to pass the platform smoke check for `/apps/garden-roof-deck/`.

Rationale: the app is registered in the OpenClaw App Platform and previously required a path-prefix-safe Expo export setup.
