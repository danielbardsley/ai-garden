# AI-First Camera Capture Flow Decisions

## 2026-05-08 — AI analysis should happen before plant assignment

Decision: The camera flow should move from post-save categorization to pre-save identification.

Rationale:

- The user expects `take photo → identify/tag → save to identified plant`.
- Requiring manual plant choice before AI analysis undermines the AI-first product direction.
- Pre-save analysis lets the app attach AI outputs to the confirmed plant and record whether the user accepted or corrected the suggestion.

## 2026-05-08 — User confirmation remains required

Decision: AI may suggest a plant, but the user confirms or corrects before save.

Rationale:

- Vision model identification can be wrong, especially among visually similar plants.
- The local journal should not silently attach photos to the wrong plant.
- User corrections become valuable future feedback/provenance.

## 2026-05-08 — Use existing FastAPI + Agno backend

Decision: Implement pre-save identification through the existing Python/FastAPI backend using Agno/OpenAI vision, not direct mobile OpenAI calls.

Rationale:

- Keeps API keys server-side.
- Reuses the proven categorization plumbing.
- Keeps provider/model details out of the Expo app.
- Aligns with the AI Garden Agent Foundation direction.

## 2026-05-08 — Backend receives image transiently only

Decision: Continue local durable photo storage; backend receives image bytes only for analysis and should not persist them by default.

Rationale:

- Maintains local-first product posture.
- Reduces privacy and storage concerns.
- Backend run history needs structured output, not image blobs.

## 2026-05-08 — Add match provenance

Decision: Persist whether a saved photo was AI-confirmed, AI-corrected, manual fallback, or launched-from-confirmed.

Rationale:

- Enables future learning/evaluation.
- Makes it possible to audit AI mistakes.
- Avoids conflating AI suggestion with user-confirmed truth.

Preferred implementation: separate `photo_plant_matches` table rather than many nullable columns on `photos`.

## Open questions

- Should unknown/new plant candidate be supported in v1, or deferred?
- Should low-confidence AI tags still persist if the user manually chooses a plant?
- Should post-save categorization remain as a fallback if pre-save identification fails?
- Should the app expose confidence values to users or only qualitative labels?
- What timeout feels right on mobile for the analysis step?
