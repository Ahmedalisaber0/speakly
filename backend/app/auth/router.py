"""Auth endpoints: register, login, logout, me.

Sessions are tracked server-side in the `sessions` table; the cookie value
is the session id. HttpOnly + SameSite=Lax + Secure (in prod) — see config.
"""
from __future__ import annotations

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.service import (
    create_session,
    delete_session,
    hash_password,
    verify_password,
)
from app.config import settings
from app.db import get_db
from app.deps import get_current_user
from app.models_db import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ---- Schemas ----------------------------------------------------------------

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str
    country: str | None = None
    language: str = "English"
    dialect: str | None = None
    communication_style: str = "Casual"
    target_language: str = "English"
    email: EmailStr | None = None


class LoginRequest(BaseModel):
    username: str
    password: str
    remember: bool = False


class UserOut(BaseModel):
    user_id: int
    username: str
    email: str | None
    country: str | None
    language: str
    dialect: str | None
    communication_style: str
    target_language: str
    has_voice_sample: bool

    @classmethod
    def from_user(cls, user: User) -> "UserOut":
        return cls(
            user_id=user.user_id,
            username=user.username,
            email=user.email,
            country=user.country,
            language=user.language,
            dialect=user.dialect,
            communication_style=user.communication_style,
            target_language=user.target_language,
            has_voice_sample=bool(user.voice_sample_path),
        )


# ---- Cookie helpers ---------------------------------------------------------

def _set_session_cookie(response: Response, token: str, lifetime_seconds: int) -> None:
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        max_age=lifetime_seconds,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        path="/",
    )


def _clear_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.session_cookie_name,
        path="/",
        samesite="lax",
        secure=settings.cookie_secure,
        httponly=True,
    )


# ---- Endpoints --------------------------------------------------------------

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserOut:
    if body.password != body.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Unique username guard — case-insensitive comparison so "Ahmed" and
    # "ahmed" can't both register.
    existing = await db.execute(
        select(User).where(User.username == body.username)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Username already taken")

    user = User(
        username=body.username,
        email=body.email,
        password_hash=hash_password(body.password),
        country=body.country,
        language=body.language,
        dialect=body.dialect,
        communication_style=body.communication_style,
        target_language=body.target_language,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    session = await create_session(db, user, settings.session_default_lifetime)
    _set_session_cookie(response, session.session_id, settings.session_default_lifetime)
    return UserOut.from_user(user)


@router.post("/login", response_model=UserOut)
async def login(
    body: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserOut:
    result = await db.execute(select(User).where(User.username == body.username))
    user = result.scalar_one_or_none()
    # Constant-ish-time path: always run verify_password to limit user-enum
    # timing (still leaks through DB, but costs nothing to do).
    placeholder = "$2b$12$" + "x" * 53
    valid = verify_password(body.password, user.password_hash if user else placeholder)
    if user is None or not valid:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    lifetime = (
        settings.session_remember_lifetime if body.remember else settings.session_default_lifetime
    )
    session = await create_session(db, user, lifetime)
    _set_session_cookie(response, session.session_id, lifetime)
    return UserOut.from_user(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    db: AsyncSession = Depends(get_db),
    speakly_session: str | None = Cookie(default=None),
) -> Response:
    await delete_session(db, speakly_session or "")
    _clear_session_cookie(response)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.from_user(user)
