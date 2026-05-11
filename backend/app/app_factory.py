from fastapi import FastAPI

from app.api.routes.agent import router as agent_router
from app.api.routes.health import router as health_router
from app.config import Settings


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    application = FastAPI(title="Garden Roof Deck API")
    application.state.settings = settings
    application.include_router(health_router)
    application.include_router(agent_router)
    return application
