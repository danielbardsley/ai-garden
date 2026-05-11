# Home Weather Widget Decisions

## Accepted

- Stale saved detected warm zones near Jersey City should be corrected at display time so existing local setup records do not keep showing 9b.
- Recent observed weather must not be used as a USDA hardiness-zone proxy; it overstates zones outside winter/extreme-minimum context. Prefer saved setup zone, curated lookup, or `zone unknown`.
- The right-side `week N` marker should represent weeks since local garden setup creation; calendar week is only a fallback when no setup timestamp exists.
- The existing static Home screen weather row will become the live widget.
- The widget must stay exactly simple: same placement, compact card, two text lines, and right-side `week N` marker.
- There will be no dedicated Weather screen in this slice.
- The primary line replaces `62°F · partly sun` with real current temperature and a short condition label.
- The secondary line replaces `Last frost 22 days ago · zone 7a` with concise plant/garden context plus the resolved zone.
- Open-Meteo is the preferred current-weather provider because it is free for non-commercial/personal use and does not require an API key.
- Zone labels must include the zone type, e.g. `USDA zone 7b`, to avoid ambiguous zone claims.
- The first slice should not persist precise latitude/longitude by default.
- Provider responses should be normalized behind app-owned services/adapters.
- Production code should fail explicitly when required providers or secrets are missing; test doubles belong in tests.

## Pending

- The first implementation estimates USDA zone from recent Open-Meteo minimum temperatures as a free placeholder; a future improvement should replace this with authoritative USDA geospatial lookup data.
- Open-Meteo is called directly from the frontend for the first implementation; no backend proxy is needed yet.
- The first implementation uses simple live garden signals such as rain, heat, dryness, wind, or `Current location`; `Last frost N days ago` is deferred until there is a reliable free frost-history source.
- Whether weather/zone enters Garden Agent context in this slice or a follow-up.
