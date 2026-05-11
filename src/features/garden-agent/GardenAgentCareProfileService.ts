import { buildCareProfileDraftContext } from './GardenAgentCareProfileContextBuilder';
import { gardenAgentApiClient } from './GardenAgentApiClient';
import { gardenAgentDiagnosticsService, requestFailedDiagnostics } from './GardenAgentDiagnostics';
import { CareProfileDraftOutput } from './types';
import { AiConversationMessageRecord, PlantDetailRecord } from '../garden-records/models/GardenRecordTypes';

export class GardenAgentCareProfileService {
  async requestCareProfileDraft({
    detail,
    recentMessages,
    requestId,
  }: {
    detail: PlantDetailRecord;
    recentMessages?: AiConversationMessageRecord[];
    requestId?: string;
  }): Promise<{ runId: string; output: CareProfileDraftOutput } | { diagnostics: ReturnType<typeof requestFailedDiagnostics> }> {
    const health = await gardenAgentDiagnosticsService.checkHealth();
    if (!health.apiReachable || health.agentConfigured === false) return { diagnostics: health };
    const request = {
      requestId: requestId ?? `care-profile-draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      plantId: detail.plant.id,
      occurredAt: new Date().toISOString(),
      context: buildCareProfileDraftContext(detail, recentMessages ?? detail.messages ?? []),
    };
    const response = await gardenAgentApiClient.submitCareProfileDraft(request);
    if (response && 'diagnostics' in response) return response;
    if (response?.status === 'succeeded' && response.output) return { runId: response.runId, output: response.output };
    return { diagnostics: requestFailedDiagnostics() };
  }
}

export const gardenAgentCareProfileService = new GardenAgentCareProfileService();
