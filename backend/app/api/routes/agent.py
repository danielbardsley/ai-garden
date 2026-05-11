import json

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from pydantic import ValidationError

from app.agent.garden_agent import GardenAgent
from app.agent.schemas import AgentEventAccepted, AgentEventRequest, AgentRunStatus, PhotoIdentificationRequest, PlantChatRequest, CareRecommendationRequest, CareProfileDraftRequest
from app.infrastructure.repositories.agent_run_repository import AgentRunRepository

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/events", response_model=AgentEventAccepted, response_model_by_alias=True)
def submit_event(event: AgentEventRequest, request: Request) -> AgentEventAccepted:
    return _run_agent_event(event, request, image_bytes=None, mime_type=None)


@router.post("/photo-categorizations", response_model=AgentEventAccepted, response_model_by_alias=True)
def submit_photo_categorization(
    request: Request,
    event: str = Form(...),
    photo: UploadFile = File(...),
) -> AgentEventAccepted:
    try:
        parsed_event = AgentEventRequest.model_validate(json.loads(event))
    except (json.JSONDecodeError, ValidationError) as exc:
        raise HTTPException(status_code=400, detail="Invalid event payload") from exc
    return _run_agent_event(parsed_event, request, image_bytes=photo.file.read(), mime_type=photo.content_type)



@router.post("/photo-identifications", response_model=AgentEventAccepted, response_model_by_alias=True)
def submit_photo_identification(
    request: Request,
    event: str = Form(...),
    photo: UploadFile = File(...),
) -> AgentEventAccepted:
    try:
        parsed_event = PhotoIdentificationRequest.model_validate(json.loads(event))
    except (json.JSONDecodeError, ValidationError) as exc:
        raise HTTPException(status_code=400, detail="Invalid event payload") from exc
    if photo.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Photo must be a JPEG, PNG, or WebP image")
    return _run_photo_identification(parsed_event, request, image_bytes=photo.file.read(), mime_type=photo.content_type)

def _run_agent_event(
    event: AgentEventRequest,
    request: Request,
    *,
    image_bytes: bytes | None,
    mime_type: str | None,
) -> AgentEventAccepted:
    settings = request.app.state.settings
    repository = AgentRunRepository(settings.data_dir)
    agent = GardenAgent(settings)
    run = repository.create_run(event, provider=settings.garden_agent_provider, model=settings.garden_agent_model, status="running")
    output = None
    try:
        output, usage = agent.run_photo_categorization(event, image_bytes=image_bytes, mime_type=mime_type)
        repository.complete_run(
            run.run_id,
            output=output,
            prompt_tokens=usage.get("prompt_tokens"),
            completion_tokens=usage.get("completion_tokens"),
        )
        status = "succeeded"
    except Exception as exc:
        repository.fail_run(run.run_id, str(exc))
        status = "failed"
    return AgentEventAccepted(runId=run.run_id, status=status, providerConfigured=agent.provider_configured, output=output)


def _run_photo_identification(
    event: PhotoIdentificationRequest,
    request: Request,
    *,
    image_bytes: bytes | None,
    mime_type: str | None,
) -> AgentEventAccepted:
    settings = request.app.state.settings
    repository = AgentRunRepository(settings.data_dir)
    agent = GardenAgent(settings)
    agent_event = AgentEventRequest(
        eventId=event.event_id,
        eventType=event.event_type,
        entityType="photo",
        entityId=None,
        plantId=event.launched_from_plant_id,
        occurredAt=event.occurred_at,
        context=event.model_dump(by_alias=True),
    )
    run = repository.create_run(agent_event, provider=settings.garden_agent_provider, model=settings.garden_agent_model, status="running")
    output = None
    try:
        output, usage = agent.run_photo_identification(event, image_bytes=image_bytes, mime_type=mime_type)
        repository.complete_run(
            run.run_id,
            output=output,
            prompt_tokens=usage.get("prompt_tokens"),
            completion_tokens=usage.get("completion_tokens"),
        )
        status = "succeeded"
    except Exception as exc:
        repository.fail_run(run.run_id, str(exc))
        status = "failed"
    return AgentEventAccepted(runId=run.run_id, status=status, providerConfigured=agent.provider_configured, output=output)




@router.post("/plant-chat", response_model=AgentEventAccepted, response_model_by_alias=True)
def submit_plant_chat(chat_request: PlantChatRequest, request: Request) -> AgentEventAccepted:
    return _run_plant_chat(chat_request, request)


