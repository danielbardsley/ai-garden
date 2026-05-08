# Design Build-Out Spec

## Summary

Implement the relevant visual design from the Claude Design handoff file `AI Garden.html` in the Garden Roof Deck Expo app. This phase is a design/navigation build-out only: it should establish the app shell, routes, screen layouts, design tokens, mocked visual data, and navigable UI states without implementing real persistence, AI calls, camera capture, photo upload, reminders, profile, or backend functionality.

## Source design

Fetched bundle:

- URL: `https://api.anthropic.com/v1/design/h/dDzpMhyguJNlC7QK6P3n2A?open_file=AI+Garden.html`
- Local inspection copy: `/tmp/ai-garden-design/extracted/ai-garden-app/`
- README: `/tmp/ai-garden-design/extracted/ai-garden-app/README.md`
- Primary file: `/tmp/ai-garden-design/extracted/ai-garden-app/project/AI Garden.html`
- Supporting files: `app.jsx`, `home.jsx`, `detail.jsx`, `camera.jsx`, `gallery.jsx`, `shared.jsx`, `data.js`, `ios-frame.jsx`, `tweaks-panel.jsx`
- Intent transcript: `/tmp/ai-garden-design/extracted/ai-garden-app/chats/chat1.md`

The README instructs coding agents to read the chat transcript first, then read `AI Garden.html` and imported files. That has been done for this spec.

## User intent from design transcript

The app is for tracking what grows on a garden / roof deck over multiple years. It will eventually include image gallery, camera access, AI plant labeling, and plant-care advice, but this phase should only implement the design and navigation scaffolding.

Design intent:

- Cross-platform React Native app.
- Core screens:
  - Home / dashboard: what is growing now.
  - Individual plant detail: timeline of photos, notes, care history.
  - Camera capture flow with AI plant ID overlay.
  - Photo gallery filterable by plant, date, and later location.
- Vibe: earthy, natural, botanical illustrations, organic shapes, warm greens.
- AI personality: friendly garden neighbor; warm, casual, encouraging.
- Future AI capabilities: identify plants from photo, diagnose issues, suggest care actions, auto-tag gallery photos.
- Tracking: photos over time / growth timeline.
- Garden context: about 10 plants; each plant has its own AI chat and grouped pictures, plus a general gallery view.
- Hero moment: snap a photo → AI identifies the plant → add/save to garden.

## Non-goals for this phase

Do not implement real functionality beyond navigation and routes.

Specifically out of scope:

- Real camera permissions or device camera integration.
- Real photo capture, upload, storage, or gallery persistence.
- Real AI provider calls or backend chat integration.
- Real plant CRUD, reminders, profile, authentication, notifications, weather, location, or care scheduling.
- Backend API changes except if a minimal health check remains untouched.
- Production data models beyond mocked design fixtures.
- Platform routing/deployment changes unless needed to validate existing web export.

Mocked/stubbed interactions are allowed only where they support navigation or route design, such as opening the camera route, switching tabs, selecting plants, filtering gallery fixtures, opening a photo lightbox, and returning from overlays.

## Target implementation platform

Existing app:

- Repo: `/srv/projects/garden-roof-deck`
- Expo Router app under `app/`
- Registered platform paths:
  - Frontend: `/apps/garden-roof-deck/`
  - API: `/api/garden-roof-deck/`
- Current Expo SDK: 54.

Implementation should use React Native / Expo Router primitives, not the prototype's DOM structure. The HTML/CSS/JS design is reference material for visual output and interaction structure.

## Route map

Create navigation/routes that reflect the design while remaining compatible with Expo Router:

- `/` — Home dashboard.
- `/plants/[plantId]` — Plant detail.
- `/gallery` — Gallery overview.
- `/camera` — Camera/AI plant ID design flow.
- Optional route/modal if straightforward:
  - `/photos/[photoId]` or modal presentation for photo lightbox.

Tab/navigation shell:

- Bottom floating tab bar visible on normal screens.
- Main actions:
  - Garden → `/`
  - Gallery → `/gallery`
  - Camera FAB → `/camera`
  - Reminders → stub/no-op visual tab only; no feature implementation.
  - Profile → stub/no-op visual tab only; no feature implementation.

## Screen requirements

### Home / dashboard

Implement the visual composition from `home.jsx`:

- Paper-warm screen background with botanical grain/soft radial texture approximation.
- Date eyebrow (`Thursday, May 7` in mock data is acceptable).
- Serif headline with italic emphasis: `Good morning, the deck is waking up.`
- Weather/season strip as static mock content.
- "On your list today" panel using mocked plant statuses.
- "In the garden" two-column plant grid with about 10 mocked plants.
- Plant tiles use stylized photo treatments (duotone wash + organic leaf blobs + plant glyph/status) instead of real images.
- Footer journal-style note.
- Tapping a plant navigates to `/plants/[plantId]`.

