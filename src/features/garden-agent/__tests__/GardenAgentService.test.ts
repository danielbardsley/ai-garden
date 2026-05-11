import { gardenAgentApiClient } from '../GardenAgentApiClient';
import { GardenAgentService } from '../GardenAgentService';
import { gardenAgentDiagnosticsService } from '../GardenAgentDiagnostics';
import { aiInsightRepository } from '../../garden-records/repositories/AiInsightRepository';
import { photoRepository } from '../../garden-records/repositories/PhotoRepository';
import { PlantRecord, PhotoRecord, ObservationRecord } from '../../garden-records/models/GardenRecordTypes';

jest.mock('../GardenAgentApiClient', () => ({
  gardenAgentApiClient: {
    identifyPhoto: jest.fn(),
    submitPhotoCategorization: jest.fn(),
  },
}));
jest.mock('../GardenAgentDiagnostics', () => ({
  gardenAgentDiagnosticsService: { checkHealth: jest.fn() },
  requestFailedDiagnostics: jest.fn(() => ({ apiReachable: true, agentConfigured: true, failureKind: 'request_failed', message: 'AI request failed; try again.' })),
}));
jest.mock('../../garden-records/repositories/AiInsightRepository', () => ({
  aiInsightRepository: { createInsight: jest.fn() },
}));
jest.mock('../../garden-records/repositories/PhotoRepository', () => ({
  photoRepository: { createAiTags: jest.fn() },
}));

const plant: PlantRecord = { id: 'plant-1', displayName: 'Snake', commonName: 'Snake plant', statusKind: 'idle' };
const photo: PhotoRecord = { id: 'photo-1', plantId: 'plant-1', observationId: 'obs-1', localUri: 'file://photo.jpg', source: 'camera', isCoverCandidate: false, mimeType: 'image/jpeg' };
const observation: ObservationRecord = { id: 'obs-1', plantId: 'plant-1', observedOn: '2026-05-08', kind: 'photo' };

beforeEach(() => {
  jest.clearAllMocks();
  (gardenAgentDiagnosticsService.checkHealth as jest.Mock).mockResolvedValue({ apiReachable: true, agentConfigured: true, failureKind: null, message: 'Garden AI is configured.' });
  jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-05-08T12:00:00.000Z');
  jest.spyOn(Math, 'random').mockReturnValue(0.123456);
});

afterEach(() => jest.restoreAllMocks());

test('identifyCapturedPhoto returns run output for succeeded responses', async () => {
  (gardenAgentApiClient.identifyPhoto as jest.Mock).mockResolvedValue({
    runId: 'run-1', status: 'succeeded', output: { summary: 'ok', plantMatches: [] }, providerConfigured: true,
  });

  const result = await new GardenAgentService().identifyCapturedPhoto({
    localUri: 'file://photo.jpg', mimeType: 'image/jpeg', launchedFromPlantId: 'plant-1', plants: [plant],
  });

  expect(result).toEqual({ runId: 'run-1', output: { summary: 'ok', plantMatches: [] } });
  expect(gardenAgentDiagnosticsService.checkHealth).toHaveBeenCalled();
  expect(gardenAgentApiClient.identifyPhoto).toHaveBeenCalledWith(expect.objectContaining({
    eventType: 'photo.identification_requested', launchedFromPlantId: 'plant-1', capture: expect.objectContaining({ capturedOn: expect.any(String) }),
  }), 'file://photo.jpg', 'image/jpeg');
});


test('identifyCapturedPhoto returns diagnostics when API is unreachable before upload', async () => {
  const diagnostic = { apiReachable: false, agentConfigured: null, failureKind: 'api_unreachable', message: 'Garden API is unreachable from this device.' };
  (gardenAgentDiagnosticsService.checkHealth as jest.Mock).mockResolvedValue(diagnostic);

  const result = await new GardenAgentService().identifyCapturedPhoto({
    localUri: 'file://photo.jpg', mimeType: 'image/jpeg', plants: [plant],
  });

  expect(result).toEqual({ diagnostics: diagnostic });
  expect(gardenAgentApiClient.identifyPhoto).not.toHaveBeenCalled();
});

test('identifyCapturedPhoto returns diagnostics for failed responses', async () => {
  (gardenAgentApiClient.identifyPhoto as jest.Mock).mockResolvedValue({ runId: 'run-1', status: 'failed' });
  await expect(new GardenAgentService().identifyCapturedPhoto({ localUri: 'file://photo.jpg', plants: [] })).resolves.toMatchObject({ diagnostics: { failureKind: 'request_failed' } });
});

test('submitPhotoCaptured persists AI tags and insight for succeeded categorization', async () => {
  (gardenAgentApiClient.submitPhotoCategorization as jest.Mock).mockResolvedValue({
    runId: 'run-2',
    status: 'succeeded',
    output: {
      summary: 'Looks healthy',
      tags: [{ label: 'healthy', confidence: 0.8 }],
      insight: { title: 'Healthy', body: 'Looks healthy.', kind: 'summary', confidence: 0.7 },
      confidence: 0.7,
    },
  });

  const response = await new GardenAgentService().submitPhotoCaptured({ plant, photo, observation });

  expect(response?.status).toBe('succeeded');
  expect(photoRepository.createAiTags).toHaveBeenCalledWith('photo-1', [{ label: 'healthy', confidence: 0.8 }]);
  expect(aiInsightRepository.createInsight).toHaveBeenCalledWith(expect.objectContaining({
    plantId: 'plant-1', photoId: 'photo-1', observationId: 'obs-1', sourceRunId: 'run-2', body: 'Looks healthy.',
  }));
});

test('submitPhotoCaptured skips persistence for missing output', async () => {
  (gardenAgentApiClient.submitPhotoCategorization as jest.Mock).mockResolvedValue({ runId: 'run-3', status: 'succeeded' });
  await new GardenAgentService().submitPhotoCaptured({ plant, photo, observation });
  expect(photoRepository.createAiTags).not.toHaveBeenCalled();
});
