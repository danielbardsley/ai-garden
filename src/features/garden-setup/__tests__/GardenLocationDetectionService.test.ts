import { formatCoordinateLabel, formatReverseGeocodeLabel, GardenLocationDetectionService } from '../services/GardenLocationDetectionService';

jest.mock('expo-location', () => ({ reverseGeocodeAsync: jest.fn() }));

const ExpoLocation = jest.requireMock('expo-location');

describe('GardenLocationDetectionService helpers', () => {
  it('formats reverse geocode labels with locality, region, and country', () => {
    expect(formatReverseGeocodeLabel({ city: 'Brooklyn', region: 'NY', country: 'United States' }, { latitude: 40.7, longitude: -73.9 })).toBe('Brooklyn, NY, United States');
  });

  it('falls back to coarse coordinates', () => {
    expect(formatCoordinateLabel({ latitude: 40.7128, longitude: -73.9352 })).toBe('40.71, -73.94');
    expect(formatReverseGeocodeLabel(null, { latitude: 40.7128, longitude: -73.9352 })).toBe('40.71, -73.94');
  });
});

describe('GardenLocationDetectionService', () => {
  it('detects location label and estimated zone', async () => {
    ExpoLocation.reverseGeocodeAsync.mockResolvedValue([{ city: 'Brooklyn', region: 'NY', country: 'United States' }]);
    const locationService = { getCurrentCoordinates: jest.fn(async () => ({ status: 'granted' as const, coordinates: { latitude: 40.7, longitude: -73.9 } })) };
    const zoneService = { getGardenZone: jest.fn(async () => ({ type: 'USDA' as const, value: '7b', label: 'USDA zone 7b', source: 'estimated-from-temperature' as const, confidence: 'estimated' as const })) };

    await expect(new GardenLocationDetectionService(locationService as any, zoneService as any).detect()).resolves.toEqual({
      status: 'detected',
      coordinates: { latitude: 40.7, longitude: -73.9 },
      locationLabel: 'Brooklyn, NY, United States',
      hardinessZone: '7b',
    });
  });

  it('keeps manual path available when permission is denied', async () => {
    const locationService = { getCurrentCoordinates: jest.fn(async () => ({ status: 'denied' as const, error: new Error('no') })) };
    const zoneService = { getGardenZone: jest.fn() };

    await expect(new GardenLocationDetectionService(locationService as any, zoneService as any).detect()).resolves.toMatchObject({
      status: 'denied',
    });
    expect(zoneService.getGardenZone).not.toHaveBeenCalled();
  });
});
