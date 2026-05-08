import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

import { PhotoRecord, PlantRecord } from '../models/GardenRecordTypes';
import { observationRepository } from '../repositories/ObservationRepository';
import { photoRepository } from '../repositories/PhotoRepository';
import { plantRepository } from '../repositories/PlantRepository';

export type SaveCapturedPhotoInput = {
  plantId: string;
  localUri: string;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  note?: string | null;
};

export type SaveCapturedPhotoResult = {
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

    const plant = await plantRepository.getPlantById(input.plantId);
    if (!plant) throw new Error('Choose a plant before saving this photo.');

    const now = new Date();
    const observedOn = localDateString(now);
    const observedAt = now.toISOString();
    const observationId = createId('observation');
    const photoId = createId('photo');
    const durableUri = await this.persistCaptureUri(input.localUri, photoId);

    await observationRepository.createPhotoObservation({
      id: observationId,
      plantId: plant.id,
      seasonId: 'season-2026',
      locationId: plant.locationId,
      observedOn,
      observedAt,
      note: input.note ?? `New ${plant.commonName ?? 'plant'} photo captured from camera.`,
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

    return { photo };
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
