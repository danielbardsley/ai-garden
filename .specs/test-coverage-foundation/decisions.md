# Test Coverage Foundation Decisions

## 2026-05-09 — Spec-first coverage foundation

Decision: Treat 80% frontend/backend test coverage as a non-trivial platform-quality feature and specify it before implementation.

Rationale: The project has had multiple regressions caused by interactions between clean-slate storage, camera save flow, AI identification output shape, and UI assumptions. Coverage affects tooling, scripts, mocks, and development workflow, so it should be explicit.

## 2026-05-09 — Backend coverage target

Decision: Use `pytest-cov` and enforce at least 80% coverage for `backend/app`.

Rationale: Backend already uses pytest and FastAPI TestClient. `pytest-cov` is the lowest-friction extension.

## 2026-05-09 — Frontend testing direction

Decision: Prefer Jest with Expo/React Native-compatible configuration for frontend tests, but allow Vitest for pure TypeScript units if Expo/Jest compatibility becomes disproportionately expensive.

Rationale: The app is Expo/React Native, so Jest aligns with common RN/Expo testing patterns. However, most first-pass coverage should target pure logic/services, and the implementation should not get stuck on brittle native transforms if Vitest provides a safer foundation.

## 2026-05-09 — No live AI calls in tests

Decision: Tests must not require OpenAI credentials or make live provider calls.

Rationale: Coverage should be deterministic, fast, and safe for local/CI use.


## 2026-05-09 — No production mock agent behavior

Decision: Remove production `_mock_capture_reflection` and `_mock_photo_identification`; tests may use monkeypatch/test doubles, but app/backend runtime must not silently fake AI behavior when `OPENAI_API_KEY` is missing.

Rationale: The user explicitly prefers no mock behavior outside test classes. Missing provider configuration should surface as a failed agent run so integration issues are visible instead of producing misleading fake AI output.
