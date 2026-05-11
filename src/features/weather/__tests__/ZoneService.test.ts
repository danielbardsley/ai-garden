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
});
