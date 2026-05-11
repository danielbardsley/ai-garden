const db = {
  runAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn(),
  execAsync: jest.fn(),
  withTransactionAsync: jest.fn(async (task: () => Promise<void>) => task()),
};

jest.mock('../../../storage/database', () => ({ getGardenDatabase: jest.fn(async () => db) }));

import { aiConversationRepository } from '../AiConversationRepository';
import { aiInsightRepository } from '../AiInsightRepository';
import { careEventRepository } from '../CareEventRepository';
import { careRecommendationRepository } from '../CareRecommendationRepository';
import { careProfileRepository } from '../CareProfileRepository';
import { observationRepository } from '../ObservationRepository';
import { photoPlantMatchRepository } from '../PhotoPlantMatchRepository';
import { photoRepository } from '../PhotoRepository';
import { plantRepository } from '../PlantRepository';

beforeEach(() => {
  jest.clearAllMocks();
  db.getFirstAsync.mockReset();
  db.getAllAsync.mockReset();
  db.runAsync.mockResolvedValue(undefined);
});

test('ObservationRepository creates photo observations with nullable season', async () => {
  db.getFirstAsync.mockResolvedValue({ id: 'obs-1', plant_id: 'plant-1', observed_on: '2026-05-08', kind: 'photo', note: 'Photo' });

  const result = await observationRepository.createPhotoObservation({
    id: 'obs-1', plantId: 'plant-1', observedOn: '2026-05-08', observedAt: 'now', note: 'Photo', seasonId: null,
  });

  expect(db.runAsync.mock.calls[0][1][2]).toBeNull();
  expect(result).toMatchObject({ id: 'obs-1', plantId: 'plant-1', note: 'Photo' });
});

test('PhotoRepository creates captured photos and maps the inserted row', async () => {
  db.getFirstAsync.mockResolvedValue({ id: 'photo-1', plant_id: 'plant-1', observation_id: 'obs-1', local_uri: 'file://photo.jpg', source: 'camera', is_cover_candidate: 0 });

  const result = await photoRepository.createCapturedPhoto({
    id: 'photo-1', observationId: 'obs-1', plantId: 'plant-1', localUri: 'file://photo.jpg', takenAt: 'now', capturedOn: '2026-05-08', width: 10,
  });

  expect(db.runAsync).toHaveBeenCalled();
  expect(result).toMatchObject({ id: 'photo-1', plantId: 'plant-1', localUri: 'file://photo.jpg' });
});

test('PhotoRepository creates system and AI tags, skipping blank AI tags', async () => {
  await photoRepository.createSystemTags('photo-1', ['Camera', 'garden journal']);
  await photoRepository.createAiTags('photo-1', [{ label: ' Healthy ', confidence: 0.8 }, { label: ' ', confidence: 0.2 }]);

  expect(db.runAsync).toHaveBeenCalledTimes(3);
  expect(db.runAsync.mock.calls[2][1][2]).toBe('healthy');
});

test('PhotoRepository lists gallery photos and tags', async () => {
  db.getAllAsync
    .mockResolvedValueOnce([{ id: 'photo-1', plant_id: 'plant-1', local_uri: 'file://photo.jpg', source: 'camera', is_cover_candidate: 1 }])
    .mockResolvedValueOnce([{ id: 'tag-1', photo_id: 'photo-1', tag: 'healthy', source: 'ai', confidence: 0.9 }]);

  await expect(photoRepository.listGalleryPhotos({ plantId: 'plant-1' })).resolves.toEqual([expect.objectContaining({ id: 'photo-1', isCoverCandidate: true })]);
  await expect(photoRepository.listTagsForPhoto('photo-1')).resolves.toEqual([{ id: 'tag-1', photoId: 'photo-1', tag: 'healthy', source: 'ai', confidence: 0.9 }]);
});

test('AiInsightRepository creates and lists insights', async () => {
  db.getAllAsync.mockResolvedValue([{ id: 'insight-1', plant_id: 'plant-1', photo_id: 'photo-1', scope: 'photo', kind: 'summary', body: 'Looks good', status: 'active' }]);

  await aiInsightRepository.createInsight({ id: 'insight-1', plantId: 'plant-1', photoId: 'photo-1', observationId: 'obs-1', scope: 'photo', kind: 'summary', body: 'Looks good', sourceRunId: 'run-1' });
  await expect(aiInsightRepository.listInsightsForPlant('plant-1')).resolves.toEqual([expect.objectContaining({ id: 'insight-1', body: 'Looks good' })]);

  expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT OR IGNORE INTO ai_insights'), expect.arrayContaining(['insight-1', 'plant-1']));
});

test('PhotoPlantMatchRepository creates provenance rows', async () => {
  await photoPlantMatchRepository.createMatch({
    id: 'match-1', photoId: 'photo-1', observationId: 'obs-1', confirmedPlantId: 'plant-1', suggestedPlantId: null, sourceRunId: 'run-1', matchSource: 'ai_confirmed', confidence: 0.8, rationale: 'match',
  });

  expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO photo_plant_matches'), expect.arrayContaining(['match-1', 'photo-1', 'plant-1', 'ai_confirmed']));
});


