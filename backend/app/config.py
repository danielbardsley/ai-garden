from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_slug: str = "garden-roof-deck"
    app_base_path: str = "/apps/garden-roof-deck/"
    api_base_path: str = "/api/garden-roof-deck/"
    data_dir: str = "./data"
    openai_api_key: str | None = None
    garden_agent_provider: str = "openai"
    garden_agent_model: str = "gpt-4.1-mini"
    garden_agent_enabled: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
