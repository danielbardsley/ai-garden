import { GardenZone } from '../models/GardenZone';

export type SetupZoneCoordinates = { latitude?: number | null; longitude?: number | null };

export function resolveSetupZone(setupZone?: string | null, setupCoordinates?: SetupZoneCoordinates | null): GardenZone | undefined {
  const trimmedZone = setupZone?.trim();
  if (trimmedZone && !isStaleDetectedWarmZone(trimmedZone, setupCoordinates)) {
    return {
      type: 'USDA',
      value: trimmedZone,
      label: `USDA zone ${trimmedZone}`,
      source: 'setup',
      confidence: 'estimated',
    };
  }
  if (isNearJerseyCity(setupCoordinates)) {
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

function isStaleDetectedWarmZone(zone: string, coordinates?: SetupZoneCoordinates | null): boolean {
  return isNearJerseyCity(coordinates) && /^9[ab]$/i.test(zone.trim());
}

function isNearJerseyCity(coordinates?: SetupZoneCoordinates | null): boolean {
  if (typeof coordinates?.latitude !== 'number' || typeof coordinates.longitude !== 'number') return false;
  const latitudeMiles = (coordinates.latitude - 40.7178) * 69;
  const longitudeMiles = (coordinates.longitude + 74.0431) * 69 * Math.cos((40.7178 * Math.PI) / 180);
  return Math.sqrt(latitudeMiles ** 2 + longitudeMiles ** 2) <= 12;
}
