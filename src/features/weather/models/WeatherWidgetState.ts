import { CurrentWeather } from './CurrentWeather';
import { GardenZone } from './GardenZone';

export type LocationCoordinates = {
  latitude: number;
  longitude: number;
};

export type WeatherWidgetData = {
  weather?: CurrentWeather;
  zone?: GardenZone;
  cached: boolean;
  fetchedAt: string;
};

export type WeatherWidgetStatus = 'loading' | 'ready' | 'permission-denied' | 'unavailable';

export type WeatherWidgetState = {
  status: WeatherWidgetStatus;
  data?: WeatherWidgetData;
  error?: Error;
};
