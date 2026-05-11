import { CurrentWeather } from '../models/CurrentWeather';
import { GardenZone } from '../models/GardenZone';
import { WeatherWidgetState } from '../models/WeatherWidgetState';

export type WeatherWidgetCopy = {
  primaryLine: string;
  secondaryLine: string;
};

export function weatherWidgetCopy(state: WeatherWidgetState): WeatherWidgetCopy {
  if (state.status === 'loading') {
    return { primaryLine: 'Checking weather…', secondaryLine: 'Finding your garden zone' };
  }
  if (state.status === 'permission-denied') {
    return { primaryLine: 'Location needed', secondaryLine: 'Enable location · zone unknown' };
  }
  if (state.status === 'unavailable' || !state.data) {
    return { primaryLine: 'Weather unavailable', secondaryLine: 'Try again later · zone unknown' };
  }

  return {
    primaryLine: formatPrimaryLine(state.data.weather),
    secondaryLine: formatSecondaryLine(state.data.weather, state.data.zone),
  };
}

export function formatPrimaryLine(weather?: CurrentWeather): string {
  if (!weather) return 'Weather unavailable';
  return `${Math.round(weather.temperatureF)}°F · ${weatherConditionLabel(weather.weatherCode, weather.isDay)}`;
}

export function formatSecondaryLine(weather?: CurrentWeather, zone?: GardenZone): string {
  const signal = gardenSignalLabel(weather);
  const zoneLabel = zone?.label ?? 'zone unknown';
  return `${signal} · ${zoneLabel}`;
}

export function gardenSignalLabel(weather?: CurrentWeather): string {
  if (!weather) return 'Current location';
  if ((weather.precipitationInches ?? 0) >= 0.01) return 'Rain last hour';
  if ((weather.apparentTemperatureF ?? weather.temperatureF) >= 88) return 'Heat watch';
  if (weather.relativeHumidityPercent !== undefined && weather.relativeHumidityPercent <= 35) return 'Feels dry today';
  if ((weather.windSpeedMph ?? 0) >= 20) return 'Windy today';
  return 'Current location';
}

export function weatherConditionLabel(code: number, isDay = true): string {
  if (code === 0) return isDay ? 'clear sun' : 'clear';
  if ([1, 2].includes(code)) return 'partly sun';
  if (code === 3) return 'cloudy';
  if ([45, 48].includes(code)) return 'fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'drizzle';
  if ([61, 63, 80, 81].includes(code)) return 'light rain';
  if ([65, 82].includes(code)) return 'heavy rain';
  if ([66, 67].includes(code)) return 'freezing rain';
  if ([71, 73, 77, 85].includes(code)) return 'light snow';
  if ([75, 86].includes(code)) return 'snow';
  if ([95, 96, 99].includes(code)) return 'storm';
  return 'outside';
}
