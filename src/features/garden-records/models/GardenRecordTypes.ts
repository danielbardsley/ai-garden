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
  conversation: AiConversationRecord;
};