test('CareEventRepository creates manual care events', async () => {
  db.getFirstAsync.mockResolvedValue({ id: 'care-1', plant_id: 'plant-1', event_type: 'watered', event_date: '2026-05-09', note: 'Deep soak', source: 'manual' });

  await expect(careEventRepository.createCareEvent({ id: 'care-1', plantId: 'plant-1', eventType: 'watered', eventDate: '2026-05-09', note: 'Deep soak' })).resolves.toMatchObject({ id: 'care-1', eventType: 'watered', note: 'Deep soak', source: 'manual' });

  expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO care_events'), expect.arrayContaining(['care-1', 'plant-1', 'watered', '2026-05-09', 'Deep soak', 'manual']));
});


test('CareRecommendationRepository creates AI suggestions', async () => {
  db.getFirstAsync.mockResolvedValue({ id: 'rec-1', plant_id: 'plant-1', recommendation_type: 'watered', title: 'Check soil', body: 'Before watering', due_on: null, status: 'suggested', source: 'ai' });

  await expect(careRecommendationRepository.createAiSuggestion({ id: 'rec-1', plantId: 'plant-1', recommendationType: 'watered', title: 'Check soil', body: 'Before watering' })).resolves.toMatchObject({ id: 'rec-1', source: 'ai', status: 'suggested' });

  expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO care_recommendations'), expect.arrayContaining(['rec-1', 'plant-1', 'watered', 'Check soil', 'Before watering', 'suggested', 'ai']));
});




test('CareRecommendationRepository archives recommendations with soft delete', async () => {
  jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-05-09T18:30:00.000Z');

  await careRecommendationRepository.archiveRecommendation('rec-archive');

  expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('UPDATE care_recommendations SET deleted_at'), ['2026-05-09T18:30:00.000Z', '2026-05-09T18:30:00.000Z', 'rec-archive']);
});

test('CareRecommendationRepository marks recommendations completed', async () => {
  await careRecommendationRepository.markCompleted('rec-1');

  expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('UPDATE care_recommendations SET status'), expect.arrayContaining(['completed', 'rec-1']));
});

test('CareProfileRepository upserts profiles', async () => {
  db.getFirstAsync
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce({ id: 'care-profile-plant-1', plant_id: 'plant-1', light_preference: 'Bright shade', watering_rhythm: 'Weekly', source: 'manual', created_at: 'now', updated_at: 'now' });

  await expect(careProfileRepository.upsertProfile({ plantId: 'plant-1', lightPreference: 'Bright shade', wateringRhythm: 'Weekly' })).resolves.toMatchObject({ plantId: 'plant-1', lightPreference: 'Bright shade' });

  expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO care_profiles'), expect.arrayContaining(['care-profile-plant-1', 'plant-1', 'Bright shade', 'Weekly', 'manual']));
});

test('PlantRepository lists, fetches, creates, and details plants', async () => {
  const plantRow = { id: 'plant-1', display_name: 'Snake plant', common_name: 'Snake plant', status_kind: 'idle' };
  db.getAllAsync
    .mockResolvedValueOnce([plantRow])
    .mockResolvedValueOnce([plantRow])
    .mockResolvedValueOnce([{ id: 'obs-1', plant_id: 'plant-1', observed_on: '2026-05-08', kind: 'photo' }])
    .mockResolvedValueOnce([{ id: 'photo-1', plant_id: 'plant-1', local_uri: 'file://photo.jpg', source: 'camera', is_cover_candidate: 0 }])
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([]);
  db.getFirstAsync
    .mockResolvedValueOnce(plantRow)
    .mockResolvedValueOnce({ max_sort: 1 })
    .mockResolvedValueOnce(plantRow)
    .mockResolvedValueOnce(plantRow)
    .mockResolvedValueOnce(null);

  await expect(plantRepository.listActivePlants()).resolves.toEqual([expect.objectContaining({ id: 'plant-1' })]);
  await expect(plantRepository.getPlantById('plant-1')).resolves.toEqual(expect.objectContaining({ commonName: 'Snake plant' }));
  await expect(plantRepository.createPlant({ id: 'plant-2', displayName: 'Peace lily' })).resolves.toEqual(expect.objectContaining({ id: 'plant-1' }));
  await expect(plantRepository.getPlantDetail('plant-1')).resolves.toEqual(expect.objectContaining({ plant: expect.objectContaining({ id: 'plant-1' }), photos: expect.any(Array) }));
});


test('AiConversationRepository creates and lists messages', async () => {
  db.getAllAsync.mockResolvedValue([{ id: 'message-1', conversation_id: 'conversation-1', plant_id: 'plant-1', role: 'user', body: 'Water?', status: 'sent', source_run_id: null, metadata_json: null, created_at: 'now' }]);
  db.getFirstAsync.mockResolvedValue({ id: 'message-1', conversation_id: 'conversation-1', plant_id: 'plant-1', role: 'user', body: 'Water?', status: 'sent', source_run_id: null, metadata_json: null, created_at: 'now' });

  await aiConversationRepository.ensurePlantConversation({ id: 'conversation-1', plantId: 'plant-1' });
  await expect(aiConversationRepository.createMessage({ id: 'message-1', conversationId: 'conversation-1', plantId: 'plant-1', role: 'user', body: 'Water?' })).resolves.toMatchObject({ id: 'message-1', body: 'Water?' });
  await expect(aiConversationRepository.listMessages('conversation-1')).resolves.toEqual([expect.objectContaining({ id: 'message-1', role: 'user' })]);
  await aiConversationRepository.markMessageStatus('message-1', 'failed');

  expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT OR IGNORE INTO ai_conversations'), expect.any(Array));
  expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('UPDATE ai_messages SET status'), expect.arrayContaining(['failed']));
});
