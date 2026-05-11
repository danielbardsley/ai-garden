import { CurrentWeather } from '../models/CurrentWeather';
import { LocationCoordinates } from '../models/WeatherWidgetState';

export type OpenMeteoCurrentResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    wind_speed_10m?: number;
    weather_code?: number;
    is_day?: number;
  };
};

export class WeatherService {
  async getCurrentWeather(coordinates: LocationCoordinates): Promise<CurrentWeather> {
    const params = new URLSearchParams({
      latitude: String(coordinates.latitude),
      longitude: String(coordinates.longitude),
      current: ['temperature_2m', 'apparent_temperature', 'relative_humidity_2m', 'precipitation', 'wind_speed_10m', 'weather_code', 'is_day'].join(','),
      temperature_unit: 'fahrenheit',
      wind_speed_unit: 'mph',
      precipitation_unit: 'inch',
      timezone: 'auto',
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Open-Meteo request failed: ${response.status}`);
    }
    return this.normalizeOpenMeteoResponse(await response.json());
  }

  normalizeOpenMeteoResponse(response: OpenMeteoCurrentResponse): CurrentWeather {
    const current = response.current;
    if (!current || typeof current.temperature_2m !== 'number' || typeof current.weather_code !== 'number') {
      throw new Error('Open-Meteo response did not include current weather.');
    }

    return {
      temperatureF: current.temperature_2m,
      apparentTemperatureF: current.apparent_temperature,
      relativeHumidityPercent: current.relative_humidity_2m,
      precipitationInches: current.precipitation,
      windSpeedMph: current.wind_speed_10m,
      weatherCode: current.weather_code,
      isDay: typeof current.is_day === 'number' ? current.is_day === 1 : undefined,
      observedAt: current.time ?? new Date().toISOString(),
      provider: 'open-meteo',
    };
  }
}
