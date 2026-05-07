# Garden Roof Deck — Bootstrap Acceptance

## Bootstrap acceptance criteria

- A project exists at `/srv/projects/garden-roof-deck`.
- The project has its own git repository.
- The project contains this bootstrap spec under `.specs/app-bootstrap/`.
- The app is an Expo React Native TypeScript scaffold or has a documented blocker explaining why scaffold creation could not complete.
- Design/theme choices are intentionally absent or minimal placeholders only.
- Future gallery, camera, AI plant labeling, and AI plant-care Q&A needs are captured in docs/placeholders.
- Future web base path `/apps/garden-roof-deck/` is documented.

## Validation acceptance criteria

At least one of the following must pass before bootstrap is considered complete:

- TypeScript/typecheck validation.
- Expo web export/build validation.
- Expo start/config validation.
- A documented blocker if validation cannot run in the current environment.

## Handoff criteria

- The next spec can focus on design/theme without needing to revisit bootstrap intent.
- Any deviations from this spec are captured in `decisions.md`.
- A checkpoint commit exists after scaffold validation, unless Dan asks not to commit.
