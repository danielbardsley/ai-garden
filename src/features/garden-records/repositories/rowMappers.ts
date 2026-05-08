import {
  AiConversationRecord,
  CareEventRecord,
  CareRecommendationRecord,
  ObservationRecord,
  PhotoRecord,
  PlantRecord,
  PlantStatusKind,
} from '../models/GardenRecordTypes';

type PlantRow = {
  id: string;
  display_name: string;
  common_name?: string | null;
  scientific_name?: string | null;
  variety_name?: string | null;
  description?: string | null;
  status_kind: PlantStatusKind;
  status_label?: string | null;
  next_action_label?: string | null;
  location_id?: string | null;
  location_name?: string | null;
  planted_date?: string | null;
  started_year?: number | null;
  archived_at?: string | null;
  cover_photo_id?: string | null;
  glyph?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  sort_order?: number | null;
};

export function mapPlant(row: PlantRow): PlantRecord {
  return {
    id: row.id,
    displayName: row.display_name,
    commonName: row.common_name,
    scientificName: row.scientific_name,
    varietyName: row.variety_name,
    description: row.description,
    statusKind: row.status_kind,
    statusLabel: row.status_label,
    nextActionLabel: row.next_action_label,
    locationId: row.location_id,
    locationName: row.location_name,
    plantedDate: row.planted_date,
    startedYear: row.started_year,
    archivedAt: row.archived_at,
    coverPhotoId: row.cover_photo_id,
    glyph: row.glyph,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    sortOrder: row.sort_order,
  };
}

type ObservationRow = {
  id: string;
  plant_id?: string | null;
  season_id?: string | null;
  location_id?: string | null;
  observed_on: string;
  observed_at?: string | null;
  title?: string | null;
  note?: string | null;
  kind: ObservationRecord['kind'];
  mood?: string | null;
  height_value?: number | null;
  height_unit?: string | null;
};

export function mapObservation(row: ObservationRow): ObservationRecord {
  return {
    id: row.id,
    plantId: row.plant_id,
    seasonId: row.season_id,
    locationId: row.location_id,
    observedOn: row.observed_on,
    observedAt: row.observed_at,
    title: row.title,
    note: row.note,
    kind: row.kind,
    mood: row.mood,
    heightValue: row.height_value,
    heightUnit: row.height_unit,
  };
}

type PhotoRow = {
  id: string;
  observation_id?: string | null;
  plant_id?: string | null;
  plant_glyph?: string | null;
  location_id?: string | null;
  local_uri: string;
  thumbnail_uri?: string | null;
  mime_type?: string | null;
  width?: number | null;
  height?: number | null;
  taken_at?: string | null;
  captured_on?: string | null;
  source: PhotoRecord['source'];
  is_cover_candidate: number;
  tone?: string | null;
  note?: string | null;
};

export function mapPhoto(row: PhotoRow): PhotoRecord {
  return {
    id: row.id,
    observationId: row.observation_id,
    plantId: row.plant_id,
    plantGlyph: row.plant_glyph,
    locationId: row.location_id,
    localUri: row.local_uri,
    thumbnailUri: row.thumbnail_uri,
    mimeType: row.mime_type,
    width: row.width,
    height: row.height,
    takenAt: row.taken_at,
    capturedOn: row.captured_on,
    source: row.source,
    isCoverCandidate: row.is_cover_candidate === 1,
    tone: row.tone,
    note: row.note,
  };
}

type CareEventRow = {
  id: string;
  plant_id: string;
  observation_id?: string | null;
  event_type: string;
  event_date: string;
  note?: string | null;
  source: CareEventRecord['source'];
};

export function mapCareEvent(row: CareEventRow): CareEventRecord {
  return {
    id: row.id,
    plantId: row.plant_id,
    observationId: row.observation_id,
    eventType: row.event_type,
    eventDate: row.event_date,
    note: row.note,
    source: row.source,
  };
}

type CareRecommendationRow = {
  id: string;
  plant_id?: string | null;
  observation_id?: string | null;
  recommendation_type: string;
  title: string;
  body?: string | null;
  due_on?: string | null;
  status: CareRecommendationRecord['status'];
  source: CareRecommendationRecord['source'];
};

export function mapCareRecommendation(row: CareRecommendationRow): CareRecommendationRecord {
  return {
    id: row.id,
    plantId: row.plant_id,
    observationId: row.observation_id,
    recommendationType: row.recommendation_type,
    title: row.title,
    body: row.body,
    dueOn: row.due_on,
    status: row.status,
    source: row.source,
  };
}

type ConversationRow = {
  id: string;
  plant_id?: string | null;
  title?: string | null;
  scope: AiConversationRecord['scope'];
};

export function mapConversation(row: ConversationRow): AiConversationRecord {
  return {
    id: row.id,
    plantId: row.plant_id,
    title: row.title,
    scope: row.scope,
  };
}
