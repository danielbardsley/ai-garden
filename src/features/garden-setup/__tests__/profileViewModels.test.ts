import { draftFromSetup, growingSpaceSummary, normalizeGardenSetupDraft, profileSummaryRows } from '../profileViewModels';
import { GardenSetup } from '../models/GardenSetup';

const setup: GardenSetup = {
  id: 'garden-1',
  name: 'Back Garden',
  locationLabel: 'Jersey City, NJ',
  locationSource: 'detected',
  latitude: 40.7,
  longitude: -74.0,
  hardinessZone: '7b',
  hardinessZoneSource: 'detected',
  sunExposure: 'full',
  growingSpaces: ['in-ground', 'containers', 'greenhouse'],
  createdAt: '2026-05-11T17:00:00.000Z',
  updatedAt: '2026-05-11T17:00:00.000Z',
};

describe('profile view models', () => {
  it('creates an editable setup draft', () => {
    expect(draftFromSetup(setup)).toMatchObject({ name: 'Back Garden', growingSpaces: ['in-ground', 'containers', 'greenhouse'] });
  });

  it('normalizes manual location edits and clears stale coordinates', () => {
    const normalized = normalizeGardenSetupDraft({ ...draftFromSetup(setup), locationLabel: 'Hoboken, NJ' }, setup);
    expect(normalized).toMatchObject({ locationLabel: 'Hoboken, NJ', locationSource: 'manual', latitude: null, longitude: null });
  });

  it('formats garden setup summary rows', () => {
    expect(profileSummaryRows(setup)).toEqual(expect.arrayContaining([
      { label: 'Zone', value: 'USDA 7b' },
      { label: 'Spaces', value: 'In-ground beds, Containers / pots +1' },
    ]));
  });

  it('summarizes empty growing spaces', () => {
    expect(growingSpaceSummary([])).toBe('Add later');
  });
});
