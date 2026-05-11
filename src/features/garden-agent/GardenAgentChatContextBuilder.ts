import { AiConversationMessageRecord, PlantDetailRecord } from '../garden-records/models/GardenRecordTypes';

const LIMITS = {
  observations: 10,
  photos: 10,
  insights: 8,
  care: 10,
  messages: 8,
};

export function buildPlantChatContext(detail: PlantDetailRecord, recentMessages: AiConversationMessageRecord[] = []) {
  const { plant } = detail;
  return {
    careProfile: detail.careProfile ? {
      lightPreference: detail.careProfile.lightPreference ?? null,
      wateringRhythm: detail.careProfile.wateringRhythm ?? null,
      soilMoisturePreference: detail.careProfile.soilMoisturePreference ?? null,
      fertilizerCadence: detail.careProfile.fertilizerCadence ?? null,
      pruningNotes: detail.careProfile.pruningNotes ?? null,
      harvestNotes: detail.careProfile.harvestNotes ?? null,
      locationNotes: detail.careProfile.locationNotes ?? null,
      generalNotes: detail.careProfile.generalNotes ?? null,
    } : null,
    plant: {
      id: plant.id,
      displayName: plant.displayName,
      commonName: plant.commonName ?? null,
      scientificName: plant.scientificName ?? null,
      varietyName: plant.varietyName ?? null,
      description: plant.description ?? null,
      statusKind: plant.statusKind,
      statusLabel: plant.statusLabel ?? null,
      nextActionLabel: plant.nextActionLabel ?? null,
      locationName: plant.locationName ?? null,
      plantedDate: plant.plantedDate ?? null,
      startedYear: plant.startedYear ?? null,
    },
    recentObservations: detail.observations.slice(0, LIMITS.observations).map((observation) => ({
      id: observation.id,
      observedOn: observation.observedOn,
      observedAt: observation.observedAt ?? null,
      kind: observation.kind,
      title: observation.title ?? null,
      note: observation.note ?? null,
      mood: observation.mood ?? null,
    })),
    recentPhotos: detail.photos.slice(0, LIMITS.photos).map((photo) => ({
      id: photo.id,
      observationId: photo.observationId ?? null,
      capturedOn: photo.capturedOn ?? null,
      takenAt: photo.takenAt ?? null,
      mimeType: photo.mimeType ?? null,
      width: photo.width ?? null,
      height: photo.height ?? null,
      source: photo.source,
      note: photo.note ?? null,
      localOnly: true,
    })),
    recentAiInsights: detail.aiInsights.slice(0, LIMITS.insights).map((insight) => ({
      id: insight.id,
      scope: insight.scope,
      kind: insight.kind,
      title: insight.title ?? null,
      body: insight.body,
      confidence: insight.confidence ?? null,
      sourceRunId: insight.sourceRunId ?? null,
    })),
    careEvents: detail.careEvents.slice(0, LIMITS.care).map((event) => ({
      id: event.id,
      eventType: event.eventType,
      eventDate: event.eventDate,
      note: event.note ?? null,
      source: event.source,
    })),
    careRecommendations: detail.careRecommendations.slice(0, LIMITS.care).map((recommendation) => ({
      id: recommendation.id,
      recommendationType: recommendation.recommendationType,
      title: recommendation.title,
      body: recommendation.body ?? null,
      dueOn: recommendation.dueOn ?? null,
      status: recommendation.status,
      source: recommendation.source,
    })),
    conversationSummary: null,
    recentMessages: recentMessages.slice(-LIMITS.messages).map((message) => ({
      id: message.id,
      role: message.role,
      body: message.body,
      status: message.status,
      createdAt: message.createdAt,
    })),
    app: { schemaVersion: 1, feature: 'plant-detail-ask-ai' },
  };
}
