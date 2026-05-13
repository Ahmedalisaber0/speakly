# Speakly — Project Architecture & Design

## Overview

Speakly v2 is a **personalized AI voice assistant** built as a full-stack web app with persistent state. Users register, log in, and get an assistant that remembers them, speaks their dialect, matches their tone, and saves every conversation. The system is split into **5 main layers**.

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                            USER                                  │
│                  (Browser - localhost:3000)                      │
└──────────────────────────────────┬───────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                    LAYER 1: PRESENTATION                         │
│            (Next.js 16 / React 19 / Tailwind 4)                  │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Landing  │ │  Login   │ │ Register │ │   Chat   │ │Settings│ │
│  │   /      │ │ /login   │ │/register │ │  /chat   │ │/sett.. │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐                                      │
│  │Translate │ │   News   │     ← public utilities                │
│  └──────────┘ └──────────┘                                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                middleware.ts (route protection)            │  │
│  │   /chat /settings → /login   ▪   /login when authed → /chat │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  Shared Components                         │  │
│  │  ChatWindow │ ChatMessage │ ClarificationCard              │  │
│  │  ConversationSidebar │ ProfileBadge │ VoiceSampleRecorder  │  │
│  │  AuthShell │ PasswordField │ Flag │ CloudVoiceSelector     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  Hooks & API Clients                       │  │
│  │  useAuth │ useConversations │ useChat │ useSpeechRecognition│  │
│  │  api.ts │ auth-api.ts │ conversations-api.ts │ strings.ts  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬───────────────────────────────┘
                                   │  HTTPS  (cookie: speakly_session)
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                  LAYER 2: API GATEWAY (FastAPI)                  │
│                      localhost:8000                              │
│                                                                  │
│  ┌──────────────────────┐    ┌──────────────────────────────┐    │
│  │   Auth router        │    │   Users router               │    │
│  │ /api/auth/register   │    │ PATCH /api/users/me          │    │
│  │ /api/auth/login      │    │ POST  /api/users/me/password │    │
│  │ /api/auth/logout     │    │ POST  /api/users/me/voice…   │    │
│  │ /api/auth/me         │    │ GET   /api/users/me/voice…   │    │
│  └──────────┬───────────┘    └──────────┬───────────────────┘    │
│             │                            │                       │
│  ┌──────────┴────────────┐    ┌──────────┴───────────────────┐   │
│  │ Conversations router  │    │  Chat & utility endpoints    │   │
│  │ GET    /api/conv…     │    │ POST /api/chat (authed)      │   │
│  │ POST   /api/conv…     │    │ POST /api/transcribe         │   │
│  │ GET    /api/conv…/{id}│    │ POST /api/translate          │   │
│  │ PATCH  /api/conv…/{id}│    │ GET  /api/voices             │   │
│  │ DELETE /api/conv…/{id}│    │ POST /api/tts                │   │
│  └───────────┬───────────┘    │ GET  /api/news               │   │
│              │                │ POST /api/news/translate{,-batch}│
│              │                │ POST /api/check-grammar      │   │
│              │                └────────────┬─────────────────┘   │
│              │                             │                     │
│  ┌───────────┴─────────────────────────────┴────────────────┐    │
│  │   FastAPI Dependencies                                   │    │
│  │   get_db (async session) │ get_current_user │ optional    │    │
│  └──────────────────────────┬──────────────────────────────┘     │
└─────────────────────────────┼────────────────────────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
┌───────────────┐  ┌───────────────────┐  ┌──────────────────────┐
│ LAYER 3: DATA │  │ LAYER 4: SERVICES │  │ LAYER 5: EXTERNAL    │
│   (SQLite)    │  │ (Business logic)  │  │   (3rd-party APIs)   │
│               │  │                   │  │                      │
│ users         │  │ llm_service       │──▶ Groq API (LLM)        │
│ sessions      │  │ ├─ chat (authed,  │  │  ├─ chat completions │
│ conversations │  │ │  personalized)  │  │  └─ Whisper STT      │
│ messages      │  │ ├─ translate      │  │                      │
│               │  │ ├─ grammar check  │  │ DuckDuckGo (ddgs)    │
│ voice_samples │  │ ├─ news translate │──▶ ├─ web search        │
│  /<user>.webm │  │ └─ transcribe     │  │  └─ news search      │
│               │  │                   │  │                      │
│ bcrypt-hashed │  │ search_service    │──┤                      │
│  passwords    │  │ tts_service       │──▶ Microsoft Edge TTS   │
│  + sessions   │  │ auth.service      │  │                      │
│  in tables    │  │  (bcrypt + tokens)│  │                      │
└───────────────┘  └───────────────────┘  └──────────────────────┘
```

---

## The 5 Layers Explained

### Layer 1: Presentation (Frontend)

**Technology:** Next.js 16 (App Router + Turbopack), React 19, TypeScript 5, Tailwind CSS 4

**Responsibility:** Everything the user sees + auth-protected routing.

```
frontend/src/
├── middleware.ts                  → Route protection (cookie presence check)
├── app/
│   ├── page.tsx                   → Landing page (public)
│   ├── login/page.tsx
│   ├── register/page.tsx          → Profile + optional voice sample
│   ├── chat/page.tsx              → Authed chat (sidebar + window + clarification card)
│   ├── settings/page.tsx          → Profile / password / voice sample
│   ├── translate/                 → Public translate page
│   └── news/                      → Public news page
├── components/
│   ├── ChatWindow.tsx             → Slot-based chat panel
│   ├── ChatMessage.tsx            → Bilingual bubbles + news cards
│   ├── ClarificationCard.tsx      → "Did you mean…?" floating card
│   ├── auth/{AuthShell,PasswordField}.tsx
│   ├── chat/{ConversationSidebar,ProfileBadge}.tsx
│   └── voice/VoiceSampleRecorder.tsx
├── hooks/
│   ├── useAuth.tsx                → AuthProvider + login/register/logout/refresh
│   ├── useConversations.ts        → Sidebar list + selection + create/delete
│   ├── useChat.ts                 → Messages, clarification flow, conversation_id
│   └── useSpeechRecognition.ts    → MediaRecorder + Whisper hint + recording timer
└── lib/
    ├── api.ts                     → Cookie-credentialed fetch + history cap + stopCloud
    ├── auth-api.ts                → /api/auth + /api/users client
    ├── conversations-api.ts       → /api/conversations client
    └── strings.ts                 → 11 localized labels × 10 languages
