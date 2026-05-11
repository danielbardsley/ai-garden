import { buildCareRecommendationContext } from '../GardenAgentCareContextBuilder';
import { PlantDetailRecord } from '../../garden-records/models/GardenRecordTypes';

const detail: PlantDetailRecord = {
  plant: { id: 'plant-1', displayName: 'Basil', statusKind: 'good', nextActionLabel: 'Check soil' },
  observations: [{ id: 'obs-1', plantId: 'plant-1', observedOn: '2026-05-09', kind: 'photo', note: 'Looks dry' }],
  photos: [{ id: 'photo-1', plantId: 'plant-1', localUri: 'file:///private/photo.jpg', source: 'camera', isCoverCandidate: false, capturedOn: '2026-05-09' }],
  careEvents: [{ id: 'care-1', plantId: 'plant-1', eventType: 'watered', eventDate: '2026-05-07', source: 'manual' }],
  careRecommendations: [{ id: 'rec-1', plantId: 'plant-1', recommendationType: 'watered', title: 'Check soil', status: 'suggested', source: 'ai' }],
  aiInsights: [
    { id: 'insight-care', plantId: 'plant-1', scope: 'care', kind: 'care_note', body: 'Watch moisture', status: 'active' },
    { id: 'insight-photo', plantId: 'plant-1', scope: 'photo', kind: 'summary', body: 'Photo summary', status: 'active' },
  ],
  conversation: { id: 'conversation-1', plantId: 'plant-1', scope: 'plant' },
  careProfile: { id: 'profile-1', plantId: 'plant-1', lightPreference: 'Bright shade', wateringRhythm: 'Weekly', source: 'manual' },
};

test('buildCareRecommendationContext includes care records and omits local URIs', () => {
  const context = buildCareRecommendationContext(detail);

  expect(context.careProfile).toMatchObject({ lightPreference: 'Bright shade', wateringRhythm: 'Weekly' });
  expect(context.plant).toMatchObject({ id: 'plant-1', displayName: 'Basil' });
  expect(context.recentCareEvents).toHaveLength(1);
  expect(context.careRecommendations).toHaveLength(1);
  expect(context.recentAiInsights).toHaveLength(1);
  expect(JSON.stringify(context)).not.toContain('file:///private/photo.jpg');
});
