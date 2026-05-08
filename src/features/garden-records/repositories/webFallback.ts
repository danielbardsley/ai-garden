import { plants } from '../../garden-design/data';
import {
  AiConversationRecord,
  CareEventRecord,
  CareRecommendationRecord,
  ObservationRecord,
  PhotoRecord,
  PlantDetailRecord,
  PlantRecord,
} from '../models/GardenRecordTypes';

export function webPlants(): PlantRecord[] {
  return plants.map((plant, index) => ({
    id: plant.id,
    displayName: plant.name,
    commonName: plant.common,
    scientificName: plant.variety,
    varietyName: plant.variety,
    description: plant.summary,
    statusKind: plant.status.kind,
    statusLabel: plant.status.label,
    nextActionLabel: plant.status.next,
    locationId: `location-${plant.location.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    locationName: plant.location,
    plantedDate: plant.plantedAt,
    startedYear: plant.yearStarted,
    archivedAt: null,
    coverPhotoId: `${plant.id}-${plant.photos[0]?.d ?? 'cover'}-photo`,
    glyph: plant.glyph,
    primaryColor: plant.swatch[0],
    secondaryColor: plant.swatch[1] ?? plant.swatch[0],
    sortOrder: index,
  }));
}

export function webAttentionPlants(): PlantRecord[] {
  return webPlants().filter((plant) => plant.statusKind === 'warn' || /today|tomorrow/i.test(plant.nextActionLabel ?? ''));
}

export function webPhotos(filter?: { plantId?: string }): PhotoRecord[] {
  const all = plants.flatMap((plant) => plant.photos.map((photo) => ({
    id: `${plant.id}-${photo.d}-photo`,
    observationId: `${plant.id}-${photo.d}-observation`,
    plantId: plant.id,
    plantGlyph: plant.glyph,
    locationId: `location-${plant.location.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    localUri: `placeholder://${plant.id}-${photo.d}-photo`,
    thumbnailUri: null,
    mimeType: 'image/placeholder',
    width: null,
    height: null,
    takenAt: `${photo.d}T12:00:00.000Z`,
    capturedOn: photo.d,
    source: 'generated_placeholder' as const,
    isCoverCandidate: photo.d === plant.photos[0].d,
    tone: photo.tone,
    note: photo.note,
  }))).sort((a, b) => (b.capturedOn ?? '').localeCompare(a.capturedOn ?? ''));
  return filter?.plantId ? all.filter((photo) => photo.plantId === filter.plantId) : all;
}

export function webPlantDetail(id: string): PlantDetailRecord | null {
  const plant = webPlants().find((item) => item.id === id);
  if (!plant) return null;
  const original = plants.find((item) => item.id === id);
  if (!original) return null;
  const photos = webPhotos({ plantId: id });
  const observations: ObservationRecord[] = original.photos.map((photo) => ({
    id: `${id}-${photo.d}-observation`,
    plantId: id,
    seasonId: 'season-2026',
    locationId: plant.locationId,
    observedOn: photo.d,
    observedAt: `${photo.d}T12:00:00.000Z`,
    title: null,
    note: photo.note,
    kind: 'photo',
    mood: plant.statusKind === 'warn' ? 'watch' : 'good',
    heightValue: null,
    heightUnit: null,
  }));
  const careEvents: CareEventRecord[] = original.care.map((note, index) => ({
    id: `care-${id}-${index + 1}`,
    plantId: id,
    observationId: null,
    eventType: 'other',
    eventDate: '2026-05-07',
    note,
    source: 'system',
  }));
  const careRecommendations: CareRecommendationRecord[] = plant.nextActionLabel && plant.nextActionLabel !== 'No action' ? [{
    id: `recommendation-${id}`,
    plantId: id,
    observationId: null,
    recommendationType: 'other',
    title: plant.nextActionLabel,
    body: `${plant.nextActionLabel} · ${plant.commonName}`,
    dueOn: plant.nextActionLabel.toLowerCase().includes('tomorrow') ? '2026-05-08' : '2026-05-07',
    status: 'suggested',
    source: 'system',
  }] : [];
  const conversation: AiConversationRecord = {
    id: `conversation-${id}`,
    plantId: id,
    title: `${plant.displayName} care chat`,
    scope: 'plant',
  };
  return { plant, observations, photos, careEvents, careRecommendations, conversation };
}