```

---

### Layer 2: API Gateway (FastAPI)

**Technology:** FastAPI + Pydantic + async dependencies

**Responsibility:** Receives HTTP requests, validates with Pydantic, gates with auth, dispatches to services or DB.

Routers are mounted from `app/{auth,users,conversations}/router.py` and the chat/utility endpoints live directly on `app/main.py`.

**Auth dependency wiring:**
```
Request with cookie
       │
       ▼
get_current_user / get_optional_user (deps.py)
       │
       ├─ reads `speakly_session` cookie
       ├─ looks up Session row in DB
       ├─ checks expiry, bumps last_seen_at
       └─ returns User (or 401)
       ▼
Endpoint receives an authenticated User instance
```

---

### Layer 3: Data (SQLite + voice file storage)

**Technology:** SQLAlchemy 2.0 (async) + aiosqlite

**Responsibility:** Persist all user state. Tables auto-created at boot via `Base.metadata.create_all()`.

```
backend/data/
├── speakly.db                ← SQLite database file (4 tables)
└── voice_samples/<user_id>.webm   ← Optional voice clip per user
```

**Tables:**
```
users          (1)─┬─(N) sessions
                   │
                   ├─(N) conversations  (1)─(N) messages
                   │
                   └── voice_sample_path → file on disk
