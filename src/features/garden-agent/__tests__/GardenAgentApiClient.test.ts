import { GardenAgentApiClient } from '../GardenAgentApiClient';
import { PhotoIdentificationRequest } from '../types';

const event: PhotoIdentificationRequest = {
  eventId: 'event-1',
  eventType: 'photo.identification_requested',
  occurredAt: '2026-05-08T12:00:00Z',
  launchedFromPlantId: null,
  capture: { capturedOn: '2026-05-08', mimeType: 'image/jpeg' },
  context: { plants: [], app: { platform: 'ios', schemaVersion: 3 } },
};

test('identifyPhoto returns diagnostics for non-OK response', async () => {
  global.fetch = jest.fn(async () => ({ ok: false })) as jest.Mock;
  await expect(new GardenAgentApiClient().identifyPhoto(event, 'file://photo.jpg', 'image/jpeg')).resolves.toMatchObject({ diagnostics: { failureKind: 'request_failed' } });
});

test('identifyPhoto returns parsed successful response', async () => {
  const payload = { runId: 'run-1', status: 'succeeded', providerConfigured: true, output: { summary: 'ok', plantMatches: [] } };
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => payload })) as jest.Mock;

  await expect(new GardenAgentApiClient().identifyPhoto(event, 'file://photo.jpg', 'image/jpeg')).resolves.toEqual(payload);
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/agent/photo-identifications'), expect.objectContaining({ method: 'POST' }));
});


test('submitPhotoCategorization returns parsed response', async () => {
  const payload = { runId: 'run-cat', status: 'succeeded', providerConfigured: true, output: { summary: 'ok' } };
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => payload })) as jest.Mock;
  await expect(new GardenAgentApiClient().submitPhotoCategorization({
    eventId: 'event-2', eventType: 'photo.captured', occurredAt: 'now', context: {}, entityType: 'photo', entityId: 'photo-1', plantId: 'plant-1'
  }, 'file://photo.jpg', 'image/jpeg')).resolves.toEqual(payload);
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/agent/photo-categorizations'), expect.objectContaining({ method: 'POST' }));
});

test('submitEvent returns null when fetch throws', async () => {
  global.fetch = jest.fn(async () => { throw new Error('network'); }) as jest.Mock;
  await expect(new GardenAgentApiClient().submitEvent({ eventId: 'event-3', eventType: 'photo.captured', context: {} })).resolves.toBeNull();
});

test('submitEvent returns parsed json for OK response', async () => {
  const payload = { runId: 'run-event', status: 'succeeded', providerConfigured: false, output: { summary: 'ok' } };
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => payload })) as jest.Mock;
  await expect(new GardenAgentApiClient().submitEvent({ eventId: 'event-4', eventType: 'photo.captured', context: {} })).resolves.toEqual(payload);
});


test('submitPlantChat returns parsed response', async () => {
  const payload = { runId: 'run-chat', status: 'succeeded', providerConfigured: true, output: { answer: 'Check soil.' } };
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => payload })) as jest.Mock;
  await expect(new GardenAgentApiClient().submitPlantChat({
    messageId: 'message-1', conversationId: 'conversation-1', plantId: 'plant-1', occurredAt: 'now', question: 'Water?', context: {},
  })).resolves.toEqual(payload);
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/agent/plant-chat'), expect.objectContaining({ method: 'POST' }));
});


test('submitCareRecommendations returns parsed response', async () => {
  const payload = { runId: 'run-care', status: 'succeeded', providerConfigured: true, output: { summary: 'ok', recommendations: [] } };
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => payload })) as jest.Mock;
  await expect(new GardenAgentApiClient().submitCareRecommendations({
    requestId: 'request-1', plantId: 'plant-1', occurredAt: 'now', context: {},
  })).resolves.toEqual(payload);
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/agent/care-recommendations'), expect.objectContaining({ method: 'POST' }));
});


test('submitCareProfileDraft returns parsed response', async () => {
  const payload = { runId: 'run-profile', status: 'succeeded', providerConfigured: true, output: { summary: 'ok', profile: {} } };
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => payload })) as jest.Mock;
  await expect(new GardenAgentApiClient().submitCareProfileDraft({
    requestId: 'draft-1', plantId: 'plant-1', occurredAt: 'now', context: {},
  })).resolves.toEqual(payload);
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/agent/care-profile-draft'), expect.objectContaining({ method: 'POST' }));
});
