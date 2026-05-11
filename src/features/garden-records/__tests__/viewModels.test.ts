import { latestPhotoForPlant, plantSwatch, relDays } from '../viewModels';
import { PhotoRecord, PlantRecord } from '../models/GardenRecordTypes';

const plant: PlantRecord = {
  id: 'plant-1',
  displayName: 'Plant',
  statusKind: 'idle',
  primaryColor: '#111111',
  secondaryColor: '#222222',
  coverPhotoId: 'photo-cover',
};

const photos: PhotoRecord[] = [
  { id: 'photo-other', plantId: 'other', localUri: 'other.jpg', source: 'camera', isCoverCandidate: false },
  { id: 'photo-cover', plantId: 'plant-1', localUri: 'cover.jpg', source: 'camera', isCoverCandidate: false },
  { id: 'photo-latest', plantId: 'plant-1', localUri: 'latest.jpg', source: 'camera', isCoverCandidate: false },
];

test('latestPhotoForPlant prefers cover photo when present', () => {
  expect(latestPhotoForPlant(plant, photos)?.id).toBe('photo-cover');
});

test('latestPhotoForPlant falls back to first photo for plant', () => {
  expect(latestPhotoForPlant({ ...plant, coverPhotoId: null }, photos)?.id).toBe('photo-cover');
});

test('plantSwatch and relDays provide display helpers', () => {
  expect(plantSwatch(plant)).toEqual(['#111111', '#222222']);
  expect(relDays('2026-05-07')).toBe('today');
  expect(relDays(null)).toBe('—');
});


test('relDays handles recent, monthly, and yearly distances', () => {
  expect(relDays('2026-05-06')).toBe('1d ago');
  expect(relDays('2026-04-07')).toBe('30d ago');
  expect(relDays('2026-03-01')).toBe('2mo ago');
  expect(relDays('2025-05-07')).toBe('1y ago');
});

test('plantSwatch falls back to default colors', () => {
  expect(plantSwatch({ id: 'p2', displayName: 'Fallback', statusKind: 'idle' })).toEqual(['#7da259', '#3e5c3a']);
});