```

| Table | Key columns |
|---|---|
| `users` | `user_id`, `username` UNIQUE, `password_hash`, `country`, `language`, `dialect`, `communication_style`, `target_language`, `voice_sample_path`, `created_at` |
| `sessions` | `session_id` (random URL-safe token, also the cookie value), `user_id`, `expires_at`, `last_seen_at` |
| `conversations` | `conversation_id`, `user_id`, `title`, `target_language`, `created_at`, `updated_at` |
| `messages` | `message_id`, `conversation_id`, `role`, `content`, `translated_content`, `timestamp` |

All FKs are `ON DELETE CASCADE`, so deleting a user wipes their sessions, conversations, and messages.

---

### Layer 4: Services (Business Logic)

**Technology:** Python, OpenAI SDK (Groq), `ddgs`, `edge-tts`, `bcrypt`

```
services/
├── llm_service.py      → Brain (chat, translate, grammar, transcribe)
├── search_service.py   → Eyes (web + news)
└── tts_service.py      → Voice (Edge TTS)
auth/
└── service.py          → Password hashing + session token CRUD
```

#### LLM Service — personalized chat flow

```
User Message + authed User profile
       │
       ▼
build_system_prompt(native, target, user)
       │  injects name, country, dialect, style guidance
       ▼
┌─────────────────┐    YES    ┌───────────────────┐
│ News keywords?  │─────────→│ DuckDuckGo News   │
└────────┬────────┘           └─────────┬─────────┘
         │ NO                           │
         ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│  Call Groq LLM   │          │ Call LLM with    │
│  (json_object)   │          │ news context     │
└────────┬─────────┘          └──────────────────┘
         │
         ▼
┌─────────────────────┐  needs_search=true   ┌──────────────┐
│ Parse JSON response │ ────────────────────▶│  Web search  │
└────────┬────────────┘                      └──────┬───────┘
         │                                          ▼
         │                                  ┌──────────────────┐
         │                                  │ Retry LLM with   │
         │                                  │ web context      │
         │                                  └──────┬───────────┘
         ▼                                         ▼
┌────────────────────────────────────────────────────────────┐
│  Return ChatResponse                                       │
│   reply (target lang) + translated_reply (native lang)     │
│   + needs_clarification + suggested_correction             │
│   + news_articles + conversation_id                        │
└────────────────────────────────────────────────────────────┘
```

#### Whisper Service — dialect-aware

`transcribe_audio(audio, language, dialect)` picks the most specific prompt:
1. **Dialect match** (Egyptian, Levantine, Mexican, Brazilian, Quebec, etc.) → dialect-specific casual conversational hint in that dialect.
2. **Language match** → casual hint in that language.
3. **Auto-detect** → English fallback hint, no language pin (Whisper detects).

The `/api/transcribe` endpoint uses `get_optional_user` so authed users automatically get their profile dialect; guests fall back to whatever the form sends.

---

### Layer 5: External APIs

| Service | Purpose | How Used |
|---------|---------|----------|
| **Groq API** | LLM inference + Whisper STT | OpenAI SDK with Groq base URL (chat) and `audio.transcriptions.create` (Whisper) |
| **DuckDuckGo** | Web + news search | `ddgs` Python package |
| **Microsoft Edge TTS** | Cloud TTS voices | `edge-tts` Python package |
| **Web Speech API (browser)** | Fallback browser TTS | Built into Chrome/Edge |

---

## Auth & Session Flow

```
1. User submits POST /api/auth/login {username, password, remember}
                       │
2. auth/router.login   │ Look up User by username
                       │ bcrypt.checkpw(plain, password_hash)
                       ▼
3. auth.service        │ Generate 32-byte URL-safe token
                       │ Insert Session row (expires_at = now + 30/90 days)
                       ▼
4. response.set_cookie │ HttpOnly + SameSite=Lax + Secure (in prod)
                       │  speakly_session=<token>; Max-Age=…
                       ▼
5. Browser holds cookie. Every subsequent request:
                       │
6. get_current_user    │ Reads cookie → looks up Session row
                       │ Checks expires_at, bumps last_seen_at
                       │ Returns User → endpoint runs
                       │ (or raises 401 → frontend redirects to /login)
