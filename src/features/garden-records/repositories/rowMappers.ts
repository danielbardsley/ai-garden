import {
  AiConversationMessageRecord,
  AiConversationRecord,
  AiInsightRecord,
  CareEventRecord,
  CareProfileRecord,
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


type AiInsightRow = {
  id: string;
  plant_id?: string | null;
  photo_id?: string | null;
  observation_id?: string | null;
  scope: AiInsightRecord['scope'];
  kind: AiInsightRecord['kind'];
  title?: string | null;
  body: string;
  status: AiInsightRecord['status'];
  confidence?: number | null;
  source_run_id?: string | null;
};

export function mapAiInsight(row: AiInsightRow): AiInsightRecord {
  return {
    id: row.id,
    plantId: row.plant_id,
    photoId: row.photo_id,
    observationId: row.observation_id,
    scope: row.scope,
    kind: row.kind,
    title: row.title,
    body: row.body,
    status: row.status,
    confidence: row.confidence,
    sourceRunId: row.source_run_id,
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


type ConversationMessageRow = {
  id: string;
  conversation_id: string;
  plant_id?: string | null;
  role: AiConversationMessageRecord['role'];
  body: string;
  status?: AiConversationMessageRecord['status'] | null;
  source_run_id?: string | null;
  metadata_json?: string | null;
  created_at: string;
};

export function mapConversationMessage(row: ConversationMessageRow): AiConversationMessageRecord {
  let metadata: Record<string, unknown> | null = null;
  if (row.metadata_json) {
    try { metadata = JSON.parse(row.metadata_json) as Record<string, unknown>; } catch { metadata = null; }
  }
  return {
    id: row.id,
    conversationId: row.conversation_id,
    plantId: row.plant_id,
    role: row.role,
    body: row.body,
    status: row.status ?? 'sent',
    sourceRunId: row.source_run_id,
    metadata,
    createdAt: row.created_at,
  };
}


type CareProfileRow = {
  id: string;
  plant_id: string;
  light_preference?: string | null;
  watering_rhythm?: string | null;
  soil_moisture_preference?: string | null;
  fertilizer_cadence?: string | null;
  pruning_notes?: string | null;
  harvest_notes?: string | null;
  location_notes?: string | null;
  general_notes?: string | null;
  source: CareProfileRecord['source'];
  created_at?: string | null;
  updated_at?: string | null;
};

export function mapCareProfile(row: CareProfileRow): CareProfileRecord {
  return {
    id: row.id,
    plantId: row.plant_id,
    lightPreference: row.light_preference,
    wateringRhythm: row.watering_rhythm,
    soilMoisturePreference: row.soil_moisture_preference,
    fertilizerCadence: row.fertilizer_cadence,
    pruningNotes: row.pruning_notes,
    harvestNotes: row.harvest_notes,
    locationNotes: row.location_notes,
    generalNotes: row.general_notes,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
