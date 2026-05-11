import { gardenAgentApiClient } from './GardenAgentApiClient';
import { gardenAgentDiagnosticsService, requestFailedDiagnostics } from './GardenAgentDiagnostics';
import { buildPhotoCapturedContext, buildPhotoIdentificationContext } from './GardenAgentContextBuilder';
import { GardenAgentCaptureOutput, GardenAgentPhotoIdentificationOutput, PhotoIdentificationRequest } from './types';
import { aiInsightRepository } from '../garden-records/repositories/AiInsightRepository';
import { ObservationRecord, PhotoRecord, PlantRecord } from '../garden-records/models/GardenRecordTypes';
import { photoRepository } from '../garden-records/repositories/PhotoRepository';


function localDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class GardenAgentService {

  async identifyCapturedPhoto({
    localUri,
    width,
    height,
    mimeType,
    launchedFromPlantId,
    plants,
  }: {
    localUri: string;
    width?: number | null;
    height?: number | null;
    mimeType?: string | null;
    launchedFromPlantId?: string | null;
    plants: PlantRecord[];
  }) {
    const now = new Date();
    const event: PhotoIdentificationRequest = {
      eventId: createId('identify'),
      eventType: 'photo.identification_requested',
      occurredAt: now.toISOString(),
      launchedFromPlantId: launchedFromPlantId ?? null,
      capture: {
        width,
        height,
        mimeType: mimeType ?? 'image/jpeg',
        capturedOn: localDateString(now),
      },
      context: buildPhotoIdentificationContext(plants),
    };
    const health = await gardenAgentDiagnosticsService.checkHealth();
    if (!health.apiReachable || health.agentConfigured === false) return { diagnostics: health };
    const response = await gardenAgentApiClient.identifyPhoto(event, localUri, mimeType ?? 'image/jpeg');
    if (response && 'diagnostics' in response) return response;
    if (response?.status === 'succeeded' && response.output) return { runId: response.runId, output: response.output };
    return { diagnostics: requestFailedDiagnostics() };
  }

  async submitPhotoCaptured({ plant, photo, observation }: { plant: PlantRecord; photo: PhotoRecord; observation: ObservationRecord }) {
    const event = {
      eventId: createId('event'),
      eventType: 'photo.captured' as const,
      entityType: 'photo' as const,
      entityId: photo.id,
      plantId: plant.id,
      occurredAt: new Date().toISOString(),
      context: buildPhotoCapturedContext({ plant, photo, observation }),
    };
    const response = await gardenAgentApiClient.submitPhotoCategorization(event, photo.localUri, photo.mimeType);
    if (response?.status === 'succeeded' && response.output) {
      await this.persistCaptureOutput({ plant, photo, observation, runId: response.runId, output: response.output });
    }
    return response;
  }

  submitPhotoCapturedBestEffort(input: { plant: PlantRecord; photo: PhotoRecord; observation: ObservationRecord }) {
    void this.submitPhotoCaptured(input).catch(() => undefined);
  }

  private async persistCaptureOutput({
    plant,
    photo,
    observation,
    runId,
    output,
  }: {
    plant: PlantRecord;
    photo: PhotoRecord;
    observation: ObservationRecord;
    runId: string;
    output: GardenAgentCaptureOutput | GardenAgentPhotoIdentificationOutput;
  }) {
    const tags = output.tags ?? [];
    if (tags.length > 0) await photoRepository.createAiTags(photo.id, tags);
    const insight = output.insight;
    const body = insight?.body || output.summary;
    if (!body) return;
    await aiInsightRepository.createInsight({
      id: createId('insight'),
      plantId: plant.id,
      photoId: photo.id,
      observationId: observation.id,
      scope: 'photo',
      kind: insight?.kind ?? 'summary',
      title: insight?.title ?? output.category?.label?.replace(/_/g, ' ') ?? 'AI note',
      body,
      confidence: insight?.confidence ?? output.confidence ?? null,
      sourceRunId: runId,
    });
  }
}

export const gardenAgentService = new GardenAgentService();
