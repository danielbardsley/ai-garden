# Home Weather Widget Spec

## Summary

Make the existing Garden Roof Deck Home weather widget real. Replace the current hard-coded widget text with live current weather and a location-derived growing zone, while keeping the widget visually and structurally as simple as it is today.

This is not a new screen, not a dashboard, and not a full weather module. It is the same compact Home widget, backed by real data.

## Existing widget to preserve

`HomeScreen.tsx` currently renders the widget directly below the greeting and above `On your list today`:

```tsx
<View style={{ marginHorizontal: 20, marginBottom: 24, padding: 15, backgroundColor: theme.surface, borderRadius: 18, borderWidth: 0.5, borderColor: theme.line, flexDirection: 'row', alignItems: 'center', gap: 13 }}>
  <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: theme.leaf3, alignItems: 'center', justifyContent: 'center' }}>
    <GlyphIcon name="leaf" color={theme.primaryDeep} size={20} />
  </View>
  <View style={{ flex: 1 }}>
    <Text style={{ color: theme.ink, fontSize: 15, fontWeight: '600' }}>62°F · partly sun</Text>
    <Text style={{ color: theme.inkSoft, fontSize: 12, marginTop: 2 }}>Last frost 22 days ago · zone 7a</Text>
  </View>
  <SerifText style={{ color: theme.inkSoft, fontSize: 14, fontStyle: 'italic' }}>week 19</SerifText>
</View>
```

The implementation should preserve this placement, row shape, spacing, icon treatment, and simple two-line information hierarchy unless a tiny adjustment is required for dynamic content.

## Goals

- Replace `62°F · partly sun` with real current temperature and condition.
- Replace `Last frost 22 days ago · zone 7a` with real plant-relevant secondary copy that includes the resolved zone.
- Use the device location, with permission, to fetch weather and determine zone.
- Use a free weather API; prefer Open-Meteo for current weather because it does not require an API key.
- Keep the widget exactly simple: one compact card, two main text lines, existing right-side `week N` marker.
- Keep failures graceful and quiet so Home still feels polished.
- Do not persist precise latitude/longitude by default.

## Non-goals

- No dedicated Weather screen.
- No expanded forecast UI.
- No weather maps.
- No alerts or notifications.
- No multi-location management.
- No paid provider dependency.
- No redesign of the Home screen.
- No AI-generated weather advice in this slice.

## Display contract

### Layout

The widget remains a single compact card with:

1. left icon block,
2. middle text block,
3. right seasonal week marker.

The text block remains two lines:

- Primary line: current weather.
- Secondary line: plant/garden context including zone.

### Primary line

Format:

`<temperature>°F · <short condition>`

Examples:

- `62°F · partly sun`
- `74°F · clear`
- `51°F · light rain`
- `89°F · hot sun`

Rules:

- Round temperature to the nearest whole Fahrenheit degree.
- Keep condition labels short enough for the existing widget.
- Map provider weather codes into plain labels.
- If weather is loading, show calm placeholder copy such as `Checking weather…`.
- If weather fails but cached weather exists, show cached weather and keep the widget usable.
- If weather is unavailable and no cache exists, show `Weather unavailable` rather than crashing or expanding the UI.

### Secondary line

Target format:

`<garden signal> · <zone label>`

Examples:

- `Last frost 22 days ago · USDA zone 7a`
- `Rain last hour · USDA zone 7a`
- `Feels dry today · USDA zone 7a`
- `Location needed · zone unknown`
- `Zone unavailable`

Rules:

- The resolved zone must replace the hard-coded `zone 7a` text.
- Prefer `USDA zone 7a` / `USDA zone 7b` for US locations.
- If zone cannot be resolved, say `zone unknown` or `Zone unavailable`; do not guess.
- Keep secondary copy short. Do not add paragraphs, tooltips, tables, badges, or extra rows in this slice.
- `Last frost N days ago` may remain the preferred garden signal if we can derive it from free data; otherwise use a simpler live signal such as recent rain, humidity/feels-like, or `Current location`.

