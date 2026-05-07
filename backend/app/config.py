from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_slug: str = "garden-roof-deck"
    app_base_path: str = "/apps/garden-roof-deck/"
    api_base_path: str = "/api/garden-roof-deck/"
    data_dir: str = "/data"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
