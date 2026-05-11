import { ZoneService } from '../services/ZoneService';

describe('ZoneService', () => {
  it('estimates USDA half zones from extreme minimum temperature', () => {
    const service = new ZoneService();
    expect(service.estimateUsdaZone(2)?.label).toBe('USDA zone 7a');
    expect(service.estimateUsdaZone(7)?.label).toBe('USDA zone 7b');
    expect(service.estimateUsdaZone(-13)?.label).toBe('USDA zone 5b');
  });

  it('returns undefined outside the USDA zone table range', () => {
    const service = new ZoneService();
    expect(service.estimateUsdaZone(-80)).toBeUndefined();
  });

  it('uses curated USDA zone lookup for Jersey City coordinates', async () => {
    const service = new ZoneService();
    await expect(service.getGardenZone({ latitude: 40.7178, longitude: -74.0431 })).resolves.toMatchObject({
      label: 'USDA zone 7b',
      source: 'curated-coordinate-lookup',
    });
  });

  it('returns undefined instead of guessing from recent weather when no curated zone exists', async () => {
    const service = new ZoneService();
    await expect(service.getGardenZone({ latitude: 39.9526, longitude: -75.1652 })).resolves.toBeUndefined();
  });

});
