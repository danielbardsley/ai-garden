import { gardenAgentApiClient } from '../GardenAgentApiClient';
import { GardenAgentCareProfileService } from '../GardenAgentCareProfileService';
import { gardenAgentDiagnosticsService } from '../GardenAgentDiagnostics';
import { PlantDetailRecord } from '../../garden-records/models/GardenRecordTypes';

jest.mock('../GardenAgentApiClient', () => ({ gardenAgentApiClient: { submitCareProfileDraft: jest.fn() } }));
jest.mock('../GardenAgentDiagnostics', () => ({
  gardenAgentDiagnosticsService: { checkHealth: jest.fn() },
  requestFailedDiagnostics: jest.fn(() => ({ apiReachable: true, agentConfigured: true, failureKind: 'request_failed', message: 'AI request failed; try again.' })),
}));

const detail: PlantDetailRecord = {
  plant: { id: 'plant-1', displayName: 'Basil', statusKind: 'idle' },
  observations: [], photos: [], careEvents: [], careRecommendations: [], aiInsights: [],
  conversation: { id: 'conversation-1', plantId: 'plant-1', scope: 'plant' },
};

beforeEach(() => {
  jest.clearAllMocks();
  (gardenAgentDiagnosticsService.checkHealth as jest.Mock).mockResolvedValue({ apiReachable: true, agentConfigured: true, failureKind: null, message: 'ok' });
  jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-05-09T18:30:00.000Z');
});

afterEach(() => jest.restoreAllMocks());

test('requestCareProfileDraft submits draft request after diagnostics', async () => {
  const output = { summary: 'Drafted', profile: { lightPreference: 'Bright shade' } };
  (gardenAgentApiClient.submitCareProfileDraft as jest.Mock).mockResolvedValue({ runId: 'run-1', status: 'succeeded', output });

  await expect(new GardenAgentCareProfileService().requestCareProfileDraft({ detail, requestId: 'draft-1' })).resolves.toEqual({ runId: 'run-1', output });
  expect(gardenAgentApiClient.submitCareProfileDraft).toHaveBeenCalledWith(expect.objectContaining({ requestId: 'draft-1', plantId: 'plant-1' }));
});

test('requestCareProfileDraft returns diagnostics before backend call', async () => {
  const diagnostics = { apiReachable: false, agentConfigured: null, failureKind: 'api_unreachable', message: 'Garden API is unreachable from this device.' };
  (gardenAgentDiagnosticsService.checkHealth as jest.Mock).mockResolvedValue(diagnostics);

  await expect(new GardenAgentCareProfileService().requestCareProfileDraft({ detail })).resolves.toEqual({ diagnostics });
  expect(gardenAgentApiClient.submitCareProfileDraft).not.toHaveBeenCalled();
});
