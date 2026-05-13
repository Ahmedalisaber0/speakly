from pathlib import Path

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

    # Persistent state lives under backend/data/ — DB file + uploaded voice samples.
    data_dir: Path = Path(__file__).resolve().parent.parent / "data"

    # Auth — session cookie name, lifetimes (seconds), and Secure flag.
    session_cookie_name: str = "speakly_session"
    session_default_lifetime: int = 60 * 60 * 24 * 30   # 30 days
    session_remember_lifetime: int = 60 * 60 * 24 * 90  # 90 days w/ Remember Me
    cookie_secure: bool = False  # set true behind HTTPS in prod

    model_config = {"env_file": ".env"}


settings = Settings()

# Ensure data/ and data/voice_samples/ exist on import — done once at process
# start so endpoints can write to them without race-y mkdir calls later.
(settings.data_dir / "voice_samples").mkdir(parents=True, exist_ok=True)
