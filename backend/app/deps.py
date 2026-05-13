"""FastAPI dependencies for authentication.

`get_current_user` raises 401 when no valid session cookie is present;
`get_optional_user` returns None instead, for endpoints that work in both
authed and guest mode (e.g. /api/transcribe).
"""
from __future__ import annotations

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.service import get_session
from app.config import settings
from app.db import get_db
from app.models_db import User


async def _resolve_user(token: str | None, db: AsyncSession) -> User | None:
    if not token:
        return None
    session = await get_session(db, token)
    if session is None:
        return None
    return await db.get(User, session.user_id)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    speakly_session: str | None = Cookie(default=None, alias=None),
) -> User:
    user = await _resolve_user(speakly_session, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return user


async def get_optional_user(
    db: AsyncSession = Depends(get_db),
    speakly_session: str | None = Cookie(default=None, alias=None),
) -> User | None:
    return await _resolve_user(speakly_session, db)


# The cookie alias must match the configured cookie name. FastAPI's Cookie()
# alias is the name on the wire; the parameter name is what we read in code.
# We want the parameter to literally be `speakly_session` so we don't need an
# alias — but the configured name might differ. Keep them aligned.
assert settings.session_cookie_name == "speakly_session", (
    "If you change session_cookie_name, also update the parameter name in deps.py"
)
