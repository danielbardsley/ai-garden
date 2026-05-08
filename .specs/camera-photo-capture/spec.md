# Camera Photo Capture Spec

## Summary

Implement the first real photo-capture loop for Garden Roof Deck. The app should request camera permission, capture a photo, save local media metadata into the SQLite-backed storage model, create an observation timeline entry, associate the photo with a plant, and make the new entry appear in Plant Detail and Gallery.

AI plant identification remains mocked/manual in this phase. The goal is to prove the local photo journal loop before adding real AI labeling.

## Goals

- Replace the current mocked camera route with a real camera capture experience.
- Request and handle camera permission on device.
- Capture a photo using Expo-compatible camera APIs.
- Persist photo metadata in SQLite via the existing repository/storage layer.
- Create a matching `observation` row for each saved captured photo.
- Associate captured photos with an existing plant.
- Show newly saved photos in:
  - Plant Detail timeline.
  - Gallery.
  - Home latest-photo/card data where applicable.
- Preserve current visual direction and “AI Garden” camera feel: dark viewfinder, scanning/identified result language, warm garden-neighbor tone.
- Keep web export and platform validation healthy.

## Non-goals

- No real AI plant identification yet.
- No cloud upload or sync.
- No remote image storage.
- No full photo editing/cropping workflow.
- No background upload queue.
- No push notifications/reminders.
- No plant creation wizard beyond a simple deferred placeholder unless low-risk.

## Dependencies

Likely Expo packages:

- `expo-camera` for capture and permission handling.
- Possibly `expo-file-system` if captured file movement/copying is needed.

Use Expo SDK 54-compatible package versions via `npx expo install`.

## User flow

### Entry points

- Bottom nav camera FAB opens `/camera`.
- Plant Detail “Log a new photo” opens `/camera` with optional plant context if available.
- Gallery may continue to open camera later, but not required for this slice.

### Permission states

The camera route must handle:

- permission loading/unknown.
- permission denied.
- permission can be requested.
- permission granted.

Denied state should be friendly and explain why the camera is needed. It should offer a retry/request action when possible.

### Capture flow

1. User opens camera.
2. Camera viewfinder appears.
3. User taps shutter.
4. App captures photo.
5. App shows a short mocked scanning state.
6. App presents a result/save panel:
   - selected/matched plant if launched from Plant Detail or if mock match chooses one.
   - ability to choose another existing plant.
   - save action.
   - retake action.
7. User saves.
8. App creates:
   - `observations` row.
   - `photos` row.
   - optional basic `photo_tags` rows from mocked/system tags.
9. App navigates to that plant detail or back to prior route.
10. Timeline and Gallery include the new photo.

## Data changes

Use the existing schema from `.specs/plant-records-storage/`.

### Observation insert

For each saved photo, create an `observations` row:

- `id`: UUID.
- `plant_id`: selected plant id.
- `season_id`: current season if known; nullable otherwise.
- `location_id`: selected plant location id.
- `observed_on`: local date (`YYYY-MM-DD`).
- `observed_at`: timestamp.
- `title`: nullable or generated like `Photo log`.
- `note`: default short generated note such as `New photo captured from camera.`; later editable.
- `kind`: `photo`.
- `mood`: `neutral` or inferred from selected plant status.

### Photo insert

For each saved photo, create a `photos` row:

- `id`: UUID.
- `observation_id`: created observation id.
- `plant_id`: selected plant id.
- `location_id`: selected plant location id.
- `local_uri`: captured image URI or app-owned copied URI.
- `thumbnail_uri`: nullable in this slice.
- `mime_type`: likely `image/jpeg` if known.
- `width`, `height`: from camera result if available.
- `taken_at`: timestamp.
- `captured_on`: local date.
- `source`: `camera`.
- `is_cover_candidate`: true if plant has no real photos or user selects cover later; default false is acceptable.
- `tone`: optional generated placeholder tone based on selected plant color for current stylized UI compatibility.

### Photo tags insert

Optional but recommended system tags for continuity with current UI:

- `camera`
- selected plant common name keyword
- `new growth` or `garden journal`

These should be marked `source = system`, not AI.

## Repository/API changes

Add write methods to the garden records repositories.

Recommended APIs:

```ts
PlantRepository.listActivePlants(): Promise<PlantRecord[]>
PlantRepository.getPlantById(id: string): Promise<PlantRecord | null>
ObservationRepository.createPhotoObservation(input): Promise<ObservationRecord>
PhotoRepository.createCapturedPhoto(input): Promise<PhotoRecord>
PhotoRepository.listGalleryPhotos(filter?): Promise<PhotoRecord[]>
```

A higher-level service may be clearer:

```ts
CameraCaptureService.saveCapturedPhoto({
  plantId,
  localUri,
  width,
  height,
  mimeType,
  note,
}): Promise<{ observation: ObservationRecord; photo: PhotoRecord }>
```

The service should wrap observation/photo/tag inserts in a transaction.

## File/media handling

Captured photo files may initially remain at the URI returned by `expo-camera` if stable enough for Expo Go/dev. If Expo camera returns a cache URI, copy/move to an app-owned durable directory before saving the metadata.

Decision to make during implementation after checking Expo Camera result behavior:

- If capture URI is stable: store it directly for v1.
- If cache URI is temporary: copy into app document directory and store the copied URI.

Do not store image binary blobs in SQLite.

## UI requirements

### Camera screen

Preserve the design language:

- dark fullscreen camera mode.
- top-left close/back control.
- top-right “AI plant ID” or “Garden camera” badge.
- centered framing guidance.
- bottom shutter control.
- retake/save actions after capture.

### Plant picker/result panel

Since real AI is deferred, offer a simple plant association path:

- If camera launched from plant detail, preselect that plant.
- Otherwise mock a suggested plant or default to a simple selectable list/sheet of active plants.
- User can save to selected plant.
- User can retake.

### Success behavior

After save:

- Navigate to selected plant detail.
- Show or preserve a lightweight success message if low-risk.
- The timeline should include the new observation after repository reload.
- Gallery should include the new photo after repository reload.

## Routing

Current route `/camera` remains the camera route.

Optional route parameter:

```text
/camera?plantId=<id>
```

Plant Detail “Log a new photo” should pass the plant id.

## Web behavior

Web export should not break.

Because native camera is device-only:

- Web `/camera` may render a graceful unsupported/mock camera message.
- Static export must continue passing path-prefix smoke checks.
- Native Expo Go path is the primary target for real capture.

## Error handling

Handle:

- permission denied.
- capture failure.
- save failure.
- missing selected plant.
- SQLite write failure.
- unavailable camera on web/simulator.

Errors should be visible but calm, using the app’s design language.

## Validation

Required checks:

- `npm run typecheck`
- `npm run build:web`
- `npm run smoke:web`
- `scripts/app-platform validate`
- `scripts/app-platform smoke garden-roof-deck`
- Expo Go manual test:
  - open camera route.
  - grant permission or verify permission-denied state.
  - capture a photo.
  - save to a plant.
  - verify plant timeline updates.
  - verify gallery updates.

## Deferred follow-up specs

- AI plant identification from captured images.
- Photo note editing and metadata editing.
- Plant creation wizard from camera result.
- Real image thumbnails and performance tuning.
- Cloud sync/media upload.
