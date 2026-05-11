# Home Weather Widget Tasks

## Planning

- [x] Create Weather Module spec files.
- [x] Clarify scope: make the existing Home weather widget real, exactly simple, no new screen.
- [x] Choose first implementation surface: existing Home widget only.
- [x] Select preferred free current-weather provider: Open-Meteo.
- [x] Select free USDA zone lookup approach: estimated USDA zone from Open-Meteo recent minimum temperatures as a placeholder.
- [x] Decide whether first provider calls can be frontend-only or need backend support: frontend-only for now.

## Data model and services

- [x] Define `CurrentWeather`, `GardenZone`, and `WeatherWidgetState` types.
- [x] Add location permission/service wrapper.
- [x] Add Open-Meteo current weather adapter/client.
- [x] Add free zone lookup adapter/client.
- [x] Add weather-code to short-condition label mapping.
- [x] Add compact widget copy formatter for primary and secondary lines.
- [ ] Add short-term cached response fallback. Deferred; graceful unavailable states are implemented, but persistent cache needs storage choice.

## UI

- [x] Extract existing static row into `HomeWeatherWidget`.
- [x] Preserve existing compact card layout, icon block, two text lines, and `week N` marker.
- [x] Update `week N` marker to count from garden setup creation date.
- [x] Pass garden setup creation timestamp from Home into weather widget.
- [x] Replace hard-coded `62°F · partly sun` with live current weather.
- [x] Replace hard-coded `Last frost 22 days ago · zone 7a` with concise live garden context plus resolved zone.
- [x] Add loading, permission denied, and unavailable copy without adding extra rows. Cached fallback remains deferred.
- [x] Keep layout mobile-first and visually consistent with Garden Roof Deck.

## Backend, only if needed

- [ ] Add weather/zone endpoint(s) under the Garden Roof Deck backend API only if frontend/provider constraints require it.
- [ ] Add explicit provider configuration behavior if backend config is introduced.
- [ ] Add endpoint tests with test doubles/mocks if backend endpoints are added.
- [ ] Document any required environment variables if backend endpoints are added.

## Validation

- [x] `npm run typecheck`
- [x] `npm test -- --runInBand`
- [x] Add/adjust week-label tests for garden age.
- [x] `npm run build:web && npm run smoke:web`
- [ ] Backend tests, if backend endpoints are added.
- [ ] Manual Expo Go check of location permission and exact simple widget rendering.

## Delivery

- [ ] Update acceptance results.
- [x] Record final provider and zone lookup decisions in `decisions.md`.
- [x] Add memory note after implementation or meaningful design decision.
