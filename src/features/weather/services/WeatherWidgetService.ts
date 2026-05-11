import { WeatherWidgetState } from '../models/WeatherWidgetState';

import { LocationPermissionService } from './LocationPermissionService';
import { WeatherService } from './WeatherService';
import { ZoneService } from './ZoneService';

export class WeatherWidgetService {
  constructor(
    private readonly locationService = new LocationPermissionService(),
    private readonly weatherService = new WeatherService(),
    private readonly zoneService = new ZoneService()
  ) {}

  async load(): Promise<WeatherWidgetState> {
    const location = await this.locationService.getCurrentCoordinates();
    if (location.status !== 'granted') {
      return { status: location.status === 'denied' ? 'permission-denied' : 'unavailable', error: location.error };
    }

    const [weatherResult, zoneResult] = await Promise.allSettled([
      this.weatherService.getCurrentWeather(location.coordinates),
      this.zoneService.getGardenZone(location.coordinates),
    ]);

    if (weatherResult.status === 'rejected' && zoneResult.status === 'rejected') {
      return { status: 'unavailable', error: weatherResult.reason instanceof Error ? weatherResult.reason : new Error(String(weatherResult.reason)) };
    }

    return {
      status: 'ready',
      data: {
        weather: weatherResult.status === 'fulfilled' ? weatherResult.value : undefined,
        zone: zoneResult.status === 'fulfilled' ? zoneResult.value : undefined,
        cached: false,
        fetchedAt: new Date().toISOString(),
      },
      error: weatherResult.status === 'rejected' ? weatherResult.reason : zoneResult.status === 'rejected' ? zoneResult.reason : undefined,
    };
  }
}
