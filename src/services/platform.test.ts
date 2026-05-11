import { buildApiBaseUrl, apiBasePath, apiBaseUrl, basePath } from './platform';

test('platform defaults are base-path aware', () => {
  expect(basePath).toBe('/apps/garden-roof-deck/');
  expect(apiBasePath).toBe('/api/garden-roof-deck/');
  expect(apiBaseUrl).toBe('http://100.109.137.10:18100/api/garden-roof-deck');
});

test('web API URL remains same-origin and path-prefixed', () => {
  expect(buildApiBaseUrl({ platformOS: 'web', origin: '', path: '/api/garden-roof-deck/' })).toBe('/api/garden-roof-deck');
});

test('native API URL composes Tailscale origin and API path', () => {
  expect(buildApiBaseUrl({
    platformOS: 'ios',
    origin: 'https://openclaw.tail8c3304.ts.net',
    path: '/api/garden-roof-deck/',
  })).toBe('https://openclaw.tail8c3304.ts.net/api/garden-roof-deck');
});

test('native API URL does not duplicate API path when origin already includes it', () => {
  expect(buildApiBaseUrl({
    platformOS: 'ios',
    origin: 'https://openclaw.tail8c3304.ts.net/api/garden-roof-deck/',
    path: '/api/garden-roof-deck/',
  })).toBe('https://openclaw.tail8c3304.ts.net/api/garden-roof-deck');
});
