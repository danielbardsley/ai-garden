import { WeatherService } from '../services/WeatherService';

describe('WeatherService', () => {
  it('normalizes Open-Meteo current weather responses', () => {
    const service = new WeatherService();
    expect(service.normalizeOpenMeteoResponse({
      current: {
        time: '2026-05-10T00:00',
        temperature_2m: 72.6,
        apparent_temperature: 74,
        relative_humidity_2m: 58,
        precipitation: 0.01,
        wind_speed_10m: 8,
        weather_code: 1,
        is_day: 1,
      },
    })).toEqual({
      temperatureF: 72.6,
      apparentTemperatureF: 74,
      relativeHumidityPercent: 58,
      precipitationInches: 0.01,
      windSpeedMph: 8,
      weatherCode: 1,
      isDay: true,
      observedAt: '2026-05-10T00:00',
      provider: 'open-meteo',
    });
  });

  it('fails clearly when current weather is missing', () => {
    const service = new WeatherService();
    expect(() => service.normalizeOpenMeteoResponse({})).toThrow('current weather');
  });
});
