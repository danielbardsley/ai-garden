# Camera Scanning Overlay Spec

## Purpose

Replace the static analysis-state treatment with a clear scanning animation over the captured image while the plant identification request is processing.

## Current state

After capture, the app shows the captured photo with a dark overlay and a static scan line. A separate bottom text label says “identifying plant…”. That label is redundant with the overlay and should be removed immediately.

## Goals

- Keep the captured image visible while analysis runs.
- Show an animated scanning treatment directly over the image.
- Communicate progress/state without using bottom identifying text.
- Preserve the botanical camera visual style.
- Work in Expo Go without adding heavyweight animation dependencies.

## Non-goals

- Do not implement real progress percentages from the backend.
- Do not redesign the post-identification result card.
- Do not change the AI identification API contract.

## UX direction

During `phase === 'analyzing'`:

- Display captured image full-screen.
- Apply a subtle dark/green tint overlay.
- Animate one or more scan lines/sweeps over the image.
- Include compact in-image copy such as “Scanning leaf structure” or “Reading garden photo” if needed, but avoid a separate bottom footer label.
- Prefer movement that feels calm and botanical rather than harsh sci-fi.

## Implementation notes

- Use React Native `Animated` or built-in Expo-compatible primitives.
- Animation should start when `ScanningOverlay` mounts and stop automatically on unmount.
- Respect reduced-motion if a project-level accessibility helper exists; otherwise keep motion slow and subtle.
- Keep the overlay component isolated so tests can cover state rendering without invoking camera APIs.

## Acceptance criteria

- The bottom “identifying plant…” footer is gone.
- Analyzing state still clearly indicates processing.
- The scan treatment overlays the captured image, not a separate blank panel.
- TypeScript typecheck passes.
- Existing Jest tests pass.