```

`POST /api/auth/logout` deletes the session row and clears the cookie. `GET /api/auth/me` returns the current `User` shape consumed by the frontend `useAuth` provider on every page load.

---

## Data Flow — Authed Chat Round-Trip

```
1. User types "كيف حالك" (Arabic)
                          │
2. useChat.sendMessage    │  optimistic add to messages[]
                          │  parallel-fire translateUserMessage
                          ▼
3. api.sendMessage        │  POST /api/chat
                          │  body: { message, native, target,
                          │          conversation_id, history (last 20) }
                          │  cookie: speakly_session
                          ▼
4. main.chat (FastAPI)    │  Depends(get_current_user) → User
                          │  Depends(get_db) → AsyncSession
                          ▼
5. If conversation_id is null → create Conversation row
                          ▼
6. llm_service.get_response│  build_system_prompt(user) injects profile
                          │  Groq LLM call (json_object mode)
                          ▼
7. conversations.append_messages
                          │  Insert (user_message, assistant_message)
                          │  Bump conversation.updated_at
                          ▼
8. conversations.auto_title_if_needed
                          │  If title is "New chat", set to first 40 chars
                          ▼
9. Return ChatResponse    │  reply + translated_reply + conversation_id …
                          ▼
10. useChat receives      │  Append assistant message
                          │  Latch onto conversation_id (if newly created)
                          │  Notify useConversations.touch() → sidebar resorts
                          ▼
11. ChatWindow re-renders │  Bilingual bubbles (target top, native below)
                          ▼
12. speakReply()          │  Edge TTS → /api/tts → MP3 → <audio>.play()
                          ▼
13. User hears reply, sees both languages, conversation persisted
```

---

## Voice Pipeline

```
User taps mic
     │
     ▼
useSpeechRecognition.startListening(hint, onResult, {skipGrammarCheck:true})
     │   hint = lockToNative ? user.language : null  (Auto = null)
     ▼
getUserMedia({audio: {echoCancellation, noiseSuppression, autoGainControl,
                       channelCount: 1, sampleRate: 16000}})
     ▼
MediaRecorder({audioBitsPerSecond: 32000, mimeType: best-supported})
     │   recordingSeconds ticks every 250 ms (live timer in UI)
     ▼
On stop → POST /api/transcribe (multipart: audio + language? + dialect?)
                       │
                       ▼
  llm_service.transcribe_audio(language, dialect)
                       │
                       │  Pick prompt: dialect-specific > language > English
                       │  e.g. "Egyptian Arabic" → "محادثة باللهجة المصرية…"
                       │
                       ▼
  Groq Whisper (whisper-large-v3, response_format=text, temperature=0)
                       │
                       ▼
       transcript text returned
                       │
                       ▼
chat.sendMessage(transcript)  → standard chat round-trip
```

---

## Frontend Route Map

```
PUBLIC                                    AUTHED-ONLY
─────────────────────────                ─────────────────────────
/                  Landing                /chat       Chat dashboard
/login             Sign in                /settings   Profile + pw + voice
/register          Sign up
/translate         Translate text
/news              Search news

middleware.ts:
  - if cookie missing on /chat or /settings → 307 → /login?next=…
  - if cookie present on /login or /register → 307 → /chat
```

---

## Configuration

```
backend/.env
├── GROQ_API_KEY                 → Required: Groq API key (chat + Whisper)
├── CHAT_MODEL                   → Optional: default openai/gpt-oss-120b
├── WHISPER_MODEL                → Optional: default whisper-large-v3
├── COOKIE_SECURE                → Set true behind HTTPS in prod
└── CORS_ORIGINS                 → Optional: default ["http://localhost:3000"]

frontend/.env.local
└── NEXT_PUBLIC_API_URL          → Optional: default http://localhost:8000
```

The `backend/data/` directory + `speakly.db` + `voice_samples/` are created automatically on first boot — no manual setup, no migrations.
