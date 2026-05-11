import { AiConversationMessageRecord, PlantDetailRecord } from '../garden-records/models/GardenRecordTypes';
import { buildCareRecommendationContext } from './GardenAgentCareContextBuilder';

export function buildCareProfileDraftContext(detail: PlantDetailRecord, recentMessages: AiConversationMessageRecord[] = []) {
  return {
    ...buildCareRecommendationContext(detail, recentMessages),
    app: { schemaVersion: 1, feature: 'ai-care-profile-generation' },
  };
}
