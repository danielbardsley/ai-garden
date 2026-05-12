from typing import Any, Literal

from pydantic import BaseModel, Field


AgentEventStatus = Literal["queued", "running", "succeeded", "failed", "skipped"]
CategoryLabel = Literal[
    "growth_update",
    "flowering",
    "fruiting",
    "harvest_ready",
    "watering_check",
    "pest_or_damage_watch",
    "health_check",
    "general_photo_log",
]
InsightKind = Literal["summary", "attention", "care_note", "daily_brief", "tagging", "risk"]


class AgentEventRequest(BaseModel):
    event_id: str = Field(alias="eventId")
    event_type: str = Field(alias="eventType")
    entity_type: str | None = Field(default=None, alias="entityType")
    entity_id: str | None = Field(default=None, alias="entityId")
    plant_id: str | None = Field(default=None, alias="plantId")
    occurred_at: str | None = Field(default=None, alias="occurredAt")
    context: dict[str, Any] = Field(default_factory=dict)

    model_config = {"populate_by_name": True}


class AiTagOutput(BaseModel):
    label: str
    confidence: float = 0.5


class AiCategoryOutput(BaseModel):
    label: CategoryLabel = "general_photo_log"
    confidence: float = 0.5


class AiInsightOutput(BaseModel):
    title: str | None = None
    body: str
    kind: InsightKind = "summary"
    confidence: float = 0.5


class AiCareRecommendationOutput(BaseModel):
    title: str
    body: str | None = None
    due_on: str | None = Field(default=None, alias="dueOn")
    confidence: float = 0.5

    model_config = {"populate_by_name": True}


class CaptureReflectionOutput(BaseModel):
    summary: str
    tags: list[AiTagOutput] = Field(default_factory=list)
    category: AiCategoryOutput = Field(default_factory=AiCategoryOutput)
    insight: AiInsightOutput | None = None
    care_recommendation: AiCareRecommendationOutput | None = Field(default=None, alias="careRecommendation")
    confidence: float = 0.5

    model_config = {"populate_by_name": True}


class AgentEventAccepted(BaseModel):
    run_id: str = Field(alias="runId")
    status: AgentEventStatus
    provider_configured: bool = Field(alias="providerConfigured")
    output: dict[str, Any] | None = None

    model_config = {"populate_by_name": True}


class AgentRunStatus(BaseModel):
    run_id: str = Field(alias="runId")
    event_id: str = Field(alias="eventId")
    event_type: str = Field(alias="eventType")
    status: AgentEventStatus
    output: dict[str, Any] | None = None
    error_message: str | None = Field(default=None, alias="errorMessage")
    provider: str | None = None
    model: str | None = None
    prompt_tokens: int | None = Field(default=None, alias="promptTokens")
    completion_tokens: int | None = Field(default=None, alias="completionTokens")
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")

    model_config = {"populate_by_name": True}


class PlantInventoryContext(BaseModel):
    id: str
    display_name: str = Field(alias="displayName")
    common_name: str | None = Field(default=None, alias="commonName")
    variety_name: str | None = Field(default=None, alias="varietyName")
    location_name: str | None = Field(default=None, alias="locationName")
    status_kind: str | None = Field(default=None, alias="statusKind")
    status_label: str | None = Field(default=None, alias="statusLabel")
    visual_hints: list[str] = Field(default_factory=list, alias="visualHints")
    recent_tags: list[str] = Field(default_factory=list, alias="recentTags")
    recent_observation_notes: list[str] = Field(default_factory=list, alias="recentObservationNotes")

    model_config = {"populate_by_name": True}


class PhotoIdentificationContext(BaseModel):
    plants: list[PlantInventoryContext] = Field(default_factory=list)
    recent_observations: list[dict[str, Any]] = Field(default_factory=list, alias="recentObservations")
    recent_ai_insights: list[dict[str, Any]] = Field(default_factory=list, alias="recentAiInsights")
    locations: list[dict[str, Any]] = Field(default_factory=list)
    app: dict[str, Any] = Field(default_factory=dict)

    model_config = {"populate_by_name": True}


class CaptureMetadata(BaseModel):
    width: int | None = None
    height: int | None = None
    mime_type: str | None = Field(default=None, alias="mimeType")
    captured_on: str = Field(alias="capturedOn")

    model_config = {"populate_by_name": True}


class PhotoIdentificationRequest(BaseModel):
    event_id: str = Field(alias="eventId")
    event_type: Literal["photo.identification_requested"] = Field(alias="eventType")
    occurred_at: str = Field(alias="occurredAt")
    launched_from_plant_id: str | None = Field(default=None, alias="launchedFromPlantId")
    capture: CaptureMetadata
    context: PhotoIdentificationContext

    model_config = {"populate_by_name": True}


class PlantMatchCandidate(BaseModel):
    plant_id: str = Field(alias="plantId")
    display_name: str = Field(alias="displayName")
    common_name: str | None = Field(default=None, alias="commonName")
    variety_name: str | None = Field(default=None, alias="varietyName")
    confidence: float = 0.5
    rationale: str | None = None

    model_config = {"populate_by_name": True}


class PhotoIdentificationOutput(CaptureReflectionOutput):
    visual_common_name: str | None = Field(default=None, alias="visualCommonName")
    open_identification: str | None = Field(default=None, alias="openIdentification")
    plant_matches: list[PlantMatchCandidate] = Field(default_factory=list, alias="plantMatches")

    model_config = {"populate_by_name": True}


class PlantChatSource(BaseModel):
    kind: str
    id: str | None = None
    label: str | None = None


