from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/health")
def health(request: Request) -> dict[str, object]:
    settings = request.app.state.settings
    return {
        "status": "ok",
        "app": "garden-roof-deck",
        "agentProvider": settings.garden_agent_provider,
        "agentModel": settings.garden_agent_model,
        "agentConfigured": bool(settings.openai_api_key),
    }
