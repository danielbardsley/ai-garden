# Garden Onboarding Spec

## Purpose

Add a first-run onboarding flow that lets a new user create and personalize their initial garden before landing in the main app. The flow should take visual and interaction cues from the imported Claude Design onboarding prototype while adapting the content for a broader set of garden types, not only roof decks and balconies.

## Design source

Design bundle fetched from:

- `https://api.anthropic.com/v1/design/h/7WPm3fbCeTkbKXjoVGDQUQ?open_file=AI+Garden.html`

Local inspection path during spec creation:

- `/tmp/ai-garden-design/extracted/ai-garden-app/README.md`
- `/tmp/ai-garden-design/extracted/ai-garden-app/chats/`
- `/tmp/ai-garden-design/extracted/ai-garden-app/project/AI Garden.html`
- `/tmp/ai-garden-design/extracted/ai-garden-app/project/onboarding.jsx`

Relevant design intent:

- Botanical-journal tone and styling should match the existing app: editorial serif headings, muted paper/forest palette, specimen-card visuals, mono stamp/progress details, rounded cards/chips.
- Prototype flow is Welcome → Name → Place → Beds → Seedlings → Ready.
- User direction for implementation: use the design as a guide, broaden beyond roof decks/balconies, and remove the “what’s already growing” / starter seedlings step. Existing add-plants flow should be entered after setup is complete.

## Goals

- Show onboarding when there is no configured garden yet.
- Let the user create a first garden with enough context to personalize home copy, AI context, weather, reminders, and profile later.
- Support common garden setups: back gardens, in-ground beds, raised beds, containers, balconies, roof decks, patios, allotments/community plots, and indoor/window growing.
- Persist onboarding data locally.
- Keep implementation local-first with no auth, account creation, cloud sync, or remote profile dependency.
- Preserve the current demo/sample data behavior in a deliberate way rather than silently pretending seeded demo data is the user's configured garden.

## Non-goals

- Do not implement the add-plants flow in this spec.
- Do not implement reminders, notification scheduling, or profile screens in this spec.
- Do not implement cloud sync, auth, user accounts, multi-garden switching, or sharing.
- Do not ask “what’s already growing” during onboarding.
- Do not require precise geolocation; typed city/postcode/location text is enough for v1.

## Proposed flow

The production flow should have five screens:

1. Welcome
2. Garden identity
3. Location and climate
4. Garden setup
5. Ready / next action

### 1. Welcome

Purpose: introduce the app and first-run value.

Content direction:

- Botanical specimen plate / field-journal visual, adapted from the design.
- Headline in the spirit of: “Plant something, watch it remember.”
- Copy should include broader spaces: garden, patio, balcony, roof deck, allotment, windowsill.
- Benefit bullets:
  - Identify and save plant photos.
  - Build a timeline per plant.
  - Get gentle care nudges and AI help.

Actions:

- Primary: “Start your garden”
- No skip action in production. Users should complete the short setup before entering the app.

### 2. Garden identity

Purpose: create the garden record’s display identity.

Fields:

- Garden name, required, max length 28.
- Specimen stamp/glyph, optional, short text token selected from chips.

Suggested name chips should include broad garden types, not only roof/balcony examples:

- Back Garden
- Kitchen Garden
- Patio Garden
- The Greenhouse
- Roof Garden
- Balcony Garden
- Windowsill
- Allotment Plot

Validation:

- Cannot continue without a non-empty garden name.

### 3. Location and climate

Purpose: collect coarse location and growing conditions for weather/AI/reminder personalization.

Fields:

- City/postcode/location label, required as plain text.
- Automatic current-location detection using the existing `LocationPermissionService` when the user taps “Use current location”.
- Automatic USDA zone estimate using the existing `ZoneService` when coordinates are available and a US zone can be estimated.
- Hardiness zone remains editable/manual and allows “Not sure” when detection is denied, unavailable, outside USDA coverage, or inaccurate.
- Daily sun/exposure: Mostly shade, Partial sun, Full sun.

Notes:

