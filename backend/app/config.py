from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env"}


settings = Settings()
