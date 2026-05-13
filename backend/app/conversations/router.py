"""Conversation list / fetch / rename / delete endpoints.

The actual chat round-trip + message persistence lives in main.py /api/chat;
this router only manages the conversation envelope.
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import get_db
from app.deps import get_current_user
from app.models_db import Conversation, Message, User

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


class ConversationSummary(BaseModel):
    conversation_id: int
    title: str
    target_language: str
    updated_at: datetime
    last_message_preview: str | None


class MessageOut(BaseModel):
    message_id: int
    role: str
    content: str
    translated_content: str | None
    timestamp: datetime


class ConversationDetail(BaseModel):
    conversation_id: int
    title: str
    target_language: str
    created_at: datetime
    updated_at: datetime
    messages: list[MessageOut]


class CreateConversationRequest(BaseModel):
    target_language: str = "English"
    title: str | None = None


class UpdateConversationRequest(BaseModel):
    title: str | None = None
    target_language: str | None = None


async def _owned_conversation(
    conversation_id: int, user: User, db: AsyncSession, with_messages: bool = False
) -> Conversation:
    query = select(Conversation).where(
        Conversation.conversation_id == conversation_id,
        Conversation.user_id == user.user_id,
    )
    if with_messages:
        query = query.options(selectinload(Conversation.messages))
    result = await db.execute(query)
    conv = result.scalar_one_or_none()
    if conv is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.get("", response_model=list[ConversationSummary])
async def list_conversations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ConversationSummary]:
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user.user_id)
        .order_by(Conversation.updated_at.desc())
        .options(selectinload(Conversation.messages))
    )
    summaries: list[ConversationSummary] = []
    for conv in result.scalars().all():
        last = conv.messages[-1] if conv.messages else None
        preview = (last.content[:120] if last else None)
        summaries.append(
            ConversationSummary(
                conversation_id=conv.conversation_id,
                title=conv.title,
                target_language=conv.target_language,
                updated_at=conv.updated_at,
                last_message_preview=preview,
            )
        )
    return summaries


@router.post("", response_model=ConversationDetail)
async def create_conversation(
    body: CreateConversationRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationDetail:
    conv = Conversation(
        user_id=user.user_id,
        title=body.title or "New chat",
        target_language=body.target_language or user.target_language,
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return ConversationDetail(
        conversation_id=conv.conversation_id,
        title=conv.title,
        target_language=conv.target_language,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=[],
    )


@router.get("/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationDetail:
    conv = await _owned_conversation(conversation_id, user, db, with_messages=True)
    return ConversationDetail(
        conversation_id=conv.conversation_id,
        title=conv.title,
        target_language=conv.target_language,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=[
            MessageOut(
                message_id=m.message_id,
                role=m.role,
                content=m.content,
                translated_content=m.translated_content,
                timestamp=m.timestamp,
            )
            for m in conv.messages
        ],
    )


@router.patch("/{conversation_id}", response_model=ConversationSummary)
async def update_conversation(
    conversation_id: int,
    body: UpdateConversationRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationSummary:
    conv = await _owned_conversation(conversation_id, user, db, with_messages=True)
    if body.title is not None:
        conv.title = body.title.strip() or "New chat"
    if body.target_language is not None:
        conv.target_language = body.target_language
    await db.commit()
    await db.refresh(conv)
    last = conv.messages[-1] if conv.messages else None
    return ConversationSummary(
        conversation_id=conv.conversation_id,
        title=conv.title,
        target_language=conv.target_language,
        updated_at=conv.updated_at,
        last_message_preview=last.content[:120] if last else None,
    )


@router.delete("/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv = await _owned_conversation(conversation_id, user, db)
    await db.delete(conv)
    await db.commit()


# ---- Internal helpers used by /api/chat -------------------------------------

async def append_messages(
    db: AsyncSession,
    conversation_id: int,
    user_message: str,
    user_translation: str | None,
    assistant_message: str,
    assistant_translation: str | None,
) -> None:
    """Persist a (user, assistant) message pair to a conversation. Updates
    `updated_at` implicitly via SA's onupdate."""
    db.add_all(
        [
            Message(
                conversation_id=conversation_id,
                role="user",
                content=user_message,
                translated_content=user_translation,
            ),
            Message(
                conversation_id=conversation_id,
                role="assistant",
                content=assistant_message,
                translated_content=assistant_translation,
            ),
        ]
    )
    # Manually bump the parent's updated_at so the sidebar resorts.
    # (The onupdate hook on Conversation only fires when the row itself is
    # changed, not when children are added.)
    conv = await db.get(Conversation, conversation_id)
    if conv is not None:
        conv.updated_at = datetime.now(timezone.utc)
    await db.commit()


async def auto_title_if_needed(db: AsyncSession, conversation_id: int, first_user_message: str) -> None:
    """If the conversation is still 'New chat', set its title from the first message."""
    conv = await db.get(Conversation, conversation_id)
    if conv is None or conv.title != "New chat":
        return
    title = first_user_message.strip().splitlines()[0][:40]
    if title:
        conv.title = title
        await db.commit()
