import { buildPlantChatContext } from './GardenAgentChatContextBuilder';
import { gardenAgentApiClient } from './GardenAgentApiClient';
import { gardenAgentDiagnosticsService, requestFailedDiagnostics } from './GardenAgentDiagnostics';
import { PlantChatOutput } from './types';
import { AiConversationMessageRecord, PlantDetailRecord } from '../garden-records/models/GardenRecordTypes';

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class GardenAgentChatService {
  async askPlantQuestion({
    detail,
    question,
    recentMessages,
    messageId,
  }: {
    detail: PlantDetailRecord;
    question: string;
    recentMessages: AiConversationMessageRecord[];
    messageId?: string;
  }): Promise<{ runId: string; output: PlantChatOutput } | { diagnostics: ReturnType<typeof requestFailedDiagnostics> }> {
    const health = await gardenAgentDiagnosticsService.checkHealth();
    if (!health.apiReachable || health.agentConfigured === false) return { diagnostics: health };
    const request = {
      messageId: messageId ?? createId('message'),
      conversationId: detail.conversation.id,
      plantId: detail.plant.id,
      occurredAt: new Date().toISOString(),
      question,
      context: buildPlantChatContext(detail, recentMessages),
    };
    const response = await gardenAgentApiClient.submitPlantChat(request);
    if (response && 'diagnostics' in response) return response;
    if (response?.status === 'succeeded' && response.output) return { runId: response.runId, output: response.output };
    return { diagnostics: requestFailedDiagnostics() };
  }
}

export const gardenAgentChatService = new GardenAgentChatService();
