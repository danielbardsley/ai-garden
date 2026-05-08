# Camera Photo Capture Decisions

## Decision 1 — Implement real capture before real AI

The next slice should implement real camera/photo capture and local persistence while keeping plant identification mocked/manual.

Rationale: captured image storage is the foundation for AI labeling, gallery, timeline, and future sync. Real AI can be added safely once photo capture and metadata persistence are reliable.

## Decision 2 — Use existing SQLite storage model

Captured photos should create `observations` and `photos` rows in the existing local SQLite schema.

Rationale: this validates the storage model and makes the current UI materially data-backed instead of adding another temporary data path.

## Decision 3 — Web keeps a graceful fallback

The real camera experience targets native Expo Go. Web should show a graceful unsupported/mock state and must continue to build/export under `/apps/garden-roof-deck/`.

Rationale: platform web validation should remain stable, but the product value of camera capture is device-native.

## Decision 4 — Store metadata, not image blobs

SQLite stores photo URI and metadata only. Captured image bytes remain in the device file/media layer.

Rationale: this keeps SQLite fast and aligned with the storage model spec.

## Decision 5 — Persist camera cache files into app document storage

Expo Camera returns native photo URIs in cache. The implementation copies each captured image into the app document directory under `garden-photos/` before storing the SQLite `photos.local_uri` value.

Rationale: app-owned document storage is more durable than camera cache and keeps SQLite as metadata only.

## Decision 6 — Save flow is native-only with web fallback

The real `CameraView` and SQLite write flow run on native devices. Web `/camera` renders a graceful explanatory fallback.

Rationale: real camera/photo journaling is a phone feature, and the app platform static web export must remain stable.
