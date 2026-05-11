import { GardenSetupRepository, GARDEN_SETUP_SETTING_KEY } from '../repositories/GardenSetupRepository';

const getFirstAsync = jest.fn();
const runAsync = jest.fn();

jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));
jest.mock('../../storage/database', () => ({
  getGardenDatabase: jest.fn(async () => ({ getFirstAsync, runAsync })),
}));

describe('GardenSetupRepository', () => {
  beforeEach(() => {
    getFirstAsync.mockReset();
    runAsync.mockReset();
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-05-11T17:00:00.000Z');
    jest.spyOn(Date, 'now').mockReturnValue(1778518800000);
    jest.spyOn(Math, 'random').mockReturnValue(0.123456);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads setup from app_settings', async () => {
    const setup = { id: 'garden-1', name: 'Back Garden', locationLabel: 'Brooklyn, NY', growingSpaces: ['in-ground'], createdAt: 'now', updatedAt: 'now' };
    getFirstAsync.mockResolvedValue({ value_json: JSON.stringify(setup) });

    await expect(new GardenSetupRepository().getSetup()).resolves.toEqual(setup);
    expect(getFirstAsync).toHaveBeenCalledWith('SELECT value_json FROM app_settings WHERE key = ?;', [GARDEN_SETUP_SETTING_KEY]);
  });

  it('persists sanitized setup JSON', async () => {
    getFirstAsync.mockResolvedValue(null);

    const saved = await new GardenSetupRepository().saveSetup({
      name: '  Kitchen Garden  ',
      glyph: 'Kg',
      locationLabel: '  Philadelphia  ',
      locationSource: 'detected',
      latitude: 40.7,
      longitude: -73.9,
      hardinessZone: '7b',
      hardinessZoneSource: 'detected',
      sunExposure: 'full',
      growingSpaces: ['raised-beds', 'containers'],
    });

    expect(saved.name).toBe('Kitchen Garden');
    expect(saved.locationLabel).toBe('Philadelphia');
    expect(saved.growingSpaces).toEqual(['raised-beds', 'containers']);
    expect(saved.locationSource).toBe('detected');
    expect(saved.latitude).toBe(40.7);
    expect(saved.hardinessZoneSource).toBe('detected');
    expect(runAsync).toHaveBeenCalledWith(
      'INSERT OR REPLACE INTO app_settings (key, value_json, updated_at) VALUES (?, ?, ?);',
      [GARDEN_SETUP_SETTING_KEY, expect.stringContaining('Kitchen Garden'), '2026-05-11T17:00:00.000Z']
    );
  });
});