### Right marker

The right-side seasonal marker remains visually equivalent to today’s `week 19`.

- It may remain as-is for the first implementation.
- If derived dynamically, it should still render as `week N` and must not increase widget complexity.

## Location and permission behavior

- Ask for location only when needed for the widget.
- The permission explanation should be simple: location is used to show local weather and zone.
- If permission is granted, fetch current weather and zone from coordinates.
- If permission is denied or unavailable, keep the widget in place and show concise fallback copy.
- Do not persist precise latitude/longitude by default.
- Future saved garden location support can be added separately.

## Provider strategy

### Current weather

Use whatever free API is practical, with Open-Meteo as the preferred first provider:

- free for non-commercial/personal use,
- no API key required,
- supports current weather by latitude/longitude,
- includes plant-useful fields such as temperature, apparent temperature, humidity, wind, precipitation, weather code, and optional evapotranspiration/soil fields for later.

The implementation may call Open-Meteo directly from the client if CORS and Expo/web behavior are reliable. If client calls are brittle, add a small backend proxy endpoint.

### Zone lookup

Use a free source for the growing/hardiness zone. Preferred behavior:

- For US coordinates, resolve USDA Plant Hardiness Zone.
- Label it explicitly as `USDA zone <value>`.
- If no reliable free lookup is available in the first pass, show `zone unknown` and keep the code structured so a free/static lookup can be added next.

Acceptable first-pass zone approaches:

- bundled/static USDA zone data if size and licensing are reasonable,
- free lookup endpoint if reliable and terms allow the app use,
- small backend lookup helper if geospatial processing is easier server-side.

Do not use a paid zone API without explicit approval.

## Architecture

### Frontend

Add a focused weather feature area, but keep the Home integration small:

- `src/features/weather/components/HomeWeatherWidget.tsx`
- `src/features/weather/models/CurrentWeather.ts`
- `src/features/weather/models/GardenZone.ts`
- `src/features/weather/services/LocationPermissionService.ts`
- `src/features/weather/services/WeatherService.ts`
- `src/features/weather/services/ZoneService.ts`
- `src/features/weather/viewModels/weatherWidgetCopy.ts`

`HomeScreen.tsx` should import and render `HomeWeatherWidget` where the static row currently lives.

### Backend, only if needed

Add backend endpoints only if the frontend cannot reliably call the free providers or zone lookup needs server-side processing:

- `GET /api/garden-roof-deck/weather/current?lat=<lat>&lon=<lon>`
- `GET /api/garden-roof-deck/weather/zone?lat=<lat>&lon=<lon>`
- or one combined widget endpoint if simpler.

If backend provider configuration is introduced, production must fail explicitly when required config is missing. Do not add production mock providers.

## Data and caching

- Normalize provider responses into app-owned types before rendering.
- Cache the last successful widget response locally for short-term fallback.
- Include timestamp/source metadata internally, but do not clutter the widget unless needed for error/debug states.
- Treat stale cached data as better than an empty card, but avoid presenting it as fresh.

## Edge cases

- Location permission denied.
- Location services disabled.
- Open-Meteo/network failure.
- Weather succeeds but zone lookup fails.
- Zone lookup succeeds but weather fails.
- Coordinates are outside USDA coverage.
- Coordinates are near a zone boundary.
- Cached data is stale.
- Web build cannot access native location APIs.

## Testing strategy

Add tests around:

- weather code to short condition labels,
- primary/secondary line formatting,
- permission-state to widget-state mapping,
- provider response normalization,
- zone label formatting,
- failure/cache fallback behavior.

Minimum validation for implementation:

- `npm run typecheck`
- `npm test -- --runInBand`
- `npm run build:web && npm run smoke:web`
- backend tests if backend endpoints are added,
- manual Expo Go check for location permission and widget rendering.
