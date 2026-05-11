import { buildCareProfileDraftContext } from '../GardenAgentCareProfileContextBuilder';
import { PlantDetailRecord } from '../../garden-records/models/GardenRecordTypes';

const detail: PlantDetailRecord = {
  plant: { id: 'plant-1', displayName: 'Basil', statusKind: 'good' },
  careProfile: { id: 'profile-1', plantId: 'plant-1', lightPreference: 'Bright shade', wateringRhythm: 'Weekly', source: 'manual' },
  observations: [{ id: 'obs-1', plantId: 'plant-1', observedOn: '2026-05-09', kind: 'photo', note: 'Looks dry' }],
  photos: [{ id: 'photo-1', plantId: 'plant-1', localUri: 'file:///private/photo.jpg', source: 'camera', isCoverCandidate: false, capturedOn: '2026-05-09' }],
  careEvents: [],
  careRecommendations: [],
  aiInsights: [],
  conversation: { id: 'conversation-1', plantId: 'plant-1', scope: 'plant' },
};

test('buildCareProfileDraftContext includes existing profile and omits local URIs', () => {
  const context = buildCareProfileDraftContext(detail);

  expect(context.careProfile).toMatchObject({ lightPreference: 'Bright shade', wateringRhythm: 'Weekly' });
  expect(context.app).toMatchObject({ feature: 'ai-care-profile-generation' });
  expect(JSON.stringify(context)).not.toContain('file:///private/photo.jpg');
});
