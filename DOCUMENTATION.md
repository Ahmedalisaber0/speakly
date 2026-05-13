# Speakly — Full Project Documentation

Speakly is a personalized AI voice assistant for language practice. Users register an account, declare their dialect and tone preferences, and chat (text or voice) with an AI that **remembers them, persists every conversation, speaks their dialect, matches their style, and translates messages live in both directions**. This document explains how every piece fits together.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture at a Glance](#2-architecture-at-a-glance)
3. [Tech Stack](#3-tech-stack)
4. [Repository Layout](#4-repository-layout)
5. [Backend](#5-backend)
    - [Configuration](#51-configuration-backendappconfigpy)
    - [Database Layer](#52-database-layer-backendappdbpy--models_dbpy)
    - [Auth & Sessions](#53-auth--sessions-backendappauth)
    - [Pydantic Schemas](#54-pydantic-schemas-backendappmodelspy)
    - [System Prompt](#55-system-prompt-backendapppromptspy)
    - [API Endpoints](#56-api-endpoints)
    - [LLM Service](#57-llm-service)
    - [Search Service](#58-search-service)
    - [TTS Service](#59-tts-service)
6. [Frontend](#6-frontend)
    - [Pages](#61-pages-nextjs-app-router)
    - [Middleware (Route Protection)](#62-middleware-route-protection)
    - [Components](#63-components)
    - [Hooks](#64-hooks)
    - [API Clients](#65-api-clients)
    - [Strings (i18n)](#66-strings-i18n)
    - [Types](#67-types)
7. [End-to-End Data Flows](#7-end-to-end-data-flows)
    - [Authed Chat Round-Trip](#71-authed-chat-round-trip)
    - [Voice Pipeline](#72-voice-pipeline)
    - [Auth Lifecycle](#73-auth-lifecycle)
8. [Database Schema](#8-database-schema)
9. [Personalization Details](#9-personalization-details)
10. [Supported Languages & Dialects](#10-supported-languages--dialects)
11. [Running the Project Locally](#11-running-the-project-locally)
12. [Environment Variables](#12-environment-variables)
13. [Security Model](#13-security-model)
14. [Troubleshooting](#14-troubleshooting)
15. [Extending Speakly](#15-extending-speakly)

---

## 1. Overview

| Area | Feature | Description |
|------|---------|-------------|
| **Auth** | Register / Login / Logout | Username + password (bcrypt-12) + profile fields. HttpOnly cookie session. |
| **Auth** | Profile + password change | All profile fields editable. Password change requires current pw. |
| **Auth** | Voice sample (optional) | Record 5–10 sec sample at registration or in Settings. |
| **Chat** | Personalized assistant | Bot greets by name, matches style (Casual/Professional/Formal), aware of user's country and dialect. |
| **Chat** | Persisted conversations | Every message saved. Sidebar lists conversations newest-first with auto-titles. Resume, rename, delete. |
| **Chat** | Bilingual bubbles | Each message shows native + target translation stacked, both visible. |
| **Chat** | Clarification card | When the bot can't understand a garbled message, a floating card asks "Did you mean…?" with a TTS speaker and Yes/No buttons. |
| **Chat** | Voice input | Mic uses your dialect by default. Toggle between Auto-detect and Lock-to-Native. Live recording timer. |
| **Chat** | Stop-speaking | Cut off TTS playback any time. |
| **Chat** | Auto web search fallback | When the bot doesn't know something, it searches DuckDuckGo and re-asks. |
| **Public** | Translate | Text translation between 10 languages with grammar corrections. No account needed. |
| **Public** | News | DuckDuckGo news search with optional translated titles + summaries. No account needed. |
| **UI** | Localized labels | All UI strings translated to 10 languages, picked based on the user's profile. |
| **UI** | Dark mode | Manual toggle, persisted to localStorage, defaults to OS preference. |

---

## 2. Architecture at a Glance

```
+--------------------+      HTTP + cookie       +-----------------------+
|                    |  ----------------------> |                       |
|   Next.js 16 UI    |                          |   FastAPI Backend     |
|   (React 19, TS)   | <----------------------  |   (Python 3.12, async)|
|                    |       JSON / MP3         |                       |
+----------+---------+                          +-----+----------+------+
           |                                          |          |
           | MediaRecorder                            |          |
           |                                          |          |
           |                          +---------------+---+   +--+----------+
           |                          |  SQLite DB        |   |  External   |
           |                          |  (SQLAlchemy 2.0) |   |  services   |
           |                          |  users / sessions |   |  - Groq     |
           |                          |  conversations    |   |  - DuckDuckGo|
           |                          |  messages         |   |  - Edge TTS |
           |                          +-------------------+   +-------------+
```

- **Frontend** is a Next.js App Router project. It never talks to external APIs directly — only to the FastAPI backend.
- **Backend** orchestrates the LLM, Whisper, search, and TTS services, plus owns all user state in SQLite.
- **State is persistent.** Conversations, sessions, and profiles survive server restarts.

---

## 3. Tech Stack

### Backend
- **FastAPI 0.135** with async dependencies
- **SQLAlchemy 2.0** + **aiosqlite** for the async SQLite layer
- **bcrypt 4.x** for password hashing
- **OpenAI Python SDK** pointed at Groq (`https://api.groq.com/openai/v1`)
- **edge-tts 7.x** for Microsoft TTS voices
- **ddgs 9.x** for DuckDuckGo web/news search
- **python-multipart** for voice sample uploads
- **email-validator** for `EmailStr`

### Frontend
- **Next.js 16** (App Router, Turbopack)
- **React 19** with hooks + context
- **TypeScript 5**
- **Tailwind CSS 4** with CSS-variable themed light/dark mode
- **MediaRecorder API** (browser-native) for audio capture
- HttpOnly cookie auth, route-protection middleware

---

## 4. Repository Layout

```
speakly/
├── README.md
├── DOCUMENTATION.md              # this file
├── GRAPH.md                      # condensed architecture graph
│
├── backend/
│   ├── requirements.txt
│   ├── .env                      # contains GROQ_API_KEY (gitignored)
│   ├── data/                     # auto-created on first boot
│   │   ├── speakly.db
│   │   └── voice_samples/<user_id>.webm
│   └── app/
│       ├── main.py               # FastAPI app, lifespan, routers
│       ├── config.py             # Pydantic Settings
│       ├── db.py                 # Async SQLAlchemy engine
│       ├── deps.py               # get_current_user / get_optional_user
│       ├── models.py             # Pydantic request/response schemas
│       ├── models_db.py          # SQLAlchemy ORM (User/Session/Conversation/Message)
│       ├── prompts.py            # Personalized system prompt builder
│       ├── auth/
│       │   ├── service.py        # bcrypt + session token CRUD
│       │   └── router.py         # /api/auth/*
│       ├── users/
│       │   └── router.py         # /api/users/me
│       ├── conversations/
│       │   └── router.py         # /api/conversations/*
│       └── services/
│           ├── llm_service.py    # Groq chat/translate/grammar + dialect-aware Whisper
│           ├── search_service.py # DuckDuckGo search
│           └── tts_service.py    # Edge TTS
│
└── frontend/
    ├── package.json
    └── src/
        ├── middleware.ts         # Route protection
        ├── app/
        │   ├── layout.tsx        # AuthProvider, theme bootstrap
        │   ├── globals.css       # CSS variables, dark mode
        │   ├── page.tsx          # Landing (public)
        │   ├── login/page.tsx
        │   ├── register/page.tsx
        │   ├── chat/page.tsx     # Authed chat dashboard
        │   ├── settings/page.tsx
        │   ├── translate/page.tsx
        │   └── news/page.tsx
        ├── components/
        │   ├── ChatWindow.tsx
        │   ├── ChatMessage.tsx
        │   ├── ClarificationCard.tsx
        │   ├── CorrectionCard.tsx
        │   ├── CloudVoiceSelector.tsx
        │   ├── LanguageSelector.tsx
        │   ├── Flag.tsx
        │   ├── auth/{AuthShell,PasswordField}.tsx
        │   ├── chat/{ConversationSidebar,ProfileBadge}.tsx
        │   └── voice/VoiceSampleRecorder.tsx
        ├── hooks/
        │   ├── useAuth.tsx
        │   ├── useConversations.ts
        │   ├── useChat.ts
        │   └── useSpeechRecognition.ts
        ├── lib/
        │   ├── api.ts            # Chat + utility endpoints client
        │   ├── auth-api.ts       # /api/auth + /api/users client
        │   ├── conversations-api.ts
        │   └── strings.ts        # i18n labels × 10 languages
        └── types/
            └── index.ts          # ChatMessage, Language, language code maps
```

---

## 5. Backend

### 5.1 Configuration (`backend/app/config.py`)

```python
class Settings(BaseSettings):
    groq_api_key: str
    chat_model: str = "openai/gpt-oss-120b"
    whisper_model: str = "whisper-large-v3"
    cors_origins: list[str] = ["http://localhost:3000"]
    data_dir: Path = backend/data
    session_cookie_name: str = "speakly_session"
    session_default_lifetime: int = 30 days
    session_remember_lifetime: int = 90 days
    cookie_secure: bool = False  # set True behind HTTPS
```

`data_dir / "voice_samples"` is created at import time.

### 5.2 Database Layer (`backend/app/db.py` + `models_db.py`)

`db.py` creates an async SQLAlchemy engine over `sqlite+aiosqlite:///./data/speakly.db` and a session factory `AsyncSessionLocal`. The `get_db()` dependency yields a session that auto-rolls-back on error.

`init_db()` runs `Base.metadata.create_all()` once on app startup (FastAPI lifespan).

`models_db.py` defines four ORM classes:

- **`User`** — username (unique), bcrypt password_hash, profile fields, voice_sample_path, created_at.
- **`Session`** — random URL-safe token (also the cookie value), user_id FK, expires_at, last_seen_at.
- **`Conversation`** — user_id FK, title, target_language, created_at, updated_at.
- **`Message`** — conversation_id FK, role, content, translated_content, timestamp.

All FKs cascade on delete.

### 5.3 Auth & Sessions (`backend/app/auth/`)

`auth/service.py`:
- `hash_password(plain)` → bcrypt-12 hash
- `verify_password(plain, hashed)` → bool
- `create_session(db, user, lifetime)` → new Session row + URL-safe token
- `get_session(db, token)` → Session if valid + non-expired (also bumps `last_seen_at`)
- `delete_session(db, token)` → removes row

`deps.py`:
- `get_current_user` → 401 if cookie missing/invalid; otherwise returns `User`.
- `get_optional_user` → returns `User | None` for endpoints that work in both modes (e.g. `/api/transcribe`).

`auth/router.py` mounts `/api/auth/{register,login,logout,me}`. Cookie attributes:

```python
HttpOnly + SameSite=Lax + Secure (when COOKIE_SECURE=true) + path="/"
Max-Age = 30 days (default) or 90 days (remember)
```

Login uses constant-time-ish bcrypt verification (always runs `verify_password` against either the real hash or a placeholder) to limit username enumeration.

### 5.4 Pydantic Schemas (`backend/app/models.py`)

```python
ChatRequest          → {message, native_language, target_language,
                        conversation_history, conversation_id?}
ChatResponse         → {reply, translated_reply, corrections, news_articles,
                        needs_clarification, suggested_correction,
                        correction_language, conversation_id}
TranslateRequest     → {text, from_language, to_language}
TranslateResponse    → {translated_text, original_text, corrected_text, corrections}
NewsResponse         → {articles, query}
NewsTranslate{,Batch}{Request,Response}
GrammarCheck{Request,Response}
```

### 5.5 System Prompt (`backend/app/prompts.py`)

`build_system_prompt(native, target, user=None)` returns the LLM system prompt. When a `User` is provided it injects:

```
[USER PROFILE]
The user's name is {username}.
They are from {country}.
Their native dialect is {dialect} — match it when relevant.
Their preferred communication style is {style}. {style guidance}
Greet them by name on the very first message of a new conversation;
afterwards, address them naturally without overusing their name.
```

Style guidance differs:
- **Casual** — informal, contractions, friendly slang in dialect
- **Professional** — polite, well-structured, business register
- **Formal** — highly formal, no slang, full sentences

The prompt then asks the LLM for strict JSON: `reply`, `translated_reply`, `needs_search`, `needs_clarification`, `suggested_correction`, `correction_language`.

### 5.6 API Endpoints

#### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account, sets cookie |
| POST | `/api/auth/login` | — | Sign in (`remember=true` → 90 day cookie) |
| POST | `/api/auth/logout` | — | Clears cookie + deletes session |
| GET | `/api/auth/me` | required | Current user profile |

#### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/api/users/me` | required | Update profile |
| POST | `/api/users/me/password` | required | Change password (current required) |
| POST | `/api/users/me/voice-sample` | required | Upload .webm clip |
| GET | `/api/users/me/voice-sample` | required | Stream stored clip |
| DELETE | `/api/users/me/voice-sample` | required | Remove clip |

#### Conversations
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/conversations` | required | List newest-first |
| POST | `/api/conversations` | required | Create blank conversation |
| GET | `/api/conversations/{id}` | required | Detail + messages |
| PATCH | `/api/conversations/{id}` | required | Rename / change target |
| DELETE | `/api/conversations/{id}` | required | Delete (cascades messages) |

#### Chat & utilities
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Health check |
| POST | `/api/chat` | **required** | Chat round-trip + persistence + personalization |
| POST | `/api/transcribe` | optional | Whisper STT (uses logged-in user's dialect when present) |
| POST | `/api/translate` | — | Text translation + grammar |
| POST | `/api/check-grammar` | — | Standalone grammar check |
| GET | `/api/voices?lang=es` | — | TTS voices for a language |
| POST | `/api/tts` | — | MP3 synthesis |
| GET | `/api/news?q=…` | — | News search |
| POST | `/api/news/translate{,-batch}` | — | Translate article title + summary |

### 5.7 LLM Service

`llm_service.py` exports four async functions backed by Groq's OpenAI-compatible API:

- **`get_response(request, user=None)`** — main chat. Builds the personalized system prompt, optionally injects news search results when the user asks for news, calls Groq with `response_format=json_object`, parses the JSON, and (if `needs_search=true`) re-runs with web search context.
- **`translate_text(request)`** — single LLM call returning `translated_text`, `corrected_text`, `corrections`.
- **`translate_news_article(request)` / `translate_news_articles(batch)`** — multilingual title + summary. The batch variant packs multiple articles into one LLM call to stay under TPM limits.
- **`check_grammar(request)`** — standalone grammar check.
- **`transcribe_audio(audio, language?, dialect?)`** — Whisper. Picks the most specific prompt available:
  1. **Dialect** match (Egyptian / Levantine / Mexican / Brazilian / Quebec etc.) → casual conversational hint in that dialect.
  2. Else **language** match → casual hint in that language.
  3. Else English fallback.
  Always uses `temperature=0` and returns plain text.

### 5.8 Search Service

`search_service.py` wraps `ddgs`:
- `search_web(query, max_results)` — text search.
- `search_news(query, max_results)` — news search.

Both run `DDGS()` calls in a worker thread (`asyncio.to_thread`) with simple retry on rate-limit (HTTP 403 / "ratelimit"). Output is normalized to `{title, url, body, source, image, date}`.

### 5.9 TTS Service

`tts_service.py` wraps `edge-tts`:
- `get_voices(language_code)` — lists Edge TTS voices, optionally filtered by locale prefix.
- `synthesize_speech(text, voice)` — async Communicate → MP3 bytes.

---

## 6. Frontend

### 6.1 Pages (Next.js App Router)

| Route | Auth | What it does |
|-------|------|--------------|
| `/` | public | Landing page. Marketing hero + features + login/register CTAs. Redirects authed users to `/chat`. |
| `/login` | public | Username + password + Remember Me. Calls `/api/auth/login`. Redirects to `?next=` on success. |
| `/register` | public | All profile fields + optional voice sample. Calls `/api/auth/register`. |
| `/chat` | **authed** | Main chat dashboard. Sidebar (conversations) + ChatWindow + clarification card + ProfileBadge. |
| `/settings` | **authed** | Edit profile, change password, manage voice sample. |
| `/translate` | public | Text translation utility (unchanged from v1). |
| `/news` | public | News search utility (unchanged from v1). |

### 6.2 Middleware (Route Protection)

`frontend/src/middleware.ts` runs on every request (except static assets). It checks for the `speakly_session` cookie:
- Missing on `/chat` or `/settings` → 307 to `/login?next=<path>`.
- Present on `/login` or `/register` → 307 to `/chat`.

The middleware is "presence-only" — actual session validity is enforced by the backend's `get_current_user`.

### 6.3 Components

| Component | Role |
|-----------|------|
| `ChatWindow.tsx` | Slot-based chat panel. Accepts `headerLeft`, `headerRight`, all chat callbacks, voice picker. Renders messages + input + lock toggle + status text + clarification card. |
| `ChatMessage.tsx` | Bilingual bubble. Top: original content (user: native, assistant: target). Bottom: translation (user: target, assistant: native). Pending state shows bouncing dots; failure shows "translation unavailable" in native. RTL via `dir="auto"`. |
| `ClarificationCard.tsx` | Floating "Did you mean…?" card above the input. Shows the suggested rewrite + 🔊 listen button + Yes/No buttons. Localized via `getStrings(nativeLanguage)`. |
| `CorrectionCard.tsx` | Legacy grammar correction display. Still used by Translate page. |
| `CloudVoiceSelector.tsx` | Dropdown of TTS voices. |
| `LanguageSelector.tsx` | Used by Translate page only (chat reads the language from profile). |
| `Flag.tsx` | Country flag image via flagcdn.com. |
| `auth/AuthShell.tsx` | Shared layout for login + register pages (header, card, alt link). |
| `auth/PasswordField.tsx` | Password input with show/hide toggle. |
| `chat/ConversationSidebar.tsx` | Left sidebar: conversation list, "New chat" button, click-to-load, hover-to-delete. |
| `chat/ProfileBadge.tsx` | Avatar + dropdown (Settings / dark theme toggle / Logout). |
| `voice/VoiceSampleRecorder.tsx` | Record / Stop / Replay / Re-record buttons. Used in registration + settings. |

### 6.4 Hooks

- **`useAuth.tsx`** — Context provider in root layout. Calls `apiMe()` on mount to bootstrap from cookie. Exposes `{user, loading, isAuthenticated, login, register, logout, refresh, setUser}`.
- **`useConversations.ts`** — Sidebar list state. Fetches `/api/conversations` on mount. Exposes `{conversations, current, currentId, select, create, rename, remove, refresh, touch}`. `touch()` updates the local sidebar without a round-trip after a chat turn.
- **`useChat.ts`** — Chat round-trip + clarification flow. Takes `{nativeLanguage, targetLanguage, conversationId, seedMessages, onConversationCreated, onTurnPersisted}`. When `conversationId` changes, replaces local state with seed messages. Sends with cookie credentials. Manages clarification suggestion + accept/dismiss.
- **`useSpeechRecognition.ts`** — MediaRecorder wrapper. Constraints: mono 16 kHz with echo cancellation + noise suppression + auto gain. 32 kbps Opus. Exposes `{isListening, isTranscribing, isCheckingGrammar, recordingSeconds, isSupported, error, speechCorrection, startListening, stopListening, clearSpeechCorrection}`. `startListening(language, onResult, {skipGrammarCheck})`: language `null` = Whisper auto-detect, language present = pin language.

### 6.5 API Clients

- **`lib/api.ts`** — chat (`sendMessage` with `conversation_id`), translate, news, voices, TTS (`speakCloud` with single shared `Audio` instance + `stopCloud` to cancel), grammar check, transcribe (sends `dialect` form field). All requests include `credentials: "include"` so cookies travel.
- **`lib/auth-api.ts`** — register, login, logout, me, profile update, password change, voice sample upload/delete.
- **`lib/conversations-api.ts`** — list / get / create / rename / delete.

### 6.6 Strings (i18n)

`lib/strings.ts` is a `Record<Language, UIStrings>` map covering all 10 languages. `getStrings(language)` returns the right set, falling back to English when `language` is null. Currently keyed:
- Clarification card labels
- Listen aria-label
- "translation unavailable"
- Status text (Thinking / Speaking / Listening / Idle)
- Stop-speaking aria-label
- Sidebar (New chat, No conversations yet, Delete conversation)
- Profile menu (Settings, Logout)
- Conversation empty state

### 6.7 Types

`types/index.ts` defines `ChatMessage`, `Correction`, `ChatNewsArticle`, `Language`, `LANGUAGE_CODES` (BCP-47), `LANGUAGE_COUNTRY_CODES` (ISO 3166), and the canonical `LANGUAGES` array.

---

## 7. End-to-End Data Flows

### 7.1 Authed Chat Round-Trip

```
1. User types "كيف حالك"
2. useChat.sendMessage adds optimistic user message (status: pending)
3. translateUserMessage fires in parallel (native → target translation)
4. apiSendMessage POSTs /api/chat with conversation_id + history (last 20)
5. Cookie travels automatically (credentials: include)
6. FastAPI Depends(get_current_user) validates session, returns User
7. If conversation_id is null, create a new Conversation row
8. llm_service.get_response builds personalized system prompt, calls Groq
9. conversations.append_messages persists user + assistant messages
10. conversations.auto_title_if_needed sets title from first message
11. Response returned: reply + translated_reply + conversation_id
12. useChat appends assistant message + speaks reply via Edge TTS
13. useConversations.touch() updates sidebar order + preview
```

### 7.2 Voice Pipeline

```
1. User taps mic
2. useSpeechRecognition.startListening(hint, onResult, {skipGrammarCheck:true})
   - hint = lockToNative ? user.language : null  (Auto = null)
3. getUserMedia({audio: {echoCancellation, noiseSuppression, autoGainControl,
                         channelCount: 1, sampleRate: 16000}})
4. MediaRecorder({audioBitsPerSecond: 32000})
5. recordingSeconds ticks every 250 ms (live timer in UI)
6. On stop → POST /api/transcribe (multipart: audio + language? + dialect?)
7. main.transcribe uses get_optional_user; effective_dialect = user.dialect || form.dialect
8. llm_service.transcribe_audio picks dialect prompt > language prompt > English
9. Whisper-large-v3 returns transcript text
10. transcript piped into chat.sendMessage → standard chat round-trip
```

### 7.3 Auth Lifecycle

```
Register / Login → backend creates Session row + sets HttpOnly cookie
       ↓
useAuth on app mount → calls /api/auth/me with cookie
       ↓
On 200, AuthProvider stores user; on 401, sets user=null
       ↓
Middleware (every page request) checks cookie presence:
  - missing on /chat or /settings → redirect to /login
  - present on /login or /register → redirect to /chat
       ↓
Logout → POST /api/auth/logout deletes Session row + clears cookie
```

---

## 8. Database Schema

```
users
├── user_id              INTEGER PK AUTOINCREMENT
├── username             VARCHAR(64) UNIQUE NOT NULL  (indexed)
├── email                VARCHAR(255)
├── password_hash        VARCHAR(255) NOT NULL        (bcrypt-12)
├── country              VARCHAR(64)
├── language             VARCHAR(32) NOT NULL DEFAULT 'English'
├── dialect              VARCHAR(64)
├── communication_style  VARCHAR(32) NOT NULL DEFAULT 'Casual'
├── target_language      VARCHAR(32) NOT NULL DEFAULT 'English'
├── voice_sample_path    VARCHAR(255)
└── created_at           DATETIME WITH TZ

sessions
├── session_id           VARCHAR(64) PK    (random URL-safe token; also the cookie value)
├── user_id              INTEGER FK → users(user_id) ON DELETE CASCADE  (indexed)
├── login_timestamp      DATETIME WITH TZ
├── expires_at           DATETIME WITH TZ
└── last_seen_at         DATETIME WITH TZ

conversations
├── conversation_id      INTEGER PK AUTOINCREMENT
├── user_id              INTEGER FK → users(user_id) ON DELETE CASCADE  (indexed)
├── title                VARCHAR(120) NOT NULL DEFAULT 'New chat'
├── target_language      VARCHAR(32) NOT NULL DEFAULT 'English'
├── created_at           DATETIME WITH TZ
└── updated_at           DATETIME WITH TZ  (manually bumped after each message)
        composite index ix_conversations_user_updated (user_id, updated_at DESC)

messages
├── message_id           INTEGER PK AUTOINCREMENT
├── conversation_id      INTEGER FK → conversations(conversation_id) ON DELETE CASCADE  (indexed)
├── role                 VARCHAR(16) NOT NULL    ('user' | 'assistant')
├── content              TEXT NOT NULL
├── translated_content   TEXT                    (cached for bilingual replay)
└── timestamp            DATETIME WITH TZ
```

---

## 9. Personalization Details

The user profile feeds into three places:

1. **Chat system prompt** — the bot is told the user's name, country, dialect, and style. It greets by name on the first message of a conversation and matches the requested register.
2. **Whisper transcription** — `/api/transcribe` uses the authenticated user's `dialect` field to pick a dialect-specific prompt for Whisper, dramatically improving recognition of colloquial speech.
3. **UI language** — every label rendered through `getStrings(user.language)` localizes to the native language: status text, sidebar labels, clarification card, settings buttons, etc.

Style guidance maps:

| Style | Guidance injected into system prompt |
|---|---|
| Casual | Informal contractions, friendly slang appropriate to dialect, warm tone. |
| Professional | Polite, well-structured, business-friendly register, helpful and direct. |
| Formal | Highly formal, no slang, full sentences, polite vocative forms. |

Dialect → Whisper-prompt examples:

| Dialect substring | Whisper prompt |
|---|---|
| egyptian | "محادثة باللهجة المصرية، كلام يومي عادي. إيه أخبارك؟ عامل إيه النهاردة؟" |
| levantine | "محادثة باللهجة الشامية، كلام يومي عادي. شو أخبارك؟ كيفك اليوم؟" |
| gulf / khaleeji | "محادثة باللهجة الخليجية. شلونك اليوم؟ شخبارك؟" |
| maghrebi / moroccan | "محادثة باللهجة المغربية. كيداير؟ لاباس عليك؟" |
| iraqi | "محادثة باللهجة العراقية. شلونك اليوم؟ شكو ماكو؟" |
| mexican | "Una plática casual en español, ¿qué onda? ¿Cómo te va hoy?" |
| argentinian | "Una charla casual en español, ¿qué hacés? ¿Cómo andás hoy?" |
| castilian | "Una conversación casual en español, ¿qué tal? ¿Cómo estás hoy?" |
| brazilian | "Uma conversa casual em português, e aí, beleza? Como você está hoje?" |
| european portuguese | "Uma conversa casual em português, tudo bem? Como estás hoje?" |
| quebec | "Une conversation décontractée en français, comment ça va aujourd'hui ?" |
| british / american / australian | English variants of casual greeting. |

Substring matching means "Egyptian Arabic" picks the egyptian prompt, "Mexican Spanish" picks the mexican prompt, etc.

---

## 10. Supported Languages & Dialects

10 languages, each with a BCP-47 code and an ISO 3166-1 country code (used for flag images):

| Language | LANGUAGE_CODES | LANGUAGE_COUNTRY_CODES | Suggested dialects (optional) |
|----------|---------------|-------------------------|-------------------------------|
| Spanish | es-ES | es | Mexican, Castilian, Argentinian, Colombian |
| French | fr-FR | fr | European French, Quebec French |
| German | de-DE | de | Standard, Austrian, Swiss |
| Italian | it-IT | it | Standard, Sicilian |
| Portuguese | pt-BR | br | Brazilian, European Portuguese |
| Japanese | ja-JP | jp | Standard |
| Korean | ko-KR | kr | Standard |
| Arabic | ar-SA | sa | Egyptian, Levantine, Gulf, Maghrebi, Iraqi, MSA |
| Chinese | zh-CN | cn | Mandarin, Cantonese |
| English | en-US | us | American, British, Australian, Canadian, Indian |

Dialect is a free-text field; the suggestions are autocomplete only.

---

## 11. Running the Project Locally

### Prerequisites
- Python 3.12+
- Node.js 18+
- Groq API Key (free tier works) → https://console.groq.com/keys

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate           # macOS/Linux
# .venv\Scripts\activate.ps1        # Windows PowerShell
pip install --upgrade pip
pip install -r requirements.txt

echo "GROQ_API_KEY=your-key-here" > .env

python -m uvicorn app.main:app --reload --port 8000
```

The DB and voice samples directory are auto-created. No migration step.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` and click **Get started**.

---

## 12. Environment Variables

### backend/.env
| Var | Required | Default | Notes |
|---|---|---|---|
| `GROQ_API_KEY` | yes | — | Free tier sufficient |
| `CHAT_MODEL` | no | `openai/gpt-oss-120b` | Override Groq chat model |
| `WHISPER_MODEL` | no | `whisper-large-v3` | Override Whisper variant (`-turbo` for cheaper/faster) |
| `COOKIE_SECURE` | no | `false` | Set `true` behind HTTPS |
| `CORS_ORIGINS` | no | `["http://localhost:3000"]` | JSON list |

### frontend/.env.local
| Var | Required | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | no | `http://localhost:8000` |

---

## 13. Security Model

- **Passwords**: bcrypt with 12 rounds. Never logged, never returned in API responses.
- **Sessions**: server-side rows, cookie value is the random session token (32 bytes URL-safe ≈ 256 bits entropy).
- **Cookie attributes**: `HttpOnly` (no JS access), `SameSite=Lax` (CSRF mitigation for state-changing requests from third-party origins), `Secure` when configured.
- **Login timing**: always runs `bcrypt.checkpw` against either the real hash or a placeholder, mitigating username-enumeration timing attacks.
- **Voice samples**: capped at 2 MB. Stored as files outside the public web tree, served only via authenticated endpoint.
- **CORS**: limited to `http://localhost:3000` by default. `allow_credentials=True` requires an explicit origin (no wildcard).
- **History cap**: frontend trims to last 20 messages before sending — bounds Groq token spend per request.

---

## 14. Troubleshooting

### "Cannot find the middleware module" / 500 on every page
Next.js needs a clean rebuild after adding/changing `middleware.ts`. Stop dev server, delete `frontend/.next/`, restart.

### Backend exits silently on startup
- Check `email-validator` installed (needed for `EmailStr` in registration schema).
- Check `greenlet` installed (required by SQLAlchemy 2.0 async).
- Both are in `requirements.txt`; if missing, run `pip install -r requirements.txt` again.

### Whisper transcribes Arabic as gibberish English
Click the **🌐 Auto / 🔒 lock** toggle next to the status text in `/chat` to lock the mic to your native language. Auto-detect occasionally picks the wrong language on short clips.

### `ahmed` user from previous test still in DB
```
sqlite3 backend/data/speakly.db "DELETE FROM users WHERE username='ahmed';"
```
(Cascades will wipe their sessions, conversations, messages.)

### Port 8000 already in use
Find and stop the conflicting process: `lsof -ti :8000 | xargs kill`. Or override the Speakly backend port: `uvicorn ... --port 8001` and set `NEXT_PUBLIC_API_URL=http://localhost:8001` for the frontend.

### Microphone access denied
Browser-level permission. Check the address bar lock icon → site settings → allow microphone.

---

## 15. Extending Speakly

Common next steps and where to start:

| Goal | Where to look |
|---|---|
| Add another LLM provider | `services/llm_service.py` — swap the OpenAI client base URL + model name. |
| Add a new locale | `lib/strings.ts` (UI labels), `types/index.ts` (LANGUAGE_CODES + LANGUAGES), `services/llm_service.py` (`_WHISPER_PROMPTS`). |
| Add a new dialect | `services/llm_service.py` (`_DIALECT_PROMPTS`), `app/register/page.tsx` (`DIALECT_SUGGESTIONS`). |
| Stream responses token-by-token | `services/llm_service.py` (`_call_llm` returns the full string today; switch to streaming Groq) + `lib/api.ts` (consume SSE/fetch stream) + `useChat.ts` (incremental setMessages). |
| Email verification / password reset | New `app/users/router.py` endpoints, transactional email provider. |
| OAuth (Google etc.) | New `app/auth/oauth_router.py`, redirect flow, link accounts via `users.email`. |
| Multi-device session UI | List `Session` rows for current user, add a revoke endpoint. |
| Production deployment | Set `COOKIE_SECURE=true`, set `CORS_ORIGINS` to your real frontend origin, swap SQLite for Postgres (change `DATABASE_URL` in `db.py`, install `asyncpg`). |
