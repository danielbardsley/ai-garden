import * as ExpoLocation from 'expo-location';

import { LocationCoordinates } from '../../weather/models/WeatherWidgetState';
import { LocationPermissionService, LocationPermissionResult } from '../../weather/services/LocationPermissionService';
import { ZoneService } from '../../weather/services/ZoneService';

export type GardenLocationDetectionResult =
  | { status: 'detected'; coordinates: LocationCoordinates; locationLabel: string; hardinessZone?: string | null }
  | { status: 'denied' | 'unavailable'; message: string };

type ReverseGeocodeAddress = {
  city?: string | null;
  district?: string | null;
  subregion?: string | null;
  region?: string | null;
  country?: string | null;
  postalCode?: string | null;
};

export function formatCoordinateLabel(coordinates: LocationCoordinates) {
  return `${coordinates.latitude.toFixed(2)}, ${coordinates.longitude.toFixed(2)}`;
}

export function formatReverseGeocodeLabel(address?: ReverseGeocodeAddress | null, coordinates?: LocationCoordinates) {
  if (!address) return coordinates ? formatCoordinateLabel(coordinates) : '';
  const locality = address.city || address.district || address.subregion || address.postalCode;
  const region = address.region;
  const country = address.country;
  const parts = [locality, region, country].filter(Boolean);
  if (parts.length > 0) return parts.join(', ');
  return coordinates ? formatCoordinateLabel(coordinates) : '';
}

export class GardenLocationDetectionService {
  constructor(
    private readonly locationService = new LocationPermissionService(),
    private readonly zoneService = new ZoneService()
  ) {}

  async detect(): Promise<GardenLocationDetectionResult> {
    const permission = await this.locationService.getCurrentCoordinates();
    if (permission.status !== 'granted') return this.mapPermissionFailure(permission);

    const [labelResult, zoneResult] = await Promise.allSettled([
      this.reverseGeocode(permission.coordinates),
      this.zoneService.getGardenZone(permission.coordinates),
    ]);

    return {
      status: 'detected',
      coordinates: permission.coordinates,
      locationLabel: labelResult.status === 'fulfilled' && labelResult.value ? labelResult.value : formatCoordinateLabel(permission.coordinates),
      hardinessZone: zoneResult.status === 'fulfilled' ? zoneResult.value?.value ?? null : null,
    };
  }

  private async reverseGeocode(coordinates: LocationCoordinates): Promise<string> {
    const addresses = await ExpoLocation.reverseGeocodeAsync(coordinates);
    return formatReverseGeocodeLabel(addresses[0], coordinates);
  }

  private mapPermissionFailure(permission: Exclude<LocationPermissionResult, { status: 'granted' }>): GardenLocationDetectionResult {
    if (permission.status === 'denied') {
      return { status: 'denied', message: 'Location permission was denied. You can still enter your garden location manually.' };
    }
    return { status: 'unavailable', message: 'Current location is unavailable right now. You can still enter your garden location manually.' };
  }
}

export const gardenLocationDetectionService = new GardenLocationDetectionService();
