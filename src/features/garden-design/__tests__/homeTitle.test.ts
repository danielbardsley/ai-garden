import { buildHomeTitleContext, fallbackHomeTitle, homeTitleSignature, loadingHomeTitle, sanitizeHomeTitle } from '../homeTitle';
import { GardenSetup } from '../../garden-setup/models/GardenSetup';
import { PlantRecord } from '../../garden-records/models/GardenRecordTypes';

const setup: GardenSetup = { id: 'g1', name: 'Back Garden', locationLabel: 'Jersey City', growingSpaces: [], createdAt: '2026-05-01T00:00:00.000Z', updatedAt: '2026-05-01T00:00:00.000Z' };
const basil: PlantRecord = { id: 'basil', displayName: 'Basil', commonName: 'Basil', statusKind: 'warn', statusLabel: 'Dry', nextActionLabel: 'Check soil' };

describe('home title helpers', () => {
  it('builds highly contextual title input', () => {
    const context = buildHomeTitleContext({ setup, plants: [basil], attentionPlants: [basil], photos: [{ id: 'p1', plantId: 'basil', localUri: 'x', source: 'camera', isCoverCandidate: false, capturedOn: '2026-05-11' }], now: new Date('2026-05-11T09:00:00') });
    expect(context).toMatchObject({ gardenName: 'Back Garden', timeOfDay: 'morning', plantCount: 1, attentionCount: 1, recentPhotoCount: 1 });
    expect(homeTitleSignature(context)).toContain('Back Garden');
  });

  it('prioritizes attention and preserves waking-up tone fallback', () => {
    const attention = buildHomeTitleContext({ setup, plants: [basil], attentionPlants: [basil], photos: [], now: new Date('2026-05-11T19:00:00') });
    expect(fallbackHomeTitle(attention)).toBe('Basil wants a last look.');
    const quiet = buildHomeTitleContext({ setup, plants: [], attentionPlants: [], photos: [], now: new Date('2026-05-11T08:00:00') });
    expect(fallbackHomeTitle(quiet)).toBe('Back Garden is waking up.');
  });

  it('sanitizes and caps generated titles', () => {
    expect(sanitizeHomeTitle('“Back Garden is waking up.”')).toBe('Back Garden is waking up.');
    expect(sanitizeHomeTitle('x'.repeat(90))).toHaveLength(70);
  });

  it('provides contextual loading copy', () => {
    expect(loadingHomeTitle({ timeOfDay: 'night' })).toBe('Listening to the quiet garden…');
  });
});
