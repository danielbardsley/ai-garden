import { CurrentWeather } from '../models/CurrentWeather';
import { GardenZone } from '../models/GardenZone';
import { WeatherWidgetState } from '../models/WeatherWidgetState';
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
