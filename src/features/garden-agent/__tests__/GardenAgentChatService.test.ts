import { gardenAgentApiClient } from '../GardenAgentApiClient';
import { GardenAgentChatService } from '../GardenAgentChatService';
import { gardenAgentDiagnosticsService } from '../GardenAgentDiagnostics';
import { PlantDetailRecord } from '../../garden-records/models/GardenRecordTypes';

jest.mock('../GardenAgentApiClient', () => ({ gardenAgentApiClient: { submitPlantChat: jest.fn() } }));
jest.mock('../GardenAgentDiagnostics', () => ({
  gardenAgentDiagnosticsService: { checkHealth: jest.fn() },
  requestFailedDiagnostics: jest.fn(() => ({ apiReachable: true, agentConfigured: true, failureKind: 'request_failed', message: 'AI request failed; try again.' })),
}));

const detail: PlantDetailRecord = {
  plant: { id: 'plant-1', displayName: 'Snake', statusKind: 'idle' },
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

test('askPlantQuestion submits plant chat request', async () => {
  (gardenAgentApiClient.submitPlantChat as jest.Mock).mockResolvedValue({ runId: 'run-1', status: 'succeeded', output: { answer: 'Check soil.' } });

  const result = await new GardenAgentChatService().askPlantQuestion({ detail, question: 'Water?', recentMessages: [], messageId: 'message-1' });

  expect(result).toEqual({ runId: 'run-1', output: { answer: 'Check soil.' } });
  expect(gardenAgentApiClient.submitPlantChat).toHaveBeenCalledWith(expect.objectContaining({ question: 'Water?', plantId: 'plant-1', conversationId: 'conversation-1' }));
});

test('askPlantQuestion returns diagnostics before upload when API unreachable', async () => {
  const diagnostics = { apiReachable: false, agentConfigured: null, failureKind: 'api_unreachable', message: 'Garden API is unreachable from this device.' };
  (gardenAgentDiagnosticsService.checkHealth as jest.Mock).mockResolvedValue(diagnostics);

  await expect(new GardenAgentChatService().askPlantQuestion({ detail, question: 'Water?', recentMessages: [] })).resolves.toEqual({ diagnostics });
  expect(gardenAgentApiClient.submitPlantChat).not.toHaveBeenCalled();
});
