import { canAddPhotoIdentificationToInventory, isNonPlantIdentification } from '../cameraIdentificationGuards';

test('detects no-plant identification results', () => {
  expect(isNonPlantIdentification({ summary: 'No plant is visible. This appears to be a desk and speaker.', visualCommonName: 'No plant is visible' })).toBe(true);
  expect(canAddPhotoIdentificationToInventory({ summary: 'No visible plant in frame', openIdentification: 'No visible plant; likely an indoor desk setup.' })).toBe(false);
});

test('allows plausible plant identification results to be added', () => {
  expect(isNonPlantIdentification({ summary: 'A leafy houseplant.', visualCommonName: 'Snake plant' })).toBe(false);
  expect(canAddPhotoIdentificationToInventory({ summary: 'A leafy houseplant.', visualCommonName: 'Snake plant' })).toBe(true);
});
