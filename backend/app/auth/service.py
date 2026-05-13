"""Pure auth helpers — password hashing + session token CRUD.

Kept HTTP-agnostic so the router can be tested without a request context.
"""
from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models_db import Session, User


def hash_password(plain: str) -> str:
    """bcrypt hash, 12 rounds. Returns the encoded hash as utf-8 string."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def _new_token() -> str:
    # 32 bytes ≈ 43 chars URL-safe; effectively unguessable.
    return secrets.token_urlsafe(32)


async def create_session(db: AsyncSession, user: User, lifetime_seconds: int) -> Session:
    now = datetime.now(timezone.utc)
    session = Session(
        session_id=_new_token(),
        user_id=user.user_id,
        login_timestamp=now,
        last_seen_at=now,
        expires_at=now + timedelta(seconds=lifetime_seconds),
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def get_session(db: AsyncSession, token: str) -> Session | None:
    """Fetch a session by token; returns None if missing or expired."""
    if not token:
        return None
    result = await db.execute(select(Session).where(Session.session_id == token))
    session = result.scalar_one_or_none()
    if session is None:
        return None
    now = datetime.now(timezone.utc)
    # SQLite returns naive datetimes — coerce to UTC for the compare.
    expires = session.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < now:
        await db.delete(session)
        await db.commit()
        return None
    # Bump last_seen so we can later show "last active" in a sessions UI.
    session.last_seen_at = now
    await db.commit()
    return session


async def delete_session(db: AsyncSession, token: str) -> None:
    if not token:
        return
    result = await db.execute(select(Session).where(Session.session_id == token))
    session = result.scalar_one_or_none()
    if session is not None:
        await db.delete(session)
        await db.commit()
