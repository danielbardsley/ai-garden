import { plantCardSubheader } from '../plantCardMetadata';
import { PhotoRecord, PlantRecord } from '../../garden-records/models/GardenRecordTypes';

const plant: PlantRecord = { id: 'plant-1', displayName: 'Basil', commonName: 'Basil', statusKind: 'good', statusLabel: 'Bushy', nextActionLabel: 'Pinch tops' };

function photo(id: string, capturedOn: string): PhotoRecord {
  return { id, plantId: 'plant-1', localUri: `file://${id}.jpg`, source: 'camera', isCoverCandidate: false, capturedOn };
}

describe('plant card metadata', () => {
  it('uses photo count and absolute latest date instead of repeating plant name', () => {
    expect(plantCardSubheader(plant, [photo('older', '2026-05-07'), photo('newer', '2026-05-11')])).toBe('2 photos · latest May 11');
  });

  it('falls back to care/status copy without relative day offsets', () => {
    expect(plantCardSubheader(plant, [])).toBe('Pinch tops');
    expect(plantCardSubheader({ ...plant, nextActionLabel: null }, [])).toBe('Bushy');
    expect(plantCardSubheader({ ...plant, nextActionLabel: null, statusLabel: null }, [])).toBe('No photos yet');
  });
});
