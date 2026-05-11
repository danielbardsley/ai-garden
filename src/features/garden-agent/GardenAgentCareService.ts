import { buildCareRecommendationContext } from './GardenAgentCareContextBuilder';
import { gardenAgentApiClient } from './GardenAgentApiClient';
import { gardenAgentDiagnosticsService, requestFailedDiagnostics } from './GardenAgentDiagnostics';
import { CareRecommendationOutput } from './types';
import { AiConversationMessageRecord, PlantDetailRecord } from '../garden-records/models/GardenRecordTypes';

export class GardenAgentCareService {
  async requestCareRecommendations({
    detail,
    recentMessages,
    requestId,
  }: {
    detail: PlantDetailRecord;
    recentMessages?: AiConversationMessageRecord[];
    requestId?: string;
  }): Promise<{ runId: string; output: CareRecommendationOutput } | { diagnostics: ReturnType<typeof requestFailedDiagnostics> }> {
    const health = await gardenAgentDiagnosticsService.checkHealth();
    if (!health.apiReachable || health.agentConfigured === false) return { diagnostics: health };
    const request = {
      requestId: requestId ?? `care-rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      plantId: detail.plant.id,
      occurredAt: new Date().toISOString(),
      context: buildCareRecommendationContext(detail, recentMessages ?? detail.messages ?? []),
    };
    const response = await gardenAgentApiClient.submitCareRecommendations(request);
    if (response && 'diagnostics' in response) return response;
    if (response?.status === 'succeeded' && response.output) return { runId: response.runId, output: response.output };
    return { diagnostics: requestFailedDiagnostics() };
  }
}

export const gardenAgentCareService = new GardenAgentCareService();
