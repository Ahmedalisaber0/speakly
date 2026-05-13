"""Async SQLAlchemy engine + session factory for SQLite.

The DB file lives under backend/data/speakly.db and is created automatically
on the first connection. Tables are bootstrapped from models_db.Base on app
startup (see main.py lifespan).
"""
from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings

DB_PATH = settings.data_dir / "speakly.db"
DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH}"

# echo=False keeps server logs quiet; flip to True locally to see every SQL.
engine: AsyncEngine = create_async_engine(DATABASE_URL, echo=False, future=True)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency — yields a session that's closed/rolled-back on error."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


async def init_db() -> None:
    """Create all tables if they don't exist. Called once at app startup."""
    # Import here so the models register on Base.metadata before create_all runs.
    from app import models_db  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(models_db.Base.metadata.create_all)