def _run_plant_chat(chat_request: PlantChatRequest, request: Request) -> AgentEventAccepted:
    settings = request.app.state.settings
    repository = AgentRunRepository(settings.data_dir)
    agent = GardenAgent(settings)
    agent_event = AgentEventRequest(
        eventId=chat_request.message_id,
        eventType="plant.chat_requested",
        entityType="plant",
        entityId=chat_request.plant_id,
        plantId=chat_request.plant_id,
        occurredAt=chat_request.occurred_at,
        context=chat_request.model_dump(by_alias=True),
    )
    run = repository.create_run(agent_event, provider=settings.garden_agent_provider, model=settings.garden_agent_model, status="running")
    output = None
    try:
        output, usage = agent.run_plant_chat(chat_request)
        repository.complete_run(
            run.run_id,
            output=output,
            prompt_tokens=usage.get("prompt_tokens"),
            completion_tokens=usage.get("completion_tokens"),
        )
        status = "succeeded"
    except Exception as exc:
        repository.fail_run(run.run_id, str(exc))
        status = "failed"
    return AgentEventAccepted(runId=run.run_id, status=status, providerConfigured=agent.provider_configured, output=output)




@router.post("/care-recommendations", response_model=AgentEventAccepted, response_model_by_alias=True)
def submit_care_recommendations(care_request: CareRecommendationRequest, request: Request) -> AgentEventAccepted:
    return _run_care_recommendations(care_request, request)


def _run_care_recommendations(care_request: CareRecommendationRequest, request: Request) -> AgentEventAccepted:
    settings = request.app.state.settings
    repository = AgentRunRepository(settings.data_dir)
    agent = GardenAgent(settings)
    agent_event = AgentEventRequest(
        eventId=care_request.request_id,
        eventType="plant.care_recommendations_requested",
        entityType="plant",
        entityId=care_request.plant_id,
        plantId=care_request.plant_id,
        occurredAt=care_request.occurred_at,
        context=care_request.model_dump(by_alias=True),
    )
    run = repository.create_run(agent_event, provider=settings.garden_agent_provider, model=settings.garden_agent_model, status="running")
    output = None
    try:
        output, usage = agent.run_care_recommendations(care_request)
        repository.complete_run(
            run.run_id,
            output=output,
            prompt_tokens=usage.get("prompt_tokens"),
            completion_tokens=usage.get("completion_tokens"),
        )
        status = "succeeded"
    except Exception as exc:
        repository.fail_run(run.run_id, str(exc))
        status = "failed"
    return AgentEventAccepted(runId=run.run_id, status=status, providerConfigured=agent.provider_configured, output=output)




@router.post("/care-profile-draft", response_model=AgentEventAccepted, response_model_by_alias=True)
def submit_care_profile_draft(draft_request: CareProfileDraftRequest, request: Request) -> AgentEventAccepted:
    return _run_care_profile_draft(draft_request, request)


def _run_care_profile_draft(draft_request: CareProfileDraftRequest, request: Request) -> AgentEventAccepted:
    settings = request.app.state.settings
    repository = AgentRunRepository(settings.data_dir)
    agent = GardenAgent(settings)
    agent_event = AgentEventRequest(
        eventId=draft_request.request_id,
        eventType="plant.care_profile_draft_requested",
        entityType="plant",
        entityId=draft_request.plant_id,
        plantId=draft_request.plant_id,
        occurredAt=draft_request.occurred_at,
        context=draft_request.model_dump(by_alias=True),
    )
    run = repository.create_run(agent_event, provider=settings.garden_agent_provider, model=settings.garden_agent_model, status="running")
    output = None
    try:
        output, usage = agent.run_care_profile_draft(draft_request)
        repository.complete_run(
            run.run_id,
            output=output,
            prompt_tokens=usage.get("prompt_tokens"),
            completion_tokens=usage.get("completion_tokens"),
        )
        status = "succeeded"
    except Exception as exc:
        repository.fail_run(run.run_id, str(exc))
        status = "failed"
    return AgentEventAccepted(runId=run.run_id, status=status, providerConfigured=agent.provider_configured, output=output)


@router.get("/runs/{run_id}", response_model=AgentRunStatus, response_model_by_alias=True)
def get_run(run_id: str, request: Request) -> AgentRunStatus:
    repository = AgentRunRepository(request.app.state.settings.data_dir)
    try:
        return repository.get_run(run_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Agent run not found") from exc