class PlantChatContext(BaseModel):
    plant: dict[str, Any] = Field(default_factory=dict)
    recent_observations: list[dict[str, Any]] = Field(default_factory=list, alias="recentObservations")
    recent_photos: list[dict[str, Any]] = Field(default_factory=list, alias="recentPhotos")
    recent_ai_insights: list[dict[str, Any]] = Field(default_factory=list, alias="recentAiInsights")
    care_events: list[dict[str, Any]] = Field(default_factory=list, alias="careEvents")
    care_recommendations: list[dict[str, Any]] = Field(default_factory=list, alias="careRecommendations")
    conversation_summary: str | None = Field(default=None, alias="conversationSummary")
    recent_messages: list[dict[str, Any]] = Field(default_factory=list, alias="recentMessages")
    app: dict[str, Any] = Field(default_factory=dict)

    model_config = {"populate_by_name": True}


class PlantChatRequest(BaseModel):
    message_id: str = Field(alias="messageId")
    conversation_id: str = Field(alias="conversationId")
    plant_id: str = Field(alias="plantId")
    occurred_at: str = Field(alias="occurredAt")
    question: str
    context: PlantChatContext

    model_config = {"populate_by_name": True}


class PlantChatOutput(BaseModel):
    answer: str
    summary: str | None = None
    suggested_questions: list[str] = Field(default_factory=list, alias="suggestedQuestions")
    confidence: float = 0.5
    sources: list[PlantChatSource] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


class CareRecommendationSource(BaseModel):
    kind: str
    id: str | None = None
    label: str | None = None


class CareRecommendationContext(BaseModel):
    plant: dict[str, Any] = Field(default_factory=dict)
    recent_care_events: list[dict[str, Any]] = Field(default_factory=list, alias="recentCareEvents")
    care_recommendations: list[dict[str, Any]] = Field(default_factory=list, alias="careRecommendations")
    recent_observations: list[dict[str, Any]] = Field(default_factory=list, alias="recentObservations")
    recent_photos: list[dict[str, Any]] = Field(default_factory=list, alias="recentPhotos")
    recent_ai_insights: list[dict[str, Any]] = Field(default_factory=list, alias="recentAiInsights")
    recent_messages: list[dict[str, Any]] = Field(default_factory=list, alias="recentMessages")
    app: dict[str, Any] = Field(default_factory=dict)

    model_config = {"populate_by_name": True}


class CareRecommendationRequest(BaseModel):
    request_id: str = Field(alias="requestId")
    plant_id: str = Field(alias="plantId")
    occurred_at: str = Field(alias="occurredAt")
    context: CareRecommendationContext

    model_config = {"populate_by_name": True}


class CareRecommendationSuggestion(BaseModel):
    recommendation_type: str = Field(alias="recommendationType")
    title: str
    body: str | None = None
    due_on: str | None = Field(default=None, alias="dueOn")
    confidence: float = 0.5
    rationale: str | None = None
    sources: list[CareRecommendationSource] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


class CareRecommendationOutput(BaseModel):
    summary: str
    recommendations: list[CareRecommendationSuggestion] = Field(default_factory=list)
    confidence: float = 0.5

    model_config = {"populate_by_name": True}


class CareProfileDraftContext(BaseModel):
    plant: dict[str, Any] = Field(default_factory=dict)
    care_profile: dict[str, Any] | None = Field(default=None, alias="careProfile")
    recent_care_events: list[dict[str, Any]] = Field(default_factory=list, alias="recentCareEvents")
    care_recommendations: list[dict[str, Any]] = Field(default_factory=list, alias="careRecommendations")
    recent_observations: list[dict[str, Any]] = Field(default_factory=list, alias="recentObservations")
    recent_photos: list[dict[str, Any]] = Field(default_factory=list, alias="recentPhotos")
    recent_ai_insights: list[dict[str, Any]] = Field(default_factory=list, alias="recentAiInsights")
    recent_messages: list[dict[str, Any]] = Field(default_factory=list, alias="recentMessages")
    app: dict[str, Any] = Field(default_factory=dict)

    model_config = {"populate_by_name": True}


class CareProfileDraftRequest(BaseModel):
    request_id: str = Field(alias="requestId")
    plant_id: str = Field(alias="plantId")
    occurred_at: str = Field(alias="occurredAt")
    context: CareProfileDraftContext

    model_config = {"populate_by_name": True}


class CareProfileDraftFields(BaseModel):
    light_preference: str | None = Field(default=None, alias="lightPreference")
    watering_rhythm: str | None = Field(default=None, alias="wateringRhythm")
    soil_moisture_preference: str | None = Field(default=None, alias="soilMoisturePreference")
    fertilizer_cadence: str | None = Field(default=None, alias="fertilizerCadence")
    pruning_notes: str | None = Field(default=None, alias="pruningNotes")
    harvest_notes: str | None = Field(default=None, alias="harvestNotes")
    location_notes: str | None = Field(default=None, alias="locationNotes")
    general_notes: str | None = Field(default=None, alias="generalNotes")

    model_config = {"populate_by_name": True}


class CareProfileDraftOutput(BaseModel):
    summary: str
    profile: CareProfileDraftFields = Field(default_factory=CareProfileDraftFields)
    confidence: float = 0.5
    caveats: list[str] = Field(default_factory=list)
    sources: list[CareRecommendationSource] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


class HomeTitleRequest(BaseModel):
    request_id: str = Field(alias="requestId")
    occurred_at: str = Field(alias="occurredAt")
    context: dict[str, Any] = Field(default_factory=dict)

    model_config = {"populate_by_name": True}


class HomeTitleOutput(BaseModel):
    title: str
    confidence: float = 0.5

    model_config = {"populate_by_name": True}
