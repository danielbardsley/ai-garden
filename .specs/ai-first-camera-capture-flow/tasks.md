# AI-First Camera Capture Flow Tasks

## Spec and design

- [x] Create comprehensive AI-first camera capture flow spec.
- [ ] Review UX flow with Daniel.
- [ ] Confirm whether unknown/new plant candidate is deferred or included as a minimal fallback.
- [x] Confirm confidence thresholds for auto-suggest copy.
- [ ] Confirm whether post-save categorization should be disabled once pre-save identification succeeds.

## Backend contract

- [x] Add/confirm `PhotoIdentificationRequest` schema.
- [x] Add/confirm `PhotoIdentificationOutput` schema with ranked `plantMatches`.
- [x] Add `POST /agent/photo-identifications` multipart endpoint.
- [x] Ensure endpoint returns inline `runId`, `status`, `providerConfigured`, `output`, and `error` as appropriate.
- [x] Prompt Agno/OpenAI to match only against provided plant ids.
- [x] Ensure low-confidence/unknown behavior returns no invented plant ids.
- [x] Persist backend run output in `agent_runs`.
- [x] Avoid persisting image bytes/base64.
- [x] Add backend tests for no-key/mock output.
- [x] Add backend tests for ranked plant match output.
- [x] Add backend tests for invalid/missing image handling.
- [ ] Add backend tests for low-confidence/no-match output.

## Mobile request/context

- [x] Add compact plant inventory context builder.
- [x] Include launched-from plant prior when route has `plantId`.
- [x] Add API client method for `/agent/photo-identifications` multipart upload.
- [x] Add `GardenAgentService.identifyCapturedPhoto` returning transient analysis result.
- [ ] Make native direct API origin configurable without hard-coded long-term tailnet IP.
- [x] Ensure web skips native-only identification path gracefully.

## Camera UI

- [x] Refactor `CameraScreen` into explicit capture/analyze/confirm/save states.
- [x] After shutter, show captured preview and analyzing state before plant save panel.
- [x] Show top AI suggested plant with confidence label and rationale.
- [x] Show AI tags/insight preview before save.
- [x] Add `Choose another plant` correction path.
- [x] Add low-confidence “I’m not sure” manual selection path.
- [x] Add backend unavailable manual fallback path.
- [x] Preserve retake behavior.
- [x] Update copy to remove “manual match for now” style language.
- [ ] Keep launched-from Plant Detail flow understandable when AI disagrees with route plant.

## Persistence

- [x] Update `CameraCaptureService.saveCapturedPhoto` to accept pre-save AI analysis.
- [x] Persist AI tags from pre-save analysis after confirmed save.
- [x] Persist AI insight from pre-save analysis after confirmed save.
- [x] Avoid duplicate post-save AI categorization when pre-save analysis succeeds.
- [x] Add `photo_plant_matches` table or equivalent provenance storage.
- [x] Add repository for plant match provenance.
- [x] Persist `ai_confirmed`, `ai_corrected`, or `manual_fallback` source.
- [x] Ensure manually corrected plant assignment wins over AI suggestion.

## Display

- [x] Gallery lightbox continues to show AI tags after save.
- [x] Plant Detail timeline continues to show AI insight after save.
- [ ] Optional: display plant-match provenance in developer/debug UI only.
- [x] Ensure no UI implies AI made final assignment without user confirmation.

## Failure handling

- [x] Analysis timeout falls back to manual plant selection.
- [x] Backend 4xx/5xx falls back to manual plant selection.
- [x] Invalid output falls back to manual plant selection.
- [x] OpenAI/key unavailable falls back to manual plant selection.
- [x] Local save failure still shows existing save error.
- [x] Retake discards transient analysis.

## Validation

- [x] Backend tests pass.
- [x] `npm run typecheck`.
- [x] `npm run build:web`.
- [x] `npm run smoke:web`.
- [x] `/srv/projects/openclaw-app-platform/scripts/app-platform validate`.
- [x] `/srv/projects/openclaw-app-platform/scripts/app-platform smoke garden-roof-deck`.
- [x] Local API smoke: no-key/mock pre-save identification.
- [ ] Local API smoke: OpenAI configured pre-save identification.
- [ ] Expo Go: camera capture → AI suggests plant → confirm save → Gallery tags visible.
- [ ] Expo Go: camera capture → AI suggests plant → confirm save → Plant Detail AI note visible.
- [ ] Expo Go: backend unavailable → manual save still works.
- [ ] Expo Go: AI suggests wrong plant → choose another → saved to corrected plant.
- [ ] Expo Go: launched from Plant Detail, AI agrees/disagrees behavior tested.

## Commit

- [ ] Commit AI-first capture spec.
- [ ] Commit implementation after validation.
