# Care Section Foundation Spec

## Summary

Turn the Plant Detail `Care` tab from a simple note list into a structured care command center for the current plant. This first care slice should use the data that already exists in Garden Roof Deck — `careEvents`, `careRecommendations`, plant status, observations, and AI insights — without adding new logging forms or new AI calls yet.

This is the first of four care-related candidate specs:

1. Care section foundation — current spec.
2. Quick care logging.
3. AI care recommendations.
4. Care profile / plant preferences.

## Product intent

`Ask AI` is for exploratory questions. `Care` should be the practical “what do I do next?” section.

The Care tab should help Daniel quickly answer:

- Is there anything I should do for this plant now?
- What care has happened recently?
- What recommendations are pending or completed?
- What has the system or AI noticed that might affect care?

## Goals

- Replace the current basic care note rendering with a structured Care tab.
- Show a prominent next-action summary for the plant.
- Render care recommendations grouped by status/urgency.
- Render care history from existing `careEvents`.
- Show care-relevant AI insights when present.
- Preserve current Plant Detail visual style.
- Do not require backend changes.
- Do not add new mutation flows yet.
- Keep Timeline and Ask AI behavior unchanged.

## Non-goals

- No new care event creation form in this slice.
- No one-tap logging yet.
- No accepting/dismissing/completing recommendations yet.
- No new AI recommendation generation endpoint yet.
- No care profile storage/editing yet.
- No notifications/reminders.
- No calendar integration.
- No autonomous AI mutations.

## Existing state

Current `PlantDetailScreen.tsx` has tabs:

- `Timeline`
- `Ask AI`
- `Care`

The `Care` tab currently calls `CareNotes(events={careEvents})`, which renders each `CareEventRecord` as a simple card. The detail record already includes:

- `plant`
- `careEvents`
- `careRecommendations`
- `aiInsights`
- `observations`
- `photos`

Relevant record shapes already exist:

- `CareEventRecord`
- `CareRecommendationRecord`
- `AiInsightRecord`
- `PlantRecord.nextActionLabel`
- `PlantRecord.statusKind/statusLabel`

## Proposed UX

### 1. Next action card

Top card in Care tab.

Content priority:

1. If there is an active/pending recommendation with due date today or overdue, show it.
2. Else if there is a suggested recommendation, show the most relevant one.
3. Else if `plant.nextActionLabel` is meaningful and not `No action`, show it.
4. Else show a calm empty state: `No care action queued.`

Card should include:

- label/title,
- due date or timing if present,
- source (`AI suggested`, `manual`, `system`) when available,
- short body/note where available.

No action buttons yet except disabled/placeholder copy if useful.

### 2. Recommendations section

Show existing `careRecommendations` grouped simply:

- `Suggested / active`
- `Completed / dismissed` if any

Each card should show:

- title,
- body,
- due date,
- recommendation type,
- source,
- status.

If there are no recommendations, show a small empty state:

`No recommendations yet. Ask AI or log care over time to build suggestions.`

### 3. Care history section

Render existing `careEvents` as chronological history, newest first.

Each card should show:

- event type normalized into a friendly label,
- event date,
- note,
- source.

If empty:

`No care logged yet.`

### 4. Care-relevant AI notes

Show AI insights where:

- `scope === 'care'`, or
- `kind === 'care_note'`, or
- `kind === 'attention'`, or
- `kind === 'risk'`.

Keep this below recommendations/history so it supports care decisions without becoming the primary task list.

If none exist, omit the section or show a small empty state only if the page otherwise feels sparse.

## Visual design

Stay consistent with existing Plant Detail cards:

- `theme.surface` cards,
- rounded corners,
- subtle border with `theme.line`,
- small uppercase metadata labels,
- serif headings where appropriate,
- concise body text.

Avoid dense tables. This is a mobile-first care dashboard.

## Data behavior

- Read-only in this slice.
- Use existing `PlantDetailRecord` data only.
- Sort recommendations by active/suggested first, then due date if present.
- Sort care events newest first; repository already appears to do this.
- Do not alter persistence schema unless a small derived display helper needs no storage change.

## Edge cases

- If all care data is empty, show an encouraging empty state with a short explanation.
- If only `nextActionLabel` exists, the section should still feel useful.
- If many recommendations exist, show all for now; future spec can add filters/collapse.
- If due dates are missing, avoid misleading urgency.
- If source is `ai_suggested` or `ai`, label it clearly as AI-suggested, not confirmed fact.

## Candidate follow-up specs remembered

### Quick care logging

Add buttons/forms for watered, fertilized, pruned, repotted, harvested, pest check, rotated, etc., and persist `CareEventRecord`s locally.

### AI care recommendations

Use Garden Agent/backend to propose care recommendations from plant history/photos/notes. User can accept/dismiss/mark done. No autonomous record mutation.

### Care profile / plant preferences

Store and edit plant-specific care preferences such as light, water rhythm, fertilizer cadence, pruning notes, and location quirks. Manual first, AI-assisted later.

## Implementation notes

Likely implementation can stay inside `PlantDetailScreen.tsx` for now by replacing `CareNotes` with a richer `CareSection` component. If it grows large, extract to a focused component file later.

Suggested helper functions:

- `selectNextCareAction(plant, recommendations)`
- `formatCareSource(source)`
- `formatCareType(type)`
- `sortCareRecommendations(recommendations)`
- `isCareRelevantInsight(insight)`

## Testing strategy

This is mainly presentation logic. Add lightweight tests if existing test setup can cover pure helpers, especially:

- next action selection priority,
- recommendation sorting/grouping,
- care insight filtering,
- source/type label formatting.

At minimum run:

- `npm run typecheck`
- `npm test -- --runInBand`
- `npm run build:web && npm run smoke:web`
