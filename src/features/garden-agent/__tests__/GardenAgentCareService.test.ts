import { gardenAgentApiClient } from '../GardenAgentApiClient';
import { GardenAgentCareService } from '../GardenAgentCareService';
import { gardenAgentDiagnosticsService } from '../GardenAgentDiagnostics';
import { PlantDetailRecord } from '../../garden-records/models/GardenRecordTypes';

jest.mock('../GardenAgentApiClient', () => ({ gardenAgentApiClient: { submitCareRecommendations: jest.fn() } }));
jest.mock('../GardenAgentDiagnostics', () => ({
  gardenAgentDiagnosticsService: { checkHealth: jest.fn() },
  requestFailedDiagnostics: jest.fn(() => ({ apiReachable: true, agentConfigured: true, failureKind: 'request_failed', message: 'AI request failed; try again.' })),
}));

const detail: PlantDetailRecord = {
  plant: { id: 'plant-1', displayName: 'Basil', statusKind: 'idle' },
  observations: [],
  photos: [],
  careEvents: [],
  careRecommendations: [],
  aiInsights: [],
  conversation: { id: 'conversation-1', plantId: 'plant-1', scope: 'plant' },
};

beforeEach(() => {
  jest.clearAllMocks();
  (gardenAgentDiagnosticsService.checkHealth as jest.Mock).mockResolvedValue({ apiReachable: true, agentConfigured: true, failureKind: null, message: 'ok' });
  jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-05-09T18:30:00.000Z');
});

afterEach(() => jest.restoreAllMocks());

test('requestCareRecommendations submits care request after diagnostics', async () => {
  const output = { summary: 'One suggestion', recommendations: [{ recommendationType: 'watered', title: 'Check soil' }] };
  (gardenAgentApiClient.submitCareRecommendations as jest.Mock).mockResolvedValue({ runId: 'run-1', status: 'succeeded', output });

  await expect(new GardenAgentCareService().requestCareRecommendations({ detail, requestId: 'request-1' })).resolves.toEqual({ runId: 'run-1', output });
  expect(gardenAgentApiClient.submitCareRecommendations).toHaveBeenCalledWith(expect.objectContaining({ requestId: 'request-1', plantId: 'plant-1' }));
});

test('requestCareRecommendations returns diagnostics before backend call', async () => {
  const diagnostics = { apiReachable: false, agentConfigured: null, failureKind: 'api_unreachable', message: 'Garden API is unreachable from this device.' };
  (gardenAgentDiagnosticsService.checkHealth as jest.Mock).mockResolvedValue(diagnostics);

  await expect(new GardenAgentCareService().requestCareRecommendations({ detail })).resolves.toEqual({ diagnostics });
  expect(gardenAgentApiClient.submitCareRecommendations).not.toHaveBeenCalled();
});
