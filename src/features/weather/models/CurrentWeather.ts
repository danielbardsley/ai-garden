export type WeatherProvider = 'open-meteo';

export type CurrentWeather = {
  temperatureF: number;
  apparentTemperatureF?: number;
  relativeHumidityPercent?: number;
  precipitationInches?: number;
  windSpeedMph?: number;
  weatherCode: number;
  isDay?: boolean;
  observedAt: string;
  provider: WeatherProvider;
};
