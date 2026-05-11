import { GardenZone } from '../models/GardenZone';

export function setupZoneValue(setupZone?: string | null): GardenZone | undefined {
  const trimmedZone = setupZone?.trim();
  if (!trimmedZone) return undefined;
  return {
    type: 'USDA',
    value: trimmedZone,
    label: `USDA zone ${trimmedZone}`,
    source: 'setup',
    confidence: 'estimated',
  };
}
