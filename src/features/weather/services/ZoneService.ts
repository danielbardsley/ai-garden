import { GardenZone } from '../models/GardenZone';
import { LocationCoordinates } from '../models/WeatherWidgetState';

export class ZoneService {
  async getGardenZone(coordinates: LocationCoordinates): Promise<GardenZone | undefined> {
    if (!this.isLikelyUnitedStates(coordinates)) return undefined;

    const params = new URLSearchParams({
      latitude: String(coordinates.latitude),
      longitude: String(coordinates.longitude),
      daily: 'temperature_2m_min',
      temperature_unit: 'fahrenheit',
      timezone: 'auto',
      past_days: '92',
      forecast_days: '1',
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Open-Meteo zone estimate request failed: ${response.status}`);
    }
    const data = await response.json();
    const values = data?.daily?.temperature_2m_min;
    if (!Array.isArray(values)) return undefined;
    const numericValues = values.filter((value): value is number => typeof value === 'number');
    if (numericValues.length === 0) return undefined;
    return this.estimateUsdaZone(Math.min(...numericValues));
  }

  estimateUsdaZone(extremeMinimumF: number): GardenZone | undefined {
    const zones = [
      { value: '1a', min: -60, max: -55 },
      { value: '1b', min: -55, max: -50 },
      { value: '2a', min: -50, max: -45 },
      { value: '2b', min: -45, max: -40 },
      { value: '3a', min: -40, max: -35 },
      { value: '3b', min: -35, max: -30 },
      { value: '4a', min: -30, max: -25 },
      { value: '4b', min: -25, max: -20 },
      { value: '5a', min: -20, max: -15 },
      { value: '5b', min: -15, max: -10 },
      { value: '6a', min: -10, max: -5 },
      { value: '6b', min: -5, max: 0 },
      { value: '7a', min: 0, max: 5 },
      { value: '7b', min: 5, max: 10 },
      { value: '8a', min: 10, max: 15 },
      { value: '8b', min: 15, max: 20 },
      { value: '9a', min: 20, max: 25 },
      { value: '9b', min: 25, max: 30 },
      { value: '10a', min: 30, max: 35 },
      { value: '10b', min: 35, max: 40 },
      { value: '11a', min: 40, max: 45 },
      { value: '11b', min: 45, max: 50 },
      { value: '12a', min: 50, max: 55 },
      { value: '12b', min: 55, max: 60 },
      { value: '13a', min: 60, max: 65 },
      { value: '13b', min: 65, max: 70 },
    ];
    const match = zones.find((zone) => extremeMinimumF >= zone.min && extremeMinimumF < zone.max);
    if (!match) return undefined;
    return {
      type: 'USDA',
      value: match.value,
      label: `USDA zone ${match.value}`,
      source: 'estimated-from-temperature',
      confidence: 'estimated',
    };
  }

  private isLikelyUnitedStates(coordinates: LocationCoordinates): boolean {
    const { latitude, longitude } = coordinates;
    return latitude >= 18 && latitude <= 72 && longitude >= -180 && longitude <= -65;
  }
}
