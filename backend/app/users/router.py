"""User profile endpoints — update profile, change password, voice sample upload."""
from __future__ import annotations

import os
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.router import UserOut
from app.auth.service import hash_password, verify_password
from app.config import settings
from app.db import get_db
from app.deps import get_current_user
from app.models_db import User

router = APIRouter(prefix="/api/users", tags=["users"])


class ProfileUpdate(BaseModel):
    email: EmailStr | None = None
    country: str | None = None
    language: str | None = None
    dialect: str | None = None
    communication_style: str | None = None
    target_language: str | None = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_new_password: str


@router.patch("/me", response_model=UserOut)
async def update_profile(
    body: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserOut:
    # Apply only the fields the client actually sent. None means "leave alone".
    data = body.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return UserOut.from_user(user)


@router.post("/me/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    body: PasswordChange,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(body.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if body.new_password != body.confirm_new_password:
        raise HTTPException(status_code=400, detail="New passwords do not match")
    user.password_hash = hash_password(body.new_password)
    await db.commit()
    return None


def _voice_sample_path(user_id: int) -> Path:
    return settings.data_dir / "voice_samples" / f"{user_id}.webm"


@router.post("/me/voice-sample", response_model=UserOut)
async def upload_voice_sample(
    audio: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserOut:
    raw = await audio.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty audio upload")
    # Loose 2 MB cap — a 10-second opus clip is ~40 KB, anything bigger is suspicious.
    if len(raw) > 2 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Voice sample too large (max 2 MB)")

    path = _voice_sample_path(user.user_id)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(raw)
    user.voice_sample_path = str(path.relative_to(settings.data_dir))
    await db.commit()
    await db.refresh(user)
    return UserOut.from_user(user)


@router.get("/me/voice-sample")
async def get_voice_sample(user: User = Depends(get_current_user)):
    if not user.voice_sample_path:
        raise HTTPException(status_code=404, detail="No voice sample on file")
    path = settings.data_dir / user.voice_sample_path
    if not path.exists():
        # DB row out of sync with disk — clean up the stale pointer.
        raise HTTPException(status_code=404, detail="Voice sample missing on disk")
    return FileResponse(path, media_type="audio/webm", filename="voice-sample.webm")


@router.delete("/me/voice-sample", response_model=UserOut)
async def delete_voice_sample(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserOut:
    if user.voice_sample_path:
        path = settings.data_dir / user.voice_sample_path
        if path.exists():
            try:
                os.unlink(path)
            except OSError:
                pass
        user.voice_sample_path = None
        await db.commit()
        await db.refresh(user)
    return UserOut.from_user(user)
