import { buildPhotoCapturedContext, buildPhotoIdentificationContext } from '../GardenAgentContextBuilder';
import { ObservationRecord, PhotoRecord, PlantRecord } from '../../garden-records/models/GardenRecordTypes';

const plant: PlantRecord = {
  id: 'snake',
  displayName: 'Snake plant',
  commonName: 'Snake plant',
  varietyName: 'Dracaena trifasciata',
  statusKind: 'idle',
  locationId: 'living-room',
  locationName: 'Living room',
  glyph: 'leaf',
  primaryColor: '#123456',
  secondaryColor: '#abcdef',
};

const photo: PhotoRecord = {
  id: 'photo-1',
  observationId: 'observation-1',
  plantId: 'snake',
  localUri: 'file:///private/photo.jpg',
  capturedOn: '2026-05-08',
  source: 'camera',
  isCoverCandidate: false,
};

const observation: ObservationRecord = {
  id: 'observation-1',
  plantId: 'snake',
  observedOn: '2026-05-08',
  kind: 'photo',
};

test('photo captured context keeps photo metadata local-only without image bytes', () => {
  const context = buildPhotoCapturedContext({ plant, photo, observation });

  expect(context.plant.id).toBe('snake');
  expect(context.photo.localOnly).toBe(true);
  expect(JSON.stringify(context)).not.toContain('file:///private/photo.jpg');
  expect(JSON.stringify(context)).not.toContain('base64');
});

test('photo identification context contains compact plant inventory hints', () => {
  const context = buildPhotoIdentificationContext([plant]);

  expect(context.plants).toHaveLength(1);
  expect(context.plants[0]).toMatchObject({ id: 'snake', commonName: 'Snake plant' });
  expect(context.plants[0].visualHints).toContain('leaf');
  expect(context.app.schemaVersion).toBe(3);
});
