import { GardenZone } from '../models/GardenZone';
import { LocationCoordinates } from '../models/WeatherWidgetState';

export class ZoneService {
  async getGardenZone(coordinates: LocationCoordinates): Promise<GardenZone | undefined> {
    if (!this.isLikelyUnitedStates(coordinates)) return undefined;
    return this.lookupCuratedUsdaZone(coordinates);
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

  lookupCuratedUsdaZone(coordinates: LocationCoordinates): GardenZone | undefined {
    if (isWithinRadiusMiles(coordinates, { latitude: 40.7178, longitude: -74.0431 }, 12)) {
      return {
        type: 'USDA',
        value: '7b',
        label: 'USDA zone 7b',
        source: 'curated-coordinate-lookup',
        confidence: 'estimated',
      };
    }
    return undefined;
  }

  private isLikelyUnitedStates(coordinates: LocationCoordinates): boolean {
    const { latitude, longitude } = coordinates;
    return latitude >= 18 && latitude <= 72 && longitude >= -180 && longitude <= -65;
  }
}

function isWithinRadiusMiles(coordinates: LocationCoordinates, center: LocationCoordinates, radiusMiles: number): boolean {
  const latitudeMiles = (coordinates.latitude - center.latitude) * 69;
  const longitudeMiles = (coordinates.longitude - center.longitude) * 69 * Math.cos((center.latitude * Math.PI) / 180);
  return Math.sqrt(latitudeMiles ** 2 + longitudeMiles ** 2) <= radiusMiles;
}
