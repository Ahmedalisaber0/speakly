from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.router import router as auth_router
from app.config import settings
from app.conversations.router import (
    append_messages,
    auto_title_if_needed,
    router as conversations_router,
)
from app.db import get_db, init_db
from app.deps import get_current_user, get_optional_user
from app.models_db import Conversation, User
from app.models import (
    ChatRequest, ChatResponse, TranslateRequest, TranslateResponse,
    NewsResponse, NewsTranslateRequest, NewsTranslateResponse,
    NewsTranslateBatchRequest, NewsTranslateBatchResponse,
    GrammarCheckRequest, GrammarCheckResponse,
)
from app.services.llm_service import (
    get_response, translate_text, translate_news_article, translate_news_articles,
    transcribe_audio, check_grammar,
)
from app.services.tts_service import get_voices, synthesize_speech
from app.services.search_service import search_news
from app.users.router import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Bootstrap SQLite tables on startup. Idempotent — safe to run on every boot.
    await init_db()
    yield


app = FastAPI(title="Speakly API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(conversations_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Resolve / create conversation. The frontend may send `conversation_id=null`
    # for the very first message — in that case spin up a fresh conversation
    # owned by the current user, using their default target language unless
    # the client overrode it on the request.
    conversation_id = request.conversation_id
    if conversation_id is None:
        conv = Conversation(
            user_id=user.user_id,
            title="New chat",
            target_language=request.target_language or user.target_language,
        )
        db.add(conv)
        await db.commit()
        await db.refresh(conv)
        conversation_id = conv.conversation_id
    else:
        # Confirm the user owns it; 404 if not.
        conv = await db.get(Conversation, conversation_id)
        if conv is None or conv.user_id != user.user_id:
            raise HTTPException(status_code=404, detail="Conversation not found")

    # Personalize the chat call by passing the User into get_response.
    response = await get_response(request, user=user)

    # If the LLM asked for clarification, hide the bot reply from history —
    # we'll only persist it if the user dismisses the clarification card,
    # which sends a follow-up call without needs_clarification.
    if not response.needs_clarification:
        # Best-effort: also try to grab a translation of the user's message
        # for nice bilingual replay later. We have the bot's translated_reply
        # already; for the user's, we'd need a separate translate call. Skip
        # that for now to keep latency low — the frontend already translates
        # user messages live and could PATCH later. None is fine.
        await append_messages(
            db=db,
            conversation_id=conversation_id,
            user_message=request.message,
            user_translation=None,
            assistant_message=response.reply,
            assistant_translation=response.translated_reply or None,
        )
        await auto_title_if_needed(db, conversation_id, request.message)

    response.conversation_id = conversation_id
    return response


@app.post("/api/translate", response_model=TranslateResponse)
async def translate(request: TranslateRequest):
    return await translate_text(request)


@app.get("/api/voices")
async def voices(lang: str = ""):
    return await get_voices(lang)


@app.get("/api/news", response_model=NewsResponse)
async def news(q: str = "latest news", max_results: int = 10):
    articles = await search_news(q, max_results=max_results)
    return NewsResponse(articles=articles, query=q)


@app.post("/api/news/translate", response_model=NewsTranslateResponse)
async def news_translate(request: NewsTranslateRequest):
    return await translate_news_article(request)


@app.post("/api/news/translate-batch", response_model=NewsTranslateBatchResponse)
async def news_translate_batch(request: NewsTranslateBatchRequest):
    return await translate_news_articles(request)


@app.post("/api/check-grammar", response_model=GrammarCheckResponse)
async def check_grammar_endpoint(request: GrammarCheckRequest):
    return await check_grammar(request)


@app.post("/api/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    language: str = Form(""),
    dialect: str = Form(""),
    user: User | None = Depends(get_optional_user),
):
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio upload")

    # Profile dialect wins over the form value for authed users (so the mic
    # benefits from personalization automatically). Form value is the
    # frontend's explicit override or guest fallback.
    effective_dialect = (user.dialect if user and user.dialect else dialect) or ""

    try:
        text = await transcribe_audio(
            audio_bytes,
            filename=audio.filename or "audio.webm",
            language=language or None,
            dialect=effective_dialect or None,
        )
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Transcription failed: {e}")
    return {"text": text}


@app.post("/api/tts")
async def tts(body: dict):
    text = body.get("text", "")
    voice = body.get("voice", "en-US-AriaNeural")
    if not text:
        return Response(status_code=400, content="Missing text")
    audio = await synthesize_speech(text, voice)
    return Response(content=audio, media_type="audio/mpeg")