- Location permission should be requested only after explicit user intent, not on screen load.
- Reverse geocoding should produce a friendly location label when available; otherwise use a coarse coordinate label.
- Zone detection is best-effort and should be clearly labeled as estimated.

### 4. Garden setup

Purpose: capture the growing environment without assuming a roof deck.

Multi-select growing spaces/options:

- In-ground beds
- Raised beds
- Containers / pots
- Patio / courtyard
- Balcony / roof deck
- Greenhouse / cold frame
- Indoor / windowsill
- Allotment / community plot

Deferred to Profile for a later profile/preferences feature:

- Main goal chips: Food, Flowers, Herbs, Houseplants, Wildlife, Learning, Low-maintenance.
- Experience level: New gardener, Some experience, Experienced.

Validation:

- Can continue with zero selected spaces, but UI should encourage choosing at least one.

### 5. Ready / next action

Purpose: confirm setup and route into the main app with a clear next action.

Content:

- Recap specimen card showing garden name, location, zone/“not sure”, sun, and selected spaces.
- Tip card about the weekly photo rhythm.
- Primary CTA should open the home screen after setup.

Initial routing recommendation:

- After onboarding completion, route to the home screen with the configured garden context and a clear “Add your first plant” / camera-oriented prompt.

## Data model

Add local-first garden setup state. Prefer a small repository/service around app settings rather than hard-coding onboarding completion in component state.

Suggested TypeScript shape:

```ts
export type GardenSetup = {
  id: string;
  name: string;
  glyph?: string | null;
  locationLabel: string;
  locationSource?: 'manual' | 'detected' | null;
  latitude?: number | null;
  longitude?: number | null;
  hardinessZone?: string | null;
  hardinessZoneSource?: 'manual' | 'detected' | null;
  sunExposure?: 'shade' | 'partial' | 'full' | null;
  growingSpaces: string[];
  createdAt: string;
  updatedAt: string;
};
```

Persistence options:

- Preferred: use existing SQLite `app_settings` table with a `garden.setup` JSON record for v1.
- Alternative: add a dedicated `gardens` table only if it clearly benefits near-term profile/reminder work.

Sample/demo data policy:

- Existing seeded/demo plant data may remain as sample content until a later add/adopt/migration flow replaces it.
- Onboarding completion creates a user garden setup; sample/demo state remains separate from setup completion.
- The UI should avoid copy implying demo plants are definitely the user’s own plants after onboarding unless/until there is an explicit import/adoption step.

## UI integration

- Add an onboarding route/screen that hides the bottom nav while active.
- First app launch should check persisted setup state before showing Home.
- Existing Home should use the configured garden name/location where sensible.
- Provide a development/test way to reset/replay onboarding without requiring destructive database edits. This can be a temporary dev helper or future Profile action; if shipped visibly, label it clearly.

## Error and edge states

- Loading persisted setup: show calm loading copy rather than flashing home/onboarding.
- Storage failure: allow retry and show a clear local-storage error.
- Location denied/unavailable: keep manual location and zone controls usable and show calm inline copy.
- User backs out mid-flow: preserve in-memory state during the current app session; persisted drafts are optional for v1. There is no production skip path.
- Missing optional fields should render gracefully as “Not sure” or omitted recap rows.

## Accessibility and UX

- Buttons/chips should have accessible labels and clear selected state.
- Text inputs should be keyboard-friendly on mobile.
- Required field errors should be expressed in copy, not only disabled buttons.
- Progress should be visible via dots or step stamp.
- The flow should work in Expo Go and web static export.

## Testing expectations

Frontend tests should cover:

- initial route decision: no setup → onboarding, setup exists → home
- identity step validation
- garden setup persistence request
- no skip action is rendered
- broad garden-space options include standard back-garden choices
- automatic location success/denied/unavailable behavior
- automatic zone estimate applied when available
- no starter-plants/“what’s already growing” step is present

Backend tests are not expected unless API/backend changes become necessary.

## Resolved decisions


- Skip is removed for production.
- Goals and experience level are deferred to Profile.
- Setup completion routes to Home with a prominent first-plant prompt.
