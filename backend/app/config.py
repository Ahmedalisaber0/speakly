from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str
    # Groq model used for chat, translation, grammar-check, news summaries.
    # Override in .env, e.g. CHAT_MODEL="llama-3.3-70b-versatile"
    chat_model: str = "openai/gpt-oss-120b"
    # Groq Whisper variant used for /api/transcribe. Default is the more
    # accurate non-turbo model — it costs a bit more latency but transcribes
    # diacritics-heavy languages (Arabic, Japanese, Korean) noticeably better.
    # Override in .env, e.g. WHISPER_MODEL="whisper-large-v3-turbo"
    whisper_model: str = "whisper-large-v3"
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env"}


settings = Settings()
