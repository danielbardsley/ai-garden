export type PlantStatusKind = 'good' | 'warn' | 'idle' | 'archived';
export type ObservationKind = 'photo' | 'note' | 'care' | 'harvest' | 'issue' | 'milestone' | 'ai_identification' | 'other';
export type PhotoSource = 'camera' | 'library' | 'import' | 'generated_placeholder';

export type LocationRecord = {
  id: string;
  name: string;
  kind?: string | null;
  description?: string | null;
  sunExposure?: string | null;
  sortOrder?: number | null;
};

export type PlantRecord = {
  id: string;
  displayName: string;
  commonName?: string | null;
  scientificName?: string | null;
  varietyName?: string | null;
  description?: string | null;
  statusKind: PlantStatusKind;
  statusLabel?: string | null;
  nextActionLabel?: string | null;
  locationId?: string | null;
  locationName?: string | null;
  plantedDate?: string | null;
  startedYear?: number | null;
  archivedAt?: string | null;
  coverPhotoId?: string | null;
  glyph?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  sortOrder?: number | null;
};

export type ObservationRecord = {
  id: string;
  plantId?: string | null;
  seasonId?: string | null;
  locationId?: string | null;
  observedOn: string;
  observedAt?: string | null;
  title?: string | null;
  note?: string | null;
  kind: ObservationKind;
  mood?: string | null;
  heightValue?: number | null;
  heightUnit?: string | null;
};

export type PhotoRecord = {
  id: string;
  observationId?: string | null;
  plantId?: string | null;
  plantGlyph?: string | null;
  locationId?: string | null;
  localUri: string;
  thumbnailUri?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  takenAt?: string | null;
  capturedOn?: string | null;
  source: PhotoSource;
  isCoverCandidate: boolean;
  tone?: string | null;
  note?: string | null;
};

export type PhotoTagRecord = {
  id: string;
  photoId: string;
  tag: string;
  source: 'manual' | 'ai' | 'system';
  confidence?: number | null;
};


export type CareProfileRecord = {
  id: string;
  plantId: string;
  lightPreference?: string | null;
  wateringRhythm?: string | null;
  soilMoisturePreference?: string | null;
  fertilizerCadence?: string | null;
  pruningNotes?: string | null;
  harvestNotes?: string | null;
  locationNotes?: string | null;
  generalNotes?: string | null;
  source: 'manual' | 'ai_assisted' | 'system';
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CareEventRecord = {
  id: string;
  plantId: string;
  observationId?: string | null;
  eventType: string;
  eventDate: string;
  note?: string | null;
  source: 'manual' | 'ai_suggested' | 'system';
};

export type CareRecommendationRecord = {
  id: string;
  plantId?: string | null;
  observationId?: string | null;
  recommendationType: string;
  title: string;
  body?: string | null;
  dueOn?: string | null;
  status: 'suggested' | 'accepted' | 'dismissed' | 'completed';
  source: 'manual' | 'ai' | 'system';
};


export type AiInsightRecord = {
  id: string;
  plantId?: string | null;
  photoId?: string | null;
  observationId?: string | null;
  scope: 'plant' | 'photo' | 'garden' | 'care';
  kind: 'summary' | 'attention' | 'care_note' | 'daily_brief' | 'tagging' | 'risk';
  title?: string | null;
  body: string;
  status: 'draft' | 'active' | 'dismissed' | 'archived';
  confidence?: number | null;
  sourceRunId?: string | null;
};


export type AiConversationMessageRecord = {
  id: string;
  conversationId: string;
  plantId?: string | null;
  role: 'user' | 'assistant' | 'system';
  body: string;
  status: 'pending' | 'sent' | 'failed';
  sourceRunId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type AiConversationRecord = {
  id: string;
  plantId?: string | null;
  title?: string | null;
  scope: 'plant' | 'garden' | 'photo';
};

export type PlantDetailRecord = {
  plant: PlantRecord;
  observations: ObservationRecord[];
  photos: PhotoRecord[];
  careEvents: CareEventRecord[];
  careRecommendations: CareRecommendationRecord[];
  careProfile?: CareProfileRecord | null;
  aiInsights: AiInsightRecord[];
  conversation: AiConversationRecord;
  messages?: AiConversationMessageRecord[];
};
