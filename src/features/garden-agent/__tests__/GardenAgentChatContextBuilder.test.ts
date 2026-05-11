import { buildPlantChatContext } from '../GardenAgentChatContextBuilder';
import { PlantDetailRecord } from '../../garden-records/models/GardenRecordTypes';

const detail: PlantDetailRecord = {
  plant: { id: 'plant-1', displayName: 'Snake', commonName: 'Snake plant', statusKind: 'idle', locationName: 'Living room' },
  observations: Array.from({ length: 12 }, (_, index) => ({ id: `obs-${index}`, plantId: 'plant-1', observedOn: `2026-05-${String(index + 1).padStart(2, '0')}`, kind: 'photo' as const, note: `note ${index}` })),
  photos: [{ id: 'photo-1', plantId: 'plant-1', localUri: 'file:///secret/photo.jpg', source: 'camera', isCoverCandidate: false, capturedOn: '2026-05-01' }],
  careEvents: [],
  careRecommendations: [],
  aiInsights: [{ id: 'insight-1', plantId: 'plant-1', scope: 'photo', kind: 'summary', body: 'Looks good', status: 'active' }],
  conversation: { id: 'conversation-1', plantId: 'plant-1', scope: 'plant' },
  careProfile: { id: 'profile-1', plantId: 'plant-1', lightPreference: 'Bright shade', wateringRhythm: 'Weekly', source: 'manual' },
};

test('buildPlantChatContext compacts plant context and omits local URIs', () => {
  const context = buildPlantChatContext(detail, [{ id: 'message-1', conversationId: 'conversation-1', plantId: 'plant-1', role: 'user', body: 'Hi', status: 'sent', createdAt: 'now' }]);

  expect(context.careProfile).toMatchObject({ lightPreference: 'Bright shade', wateringRhythm: 'Weekly' });
  expect(context.plant).toMatchObject({ id: 'plant-1', commonName: 'Snake plant' });
  expect(context.recentObservations).toHaveLength(10);
  expect(context.recentPhotos[0]).toMatchObject({ id: 'photo-1', localOnly: true });
  expect(JSON.stringify(context)).not.toContain('file:///secret/photo.jpg');
  expect(context.recentMessages).toHaveLength(1);
});
