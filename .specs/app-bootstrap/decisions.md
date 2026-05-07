# Garden Roof Deck — Bootstrap Decisions

## Decision 1 — Start with an Expo React Native scaffold

Status: accepted

Use Expo React Native as the initial app platform so the app can target mobile first while preserving a future Expo web path for hosted access.

Consequence:

- Camera/media access can use Expo-native libraries later.
- Web behavior needs explicit attention when camera/gallery features are added.
- The scaffold should not assume a backend on day one.

## Decision 2 — Keep design and theme empty for now

Status: accepted

The bootstrap must not define the visual design system. Design/theme will arrive in the next spec.

Consequence:

- Placeholder UI should be plain and minimal.
- Avoid color/theme/token decisions except default framework necessities.

## Decision 3 — Plan AI as an integration point, not an embedded provider

Status: accepted

The app should anticipate AI plant labeling and plant-care Q&A, but the bootstrap should not hard-code provider choices.

Consequence:

- Future implementation can route through a backend, OpenClaw agent, or provider API.
- Photo labeling payload shape should be specified later with privacy and storage decisions.


## Decision 4 — Register scaffold with the app platform

Status: accepted

Use `scripts/app-platform create garden-roof-deck --kind expo --register` for the initial scaffold so the app manifest and platform registry are created through the platform workflow.

Consequence:

- The app is active in `registry/apps.yaml` immediately after bootstrap.
- Generated routing and smoke validation can include the app from the first checkpoint.
- Deployment/Caddy reload remains a separate explicit step.
