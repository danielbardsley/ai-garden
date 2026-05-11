import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

import { ObservationRecord, PhotoRecord, PlantRecord } from '../models/GardenRecordTypes';
import { GardenAgentPhotoIdentificationOutput } from '../../garden-agent/types';
import { observationRepository } from '../repositories/ObservationRepository';
import { photoRepository } from '../repositories/PhotoRepository';
import { photoPlantMatchRepository, PhotoPlantMatchSource } from '../repositories/PhotoPlantMatchRepository';
import { aiInsightRepository } from '../repositories/AiInsightRepository';
import { plantRepository } from '../repositories/PlantRepository';

export type SaveCapturedPhotoInput = {
  plantId?: string | null;
  addNewPlant?: boolean;
  localUri: string;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  note?: string | null;
  aiAnalysis?: { runId: string; output: GardenAgentPhotoIdentificationOutput } | null;
  suggestedPlantId?: string | null;
  matchSource?: PhotoPlantMatchSource;
};

export type SaveCapturedPhotoResult = {
  observation: ObservationRecord;
  photo: PhotoRecord;
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function localDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export class CameraCaptureService {
  async saveCapturedPhoto(input: SaveCapturedPhotoInput): Promise<SaveCapturedPhotoResult> {
    if (Platform.OS === 'web') {
      throw new Error('Photo capture storage is available on device only.');
    }

    const plant = input.addNewPlant
      ? await this.createPlantFromAnalysis(input.aiAnalysis)
      : input.plantId
        ? await plantRepository.getPlantById(input.plantId)
        : null;
    if (!plant) throw new Error('Choose a plant before saving this photo.');

    const now = new Date();
    const observedOn = localDateString(now);
    const observedAt = now.toISOString();
    const observationId = createId('observation');
    const photoId = createId('photo');
    const durableUri = await this.persistCaptureUri(input.localUri, photoId);

    const observation = await observationRepository.createPhotoObservation({
      id: observationId,
      plantId: plant.id,
      seasonId: null,
      locationId: plant.locationId,
      observedOn,
      observedAt,
      note: input.note ?? `${plant.commonName ?? plant.displayName} photo captured from camera.`,
      mood: plant.statusKind === 'warn' ? 'watch' : 'good',
    });

    const photo = await photoRepository.createCapturedPhoto({
      id: photoId,
      observationId,
      plantId: plant.id,
      locationId: plant.locationId,
      localUri: durableUri,
      mimeType: input.mimeType ?? 'image/jpeg',
      width: input.width,
      height: input.height,
      takenAt: observedAt,
      capturedOn: observedOn,
      tone: plant.primaryColor,
    });

    await photoRepository.createSystemTags(photo.id, this.systemTagsForPlant(plant));
    await this.persistAiAnalysis({
      plant,
      photo,
      observation,
      aiAnalysis: input.aiAnalysis,
      suggestedPlantId: input.suggestedPlantId,
      matchSource: input.matchSource ?? (input.aiAnalysis ? 'ai_confirmed' : 'manual_fallback'),
    });

    return { observation, photo };
  }


  private async createPlantFromAnalysis(aiAnalysis?: { runId: string; output: GardenAgentPhotoIdentificationOutput } | null) {
    const rawName = aiAnalysis?.output.visualCommonName?.trim() || this.extractPlantName(aiAnalysis?.output.openIdentification) || this.extractPlantName(aiAnalysis?.output.summary) || 'New plant';
    const displayName = this.toDisplayName(rawName.replace(/^a\s+/i, '').replace(/^an\s+/i, ''));
    return plantRepository.createPlant({
      id: createId('plant'),
      displayName,
      commonName: displayName,
      description: aiAnalysis?.output.summary ?? `Added from camera identification: ${displayName}.`,
      glyph: 'leaf',
      primaryColor: '#9bbf78',
      secondaryColor: '#6f8f54',
    });
  }

  private extractPlantName(value?: string | null) {
    if (!value) return null;
    const cleaned = value
      .replace(/^the\s+plant\s+(?:appears|looks|seems)\s+(?:most\s+)?(?:like|to\s+be)\s+/i, '')
      .replace(/^this\s+(?:appears|looks|seems)\s+(?:most\s+)?(?:like|to\s+be)\s+/i, '')
      .replace(/^it\s+(?:appears|looks|seems)\s+(?:most\s+)?(?:like|to\s+be)\s+/i, '')
      .replace(/^a\s+photo\s+of\s+/i, '')
      .replace(/^an?\s+/i, '')
      .split(/[.;:,()]/)[0]
      ?.trim();
    if (!cleaned) return null;
    return cleaned.split(/\s+/).slice(0, 4).join(' ');
  }


  private toDisplayName(value: string) {
    const cleaned = value.replace(/\s+/g, ' ').trim();
    if (!cleaned) return 'New plant';
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }


  private async persistAiAnalysis({
    plant,
    photo,
    observation,
    aiAnalysis,
    suggestedPlantId,
    matchSource,
  }: {
    plant: PlantRecord;
    photo: PhotoRecord;
    observation: ObservationRecord;
    aiAnalysis?: { runId: string; output: GardenAgentPhotoIdentificationOutput } | null;
    suggestedPlantId?: string | null;
    matchSource: PhotoPlantMatchSource;
  }) {
    const topMatch = aiAnalysis?.output.plantMatches?.[0];
    await photoPlantMatchRepository.createMatch({
      id: createId('plant-match'),
      photoId: photo.id,
      observationId: observation.id,
      confirmedPlantId: plant.id,
      suggestedPlantId: suggestedPlantId ?? topMatch?.plantId ?? null,
      sourceRunId: aiAnalysis?.runId ?? null,
      matchSource,
      confidence: topMatch?.confidence ?? aiAnalysis?.output.confidence ?? null,
      rationale: topMatch?.rationale ?? null,
    });

    if (!aiAnalysis?.output) return;
    const tags = aiAnalysis.output.tags ?? [];
    if (tags.length > 0) await photoRepository.createAiTags(photo.id, tags);
    const insight = aiAnalysis.output.insight;
    const body = insight?.body || aiAnalysis.output.summary;
    if (body) {
      await aiInsightRepository.createInsight({
        id: createId('insight'),
        plantId: plant.id,
        photoId: photo.id,
        observationId: observation.id,
        scope: 'photo',
        kind: insight?.kind ?? 'summary',
        title: insight?.title ?? aiAnalysis.output.category?.label?.replace(/_/g, ' ') ?? 'AI note',
        body,
        confidence: insight?.confidence ?? aiAnalysis.output.confidence ?? null,
        sourceRunId: aiAnalysis.runId,
      });
    }
  }

  private async persistCaptureUri(uri: string, photoId: string) {
    if (!FileSystem.documentDirectory) return uri;
    const directory = `${FileSystem.documentDirectory}garden-photos/`;
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    const target = `${directory}${photoId}.jpg`;
    await FileSystem.copyAsync({ from: uri, to: target });
    return target;
  }

  private systemTagsForPlant(plant: PlantRecord) {
    const keyword = plant.commonName?.toLowerCase().split(' ')[0] ?? 'plant';
    return ['camera', keyword, 'garden journal'];
  }
}

export const cameraCaptureService = new CameraCaptureService();
