# AI-First Camera Capture Flow Acceptance Criteria

## Core happy path

- [ ] User can open camera in Expo Go.
- [ ] User can capture a photo.
- [ ] App shows an analyzing state before asking where to save.
- [ ] Backend receives the captured image and plant inventory context.
- [ ] Backend returns at least one ranked plant match when confident.
- [ ] App shows the suggested plant before save.
- [ ] User can confirm the suggested plant.
- [ ] App saves the photo to the confirmed plant.
- [ ] Gallery shows the saved photo.
- [ ] Gallery lightbox shows AI tags from the pre-save analysis.
- [ ] Plant Detail timeline shows AI insight from the pre-save analysis.

## Correction path

- [ ] User can choose a different plant than the AI suggestion.
- [ ] Photo saves to the user-selected plant, not the AI-suggested plant.
- [ ] AI tags/insight still persist if valid and applicable.
- [ ] Match provenance records the AI suggestion and user correction.

## Low-confidence path

- [ ] If backend returns no confident plant match, UI does not pretend certainty.
- [ ] User can manually choose a plant.
- [ ] Photo saves locally.
- [ ] Match provenance records manual/low-confidence fallback.

## Backend unavailable path

- [ ] If backend is stopped/unreachable, capture still works.
- [ ] UI falls back to manual plant selection.
- [ ] Save succeeds locally.
- [ ] No red screen or unhandled promise rejection appears.

## Launched-from plant path

- [ ] Opening camera from Plant Detail passes route plant context.
- [ ] If AI agrees with route plant, confirmation flow is short and clear.
- [ ] If AI suggests another plant, user is shown the disagreement and can choose.

## Data integrity

- [ ] No local observation/photo rows are created until user confirms save.
- [ ] Retake does not leave local journal rows.
- [ ] AI tags are stored with `source = ai`.
- [ ] AI insight stores `source_run_id`.
- [ ] Backend does not persist image bytes/base64 in run output or logs.
- [ ] Existing photo capture/gallery/timeline behavior remains intact.

## Validation gates

- [ ] Backend tests pass.
- [ ] TypeScript typecheck passes.
- [ ] Web build passes.
- [ ] Web smoke passes.
- [ ] Platform validate passes.
- [ ] Platform smoke passes.
- [ ] Manual Expo Go happy path passes.
- [ ] Manual Expo Go correction path passes.
- [ ] Manual Expo Go backend-down fallback passes.

## User-visible quality

- [ ] Copy clearly communicates AI suggestion vs confirmed truth.
- [ ] Confidence language is understandable.
- [ ] No UI says “AI comes next” after AI-first flow is implemented.
- [ ] Flow feels faster than manual journaling for normal captures.