### Plant detail

Implement the visual composition from `detail.jsx`:

- Hero treatment card with plant name/common/variety overlay and back control.
- Meta strip: tracking year, photo count, status.
- Summary and location/planted date row.
- Segmented tabs:
  - Timeline: mocked entries grouped by year; `Log a new photo` navigates to camera route.
  - Ask AI: static/mock chat UI only. It may include seed message, suggestions, and composer shell, but must not call AI or send network requests.
  - Care: static care cards/tips from mock data.
- Photo/timeline tap can open a lightbox/modal if implemented as navigation; otherwise keep visually inert.

### Camera design flow

Implement a route for the camera capture design from `camera.jsx`, but no real camera functionality.

Required visual states:

- Viewfinder-like botanical blurred background.
- Close/back control.
- `AI plant ID` badge.
- Crosshair/corner guide and `frame the leaves` label.
- Bottom shutter control and gallery button visual.

Allowed mocked interaction:

- Pressing shutter can transition through local UI-only states: `viewfinder` → `scanning` → `identified`.
- Scanning overlay can include animated scan line / points and `Identifying leaves & form…` / `looking closely…` labels.
- Identified state can show a mock plant match with actions:
  - Save/add navigates to that plant detail.
  - Retake returns to viewfinder.

No real camera permission prompt, image picker, upload, or AI call should be added in this phase.

### Gallery

Implement visual composition from `gallery.jsx`:

- Heading: gallery count and plant count.
- Horizontal filter chips: All photos + plant chips.
- Mocked grouped photo grid by month.
- Tapping a plant chip filters local mock data only.
- Tapping `Open <plant> detail` navigates to `/plants/[plantId]`.
- Tapping a photo can open a static lightbox showing mocked AI auto-tags, but no AI call or storage.

## Design system requirements

Implement reusable React Native design primitives corresponding to `shared.jsx`:

- Theme tokens for at least the default Moss palette; supporting Sage/Forest/Ember is optional unless low-effort.
- Typography approximations:
  - Serif/editorial headlines: use platform-available fallback initially unless font loading is already trivial.
  - Sans body text.
  - Monospace date stamps.
- Colors:
  - Warm cream/paper backgrounds.
  - Moss/leaf greens.
  - Terracotta accent.
  - Forest dark variant if supporting theme toggle.
- Components:
  - `PhotoTreatment` equivalent using React Native `View`/SVG or layered views. It should convey stylized duotone botanical cards; exact SVG parity is not required if React Native constraints make it costly.
  - Status dot.
  - Icon button.
  - Section header.
  - Bottom tab bar/FAB.

Use `react-native-svg` only if already installed or if adding it is justified and validated. Otherwise approximate organic shapes with layered `View`s.

## Mock data requirements

Create mock data based on `data.js`:

- Around 10 plants with ids, display names, common names, varieties, locations, planting dates, statuses, summaries, glyphs, swatches, and photo timeline entries.
- Include helpers for:
  - finding plant by id,
  - flattening all photos,
  - formatting dates,
  - relative day labels.

Mock data should live under `src/features/garden-design/` or another clear feature directory, not in route files directly.

## File structure guidance

Recommended app structure:

- `app/_layout.tsx` — Expo Router stack/layout and shared navigation providers if needed.
- `app/index.tsx` — home route.
- `app/gallery.tsx` — gallery route.
- `app/camera.tsx` — camera route.
- `app/plants/[plantId].tsx` — plant detail route.
- `src/features/garden-design/` — design components, mock data, tokens, route-level screens.

Keep implementation modular; prefer small files/classes/components over one giant route file.

## Acceptance criteria

- The app presents the AI Garden design direction in Expo Go and web export.
- Routes exist and navigation works for Home, Gallery, Camera, and Plant Detail.
- Bottom navigation/FAB routes correctly.
- Plant grid → detail navigation works.
- Gallery filter chips work locally against mock data.
- Camera route uses mocked state transitions only; no real camera/AI functionality.
- Ask AI tab is visual/static only and does not make provider calls.
- Existing platform web export remains path-prefix safe under `/apps/garden-roof-deck/`.
- Validation gates pass:
  - `npm run typecheck`
  - `npm run build:web`
  - `npm run smoke:web`
  - from `/srv/projects/openclaw-app-platform`: `scripts/app-platform validate`
  - from `/srv/projects/openclaw-app-platform`: `scripts/app-platform smoke garden-roof-deck`

## Open questions

- Should the app default to the prototype's `forest` theme or the transcript's warmer moss/cream direction? Recommendation: default to Moss for readability, with Forest optional later.
- Should the design build include the photo lightbox route/modal in this phase? Recommendation: include only if it stays small; otherwise defer.
