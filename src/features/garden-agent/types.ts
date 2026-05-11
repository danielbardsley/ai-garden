import { GardenAgentDiagnostics } from './GardenAgentDiagnostics';

export type GardenAgentContext = Record<string, unknown>;

export type GardenAgentEventRequest = {
  eventId: string;
  eventType: 'photo.captured' | 'photo.identification_requested' | 'plant.detail_viewed' | 'garden.daily_brief_requested';
  entityType?: 'photo' | 'plant' | 'garden' | 'observation';
  entityId?: string;
  plantId?: string;
  occurredAt?: string;
  context: GardenAgentContext;
};

export type GardenAgentTagOutput = {
  label: string;
  confidence?: number | null;
};

export type GardenAgentInsightOutput = {
  title?: string | null;
  body: string;
  kind?: 'summary' | 'attention' | 'care_note' | 'daily_brief' | 'tagging' | 'risk';
  confidence?: number | null;
};

export type GardenAgentCaptureOutput = {
  summary: string;
  tags?: GardenAgentTagOutput[];
  category?: { label: string; confidence?: number | null };
  insight?: GardenAgentInsightOutput | null;
  confidence?: number | null;
};

export type GardenAgentEventResponse = {
  runId: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'skipped';
  providerConfigured: boolean;
  output?: GardenAgentCaptureOutput | null;
};

export type GardenAgentDiagnosticResponse = {
  diagnostics: GardenAgentDiagnostics;
};


export type GardenAgentPlantMatch = {
  plantId: string;
  displayName: string;
  commonName?: string | null;
  varietyName?: string | null;
  confidence: number;
  rationale?: string | null;
};

export type GardenAgentPhotoIdentificationOutput = GardenAgentCaptureOutput & {
  visualCommonName?: string | null;
  openIdentification?: string | null;
  plantMatches?: GardenAgentPlantMatch[];
};

export type GardenAgentPhotoIdentificationResponse = (Omit<GardenAgentEventResponse, 'output'> & {
  output?: GardenAgentPhotoIdentificationOutput | null;
}) | GardenAgentDiagnosticResponse;

export type PhotoIdentificationRequest = {
  eventId: string;
  eventType: 'photo.identification_requested';
  occurredAt: string;
  launchedFromPlantId?: string | null;
  capture: {
    width?: number | null;
    height?: number | null;
    mimeType?: string | null;
    capturedOn: string;
  };
  context: {
    plants: Array<{
      id: string;
      displayName: string;
      commonName?: string | null;
      varietyName?: string | null;
      locationName?: string | null;
      statusKind?: string | null;
      statusLabel?: string | null;
      visualHints?: string[];
      recentTags?: string[];
      recentObservationNotes?: string[];
    }>;
    app?: Record<string, unknown>;
  };
};


export type PlantChatContext = Record<string, unknown>;

export type PlantChatRequest = {
  messageId: string;
  conversationId: string;
  plantId: string;
  occurredAt: string;
  question: string;
  context: PlantChatContext;
};

export type PlantChatOutput = {
  answer: string;
  summary?: string | null;
  suggestedQuestions?: string[];
  confidence?: number | null;
  sources?: Array<{ kind: string; id?: string | null; label?: string | null }>;
};

export type PlantChatResponse = (Omit<GardenAgentEventResponse, 'output'> & {
  output?: PlantChatOutput | null;
}) | GardenAgentDiagnosticResponse;


export type CareRecommendationContext = Record<string, unknown>;

export type CareRecommendationRequest = {
  requestId: string;
  plantId: string;
  occurredAt: string;
  context: CareRecommendationContext;
};

export type CareRecommendationSuggestion = {
  recommendationType: string;
  title: string;
  body?: string | null;
  dueOn?: string | null;
  confidence?: number | null;
  rationale?: string | null;
  sources?: Array<{ kind: string; id?: string | null; label?: string | null }>;
};

export type CareRecommendationOutput = {
  summary: string;
  recommendations: CareRecommendationSuggestion[];
  confidence?: number | null;
};

export type CareRecommendationResponse = (Omit<GardenAgentEventResponse, 'output'> & {
  output?: CareRecommendationOutput | null;
}) | GardenAgentDiagnosticResponse;


export type CareProfileDraftRequest = {
  requestId: string;
  plantId: string;
  occurredAt: string;
  context: Record<string, unknown>;
};

export type CareProfileDraftFields = {
  lightPreference?: string | null;
  wateringRhythm?: string | null;
  soilMoisturePreference?: string | null;
  fertilizerCadence?: string | null;
  pruningNotes?: string | null;
  harvestNotes?: string | null;
  locationNotes?: string | null;
  generalNotes?: string | null;
};

export type CareProfileDraftOutput = {
  summary: string;
  profile: CareProfileDraftFields;
  confidence?: number | null;
  caveats?: string[];
  sources?: Array<{ kind: string; id?: string | null; label?: string | null }>;
};

export type CareProfileDraftResponse = (Omit<GardenAgentEventResponse, 'output'> & {
  output?: CareProfileDraftOutput | null;
}) | GardenAgentDiagnosticResponse;
