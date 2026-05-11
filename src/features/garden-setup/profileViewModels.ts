import { GardenSetup, SaveGardenSetupInput, SunExposure } from './models/GardenSetup';
import { fmtDate } from '../garden-records/viewModels';
import { growingSpaceOptions, sunExposureOptions } from './onboardingOptions';

export type GardenSetupDraft = SaveGardenSetupInput;

export function draftFromSetup(setup: GardenSetup): GardenSetupDraft {
  return {
    name: setup.name,
    locationLabel: setup.locationLabel,
    locationSource: setup.locationSource ?? 'manual',
    latitude: setup.latitude ?? null,
    longitude: setup.longitude ?? null,
    hardinessZone: setup.hardinessZone ?? null,
    hardinessZoneSource: setup.hardinessZoneSource ?? null,
    sunExposure: setup.sunExposure ?? null,
    growingSpaces: [...setup.growingSpaces],
  };
}

export function normalizeGardenSetupDraft(draft: GardenSetupDraft, original?: GardenSetup | null): SaveGardenSetupInput {
  const locationChanged = Boolean(original) && draft.locationLabel.trim() !== original?.locationLabel.trim();
  const hardinessZone = draft.hardinessZone?.trim();
  return {
    name: draft.name.trim(),
    locationLabel: draft.locationLabel.trim(),
    locationSource: locationChanged ? 'manual' : draft.locationSource ?? 'manual',
    latitude: locationChanged ? null : draft.latitude ?? null,
    longitude: locationChanged ? null : draft.longitude ?? null,
    hardinessZone: hardinessZone && hardinessZone !== 'Not sure' ? hardinessZone : null,
    hardinessZoneSource: hardinessZone && hardinessZone !== 'Not sure' ? draft.hardinessZoneSource ?? 'manual' : null,
    sunExposure: draft.sunExposure ?? null,
    growingSpaces: [...draft.growingSpaces],
  };
}

export function profileSummaryRows(setup: GardenSetup): { label: string; value: string }[] {
  return [
    { label: 'Location', value: setup.locationLabel || 'Not set' },
    { label: 'Zone', value: setup.hardinessZone ? `USDA ${setup.hardinessZone}` : 'Not sure' },
    { label: 'Sun', value: sunExposureLabel(setup.sunExposure) },
    { label: 'Spaces', value: growingSpaceSummary(setup.growingSpaces) },
    { label: 'Created', value: fmtDate(setup.createdAt.slice(0, 10), { year: true }) },
  ];
}

export function sunExposureLabel(value?: SunExposure | null): string {
  return sunExposureOptions.find((option) => option.id === value)?.label ?? 'Not set';
}

export function growingSpaceSummary(values: string[]): string {
  const labels = values.map((value) => growingSpaceOptions.find((option) => option.id === value)?.label).filter(Boolean) as string[];
  if (labels.length === 0) return 'Add later';
  if (labels.length <= 2) return labels.join(', ');
  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`;
}

export function canSaveProfileDraft(draft: GardenSetupDraft): boolean {
  return draft.name.trim().length > 0 && draft.locationLabel.trim().length > 0;
}
