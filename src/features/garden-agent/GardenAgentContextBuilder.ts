import { Platform } from 'react-native';

import { ObservationRecord, PhotoRecord, PlantRecord } from '../garden-records/models/GardenRecordTypes';

export function buildPhotoCapturedContext({
  plant,
  photo,
  observation,
}: {
  plant: PlantRecord;
  photo: PhotoRecord;
  observation: ObservationRecord;
}) {
  return {
    plant: plantContext(plant),
    observation: {
      id: observation.id,
      observedOn: observation.observedOn,
      observedAt: observation.observedAt,
      note: observation.note,
      kind: observation.kind,
      mood: observation.mood,
    },
    photo: {
      id: photo.id,
      observationId: photo.observationId,
      plantId: photo.plantId,
      locationId: photo.locationId,
      width: photo.width,
      height: photo.height,
      mimeType: photo.mimeType,
      capturedOn: photo.capturedOn,
      takenAt: photo.takenAt,
      source: photo.source,
      localOnly: true,
    },
  };
}

export function buildPhotoIdentificationContext(plants: PlantRecord[]) {
  return {
    plants: plants.map((plant) => ({
      ...plantContext(plant),
      visualHints: [plant.glyph, plant.primaryColor, plant.secondaryColor].filter(Boolean) as string[],
      recentTags: [],
      recentObservationNotes: [],
    })),
    app: {
      platform: Platform.OS,
      schemaVersion: 3,
    },
  };
}

function plantContext(plant: PlantRecord) {
  return {
    id: plant.id,
    displayName: plant.displayName,
    commonName: plant.commonName,
    varietyName: plant.varietyName,
    statusKind: plant.statusKind,
    statusLabel: plant.statusLabel,
    nextActionLabel: plant.nextActionLabel,
    locationId: plant.locationId,
    locationName: plant.locationName,
    plantedDate: plant.plantedDate,
    startedYear: plant.startedYear,
  };
}
