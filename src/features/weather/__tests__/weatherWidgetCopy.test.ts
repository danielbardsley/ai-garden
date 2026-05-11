import { CurrentWeather } from '../models/CurrentWeather';
import { GardenZone } from '../models/GardenZone';
import { WeatherWidgetState } from '../models/WeatherWidgetState';
import { gardenWeekLabel } from '../viewModels/gardenWeekLabel';
import { formatPrimaryLine, formatSecondaryLine, gardenSignalLabel, weatherConditionLabel, weatherWidgetCopy } from '../viewModels/weatherWidgetCopy';

const weather = (overrides: Partial<CurrentWeather> = {}): CurrentWeather => ({
  temperatureF: 62.4,
  apparentTemperatureF: 63,
  relativeHumidityPercent: 55,
  precipitationInches: 0,
  windSpeedMph: 4,
  weatherCode: 2,
  isDay: true,
  observedAt: '2026-05-10T04:00:00Z',
  provider: 'open-meteo',
  ...overrides,
});

const zone: GardenZone = {
  type: 'USDA',
  value: '7a',
  label: 'USDA zone 7a',
  source: 'estimated-from-temperature',
  confidence: 'estimated',
};

describe('weather widget copy', () => {
  it('keeps the primary line compact', () => {
    expect(formatPrimaryLine(weather())).toBe('62°F · partly sun');
  });

  it('includes the resolved zone in the secondary line', () => {
    expect(formatSecondaryLine(weather(), zone)).toBe('Current location · USDA zone 7a');
  });

  it('uses rain as a short garden signal', () => {
    expect(gardenSignalLabel(weather({ precipitationInches: 0.02 }))).toBe('Rain last hour');
  });

  it('uses concise fallback copy for denied location', () => {
    const state: WeatherWidgetState = { status: 'permission-denied' };
    expect(weatherWidgetCopy(state)).toEqual({
      primaryLine: 'Location needed',
      secondaryLine: 'Enable location · zone unknown',
    });
  });

  it('maps common weather codes to short labels', () => {
    expect(weatherConditionLabel(0, true)).toBe('clear sun');
    expect(weatherConditionLabel(61, true)).toBe('light rain');
    expect(weatherConditionLabel(95, true)).toBe('storm');
  });
});


describe('weather widget garden week label', () => {
  it('counts week 1 for the first seven days after garden setup', () => {
    expect(gardenWeekLabel('2026-05-01T12:00:00Z', new Date('2026-05-07T11:59:59Z'))).toBe('week 1');
  });

  it('increments every seven days after garden setup', () => {
    expect(gardenWeekLabel('2026-05-01T12:00:00Z', new Date('2026-05-08T12:00:00Z'))).toBe('week 2');
    expect(gardenWeekLabel('2026-05-01T12:00:00Z', new Date('2026-05-22T12:00:00Z'))).toBe('week 4');
  });

  it('falls back to calendar week without a valid setup date', () => {
    expect(gardenWeekLabel(null, new Date('2026-01-08T00:00:00Z'))).toBe('week 2');
    expect(gardenWeekLabel('not-a-date', new Date('2026-01-08T00:00:00Z'))).toBe('week 2');
  });
});

import { resolveSetupZone } from '../viewModels/setupZone';

describe('weather widget setup zone resolution', () => {
  it('overrides stale detected 9b setup zones near Jersey City', () => {
    expect(resolveSetupZone('9b', { latitude: 40.7178, longitude: -74.0431 })).toMatchObject({
      label: 'USDA zone 7b',
      source: 'curated-coordinate-lookup',
    });
  });

  it('keeps manually saved non-stale setup zones', () => {
    expect(resolveSetupZone('7b', { latitude: 40.7178, longitude: -74.0431 })).toMatchObject({
      label: 'USDA zone 7b',
      source: 'setup',
    });
  });
});
