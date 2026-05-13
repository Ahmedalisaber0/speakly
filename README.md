# Speakly

A personalized AI voice assistant for language practice. Sign up, tell Speakly your dialect and style, and chat with an AI that remembers you, persists every conversation, speaks your target language, and translates your messages live in both directions.

## Features

### Personalized AI assistant
- **Accounts** — register, login, logout, change password, edit profile, optional voice sample.
- **Personalized chat** — bot greets you by name and matches your declared communication style (Casual / Professional / Formal).
- **Dialect-aware speech recognition** — Whisper is biased with a dialect-specific prompt (Egyptian / Levantine / Mexican / Brazilian / Quebec / etc.) for noticeably better transcription of colloquial speech.
- **Conversation history** — every chat is saved to your account; sidebar lists all conversations newest-first with auto-titles, search-friendly previews, rename, and delete.

### Chat features
- **Bilingual bubbles** — every message shows your native language stacked with the target language translation, both visible at once. No clicking required.
- **Clarification card** — when the bot can't understand a garbled message, a floating card asks "Did you mean…?" with a TTS speaker, "Yes, send" / "No, dismiss" buttons.
- **Voice input** — mic uses your dialect by default; toggle between **🌐 Auto-detect** and **🔒 lock to native** mode. Live recording timer.
- **Stop-speaking** — cut off long TTS playback with the in-line stop button.
- **Localized UI** — every label, status, and prompt rendered in your native language across all 10 supported languages.

### Public utilities (no account needed)
- **Translate** — text translation between 10 languages with grammar checking.
- **News Search** — DuckDuckGo news with translated titles and summaries.

### Polish
- **Dark mode** with manual toggle (persisted to localStorage), respects OS preference by default.
- **HttpOnly secure cookie** sessions, bcrypt-12 password hashing, server-side session table.
- **SQLite** auto-bootstrapped — no migration step.

## Supported Languages

Spanish · French · German · Italian · Portuguese · Japanese · Korean · Arabic · Chinese · English

## Tech Stack

### Backend
- **FastAPI** — async Python API framework
- **SQLAlchemy 2.0** + **aiosqlite** — async ORM over SQLite
- **bcrypt** — password hashing (12 rounds)
- **Groq API** — LLM inference (chat, translation, grammar) + Whisper (speech-to-text)
- **Edge TTS** — Microsoft text-to-speech voices
- **DuckDuckGo Search** (`ddgs`) — web and news search

### Frontend
- **Next.js 16** (App Router + Turbopack) with **React 19**
- **TypeScript 5**
- **Tailwind CSS 4** with CSS-variable themed light/dark mode
- **MediaRecorder API** for browser audio capture (16 kHz mono opus, with echo/noise cancellation)
- HttpOnly cookie auth, route-protection middleware

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- [Groq API Key](https://console.groq.com/keys) (free tier works fine)

### ⚠️ Windows PowerShell Setup (Required)
If you're on Windows and encounter the error: `npm.ps1 cannot be loaded because running scripts is disabled on this system`

Run this in PowerShell **as Administrator**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Alternatively, you can use **Command Prompt (cmd)** instead of PowerShell.

### 1. Clone the repo

```bash
git clone https://github.com/your-username/speakly.git
cd speakly
```

### 2. Setup Backend

```bash
cd backend
```

#### Create a virtual environment

**macOS / Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Windows (PowerShell):**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**Windows (cmd):**
```cmd
python -m venv .venv
.venv\Scripts\activate.bat
```

#### Install dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### Configure environment variables

Create a `.env` file in the `backend/` directory:

```
GROQ_API_KEY=your-groq-api-key-here
```

Optional overrides:
```
CHAT_MODEL=openai/gpt-oss-120b
WHISPER_MODEL=whisper-large-v3
COOKIE_SECURE=false        # set true behind HTTPS in prod
CORS_ORIGINS=["http://localhost:3000"]
```

#### Start the backend server

```bash
python -m uvicorn app.main:app --reload --port 8000
```

The SQLite database (`backend/data/speakly.db`) and the voice-sample directory (`backend/data/voice_samples/`) are created automatically on first boot — **no migration step needed**.

> 💡 To leave the virtual environment later, run `deactivate`.

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser

- **http://localhost:3000** — Speakly app (landing page)
- **http://localhost:8000/docs** — Interactive API documentation (Swagger UI)

### 5. First-run flow

1. Click **Get started** on the landing page
2. Fill in your profile (username, password, country, native language, dialect, communication style, target language). Voice sample is optional.
3. You're auto-logged-in and dropped into `/chat`
4. Type or tap the mic — the bot replies in your target language and saves the conversation

## Project Structure

```
speakly/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entrypoint, lifespan, /chat & /transcribe
│   │   ├── config.py                # Settings (env, cookie, data_dir)
│   │   ├── db.py                    # Async SQLAlchemy engine
│   │   ├── deps.py                  # get_current_user / get_optional_user
│   │   ├── models.py                # Request/response Pydantic schemas
│   │   ├── models_db.py             # SQLAlchemy ORM models (User/Session/Conversation/Message)
│   │   ├── prompts.py               # Personalized chat system prompt
│   │   ├── auth/
│   │   │   ├── service.py           # bcrypt + session token CRUD
│   │   │   └── router.py            # /api/auth/{register,login,logout,me}
│   │   ├── users/
│   │   │   └── router.py            # /api/users/me (profile, password, voice sample)
│   │   ├── conversations/
│   │   │   └── router.py            # /api/conversations CRUD + persistence helpers
│   │   └── services/
│   │       ├── llm_service.py       # Groq chat/translate/grammar + dialect-aware Whisper
│   │       ├── search_service.py    # DuckDuckGo web/news
│   │       └── tts_service.py       # Edge TTS voices
│   ├── data/                        # auto-created
│   │   ├── speakly.db               # SQLite database
│   │   └── voice_samples/           # uploaded user voice clips
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx             # Landing page (public)
    │   │   ├── login/page.tsx       # Login form
    │   │   ├── register/page.tsx    # Register + profile form
    │   │   ├── chat/page.tsx        # Authed chat dashboard (sidebar + chat)
    │   │   ├── settings/page.tsx    # Profile, password, voice sample
    │   │   ├── translate/           # Public translate page (unchanged)
    │   │   └── news/                # Public news page (unchanged)
    │   ├── components/
    │   │   ├── ChatWindow.tsx       # Slot-based chat panel
    │   │   ├── ChatMessage.tsx      # Bilingual message bubbles + news cards
    │   │   ├── ClarificationCard.tsx # "Did you mean…?" floating card
    │   │   ├── CorrectionCard.tsx   # Grammar correction card (legacy fallback)
    │   │   ├── CloudVoiceSelector.tsx
    │   │   ├── LanguageSelector.tsx # Used by translate page
    │   │   ├── Flag.tsx             # Country flag images
    │   │   ├── auth/
    │   │   │   ├── AuthShell.tsx    # Shared register/login layout
    │   │   │   └── PasswordField.tsx
    │   │   ├── chat/
    │   │   │   ├── ConversationSidebar.tsx
    │   │   │   └── ProfileBadge.tsx # Avatar + Settings/Logout/Theme toggle
    │   │   └── voice/
    │   │       └── VoiceSampleRecorder.tsx
    │   ├── hooks/
    │   │   ├── useAuth.tsx          # AuthProvider + login/register/logout
    │   │   ├── useChat.ts           # Chat state + clarification flow
    │   │   ├── useConversations.ts  # Sidebar list + selection
    │   │   └── useSpeechRecognition.ts # Mic + recording timer + dialect hint
    │   ├── lib/
    │   │   ├── api.ts               # Chat/translate/voices/TTS/transcribe + cookie creds
    │   │   ├── auth-api.ts          # /api/auth + /api/users client
    │   │   ├── conversations-api.ts # /api/conversations client
    │   │   └── strings.ts           # i18n labels for all 10 languages
    │   ├── types/
    │   │   └── index.ts             # ChatMessage, Language, language codes
    │   └── middleware.ts            # Route protection (/chat, /settings → /login)
    └── package.json
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account, sets session cookie |
| POST | `/api/auth/login` | Sign in (`remember=true` extends to 90 days) |
| POST | `/api/auth/logout` | Clear cookie + delete session row |
| GET | `/api/auth/me` | Current user profile (401 if not authed) |

### User profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/users/me` | Update profile fields |
| POST | `/api/users/me/password` | Change password (requires current pw) |
| POST | `/api/users/me/voice-sample` | Upload audio sample (multipart) |
| GET | `/api/users/me/voice-sample` | Stream stored sample |
| DELETE | `/api/users/me/voice-sample` | Remove sample |

### Conversations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | List user's conversations (newest first) |
| POST | `/api/conversations` | Create new conversation |
| GET | `/api/conversations/{id}` | Get conversation + all messages |
| PATCH | `/api/conversations/{id}` | Rename or change target language |
| DELETE | `/api/conversations/{id}` | Delete (cascades to messages) |

### Chat & utilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/chat` | **Authed** — chatbot with persistence, personalization, web/news search |
| POST | `/api/transcribe` | Whisper STT (auth-aware: uses logged-in user's dialect) |
| POST | `/api/translate` | Text translation with grammar correction |
| POST | `/api/check-grammar` | Standalone grammar check |
| GET | `/api/voices?lang=es` | List TTS voices for a language |
| POST | `/api/tts` | MP3 text-to-speech synthesis |
| GET | `/api/news?q=topic` | News search |
| POST | `/api/news/translate` | Translate one news article (title + summary) |
| POST | `/api/news/translate-batch` | Translate multiple in one call |

## Database Schema

Auto-created on first backend boot via `Base.metadata.create_all()`.

```
users
├── user_id (PK, autoincrement)
├── username (UNIQUE, indexed)
├── email (nullable)
├── password_hash (bcrypt-12)
├── country (nullable)
├── language (default "English")
├── dialect (nullable)
├── communication_style (default "Casual")
├── target_language (default "English")
├── voice_sample_path (nullable, relative to data_dir)
└── created_at

sessions
├── session_id (PK, random URL-safe token, also the cookie value)
├── user_id (FK → users, ON DELETE CASCADE)
├── login_timestamp
├── expires_at
└── last_seen_at

conversations
├── conversation_id (PK, autoincrement)
├── user_id (FK → users, ON DELETE CASCADE)
├── title (default "New chat", auto-set from first message)
├── target_language
├── created_at
└── updated_at  (touched whenever a message is appended)

messages
├── message_id (PK, autoincrement)
├── conversation_id (FK → conversations, ON DELETE CASCADE)
├── role ("user" | "assistant")
├── content
├── translated_content (cached for bilingual replay)
└── timestamp
```

## Security notes

- **Passwords** hashed with bcrypt at 12 rounds. Never stored or returned in plaintext.
- **Sessions** are server-side rows keyed by a 32-byte URL-safe random token. Cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` when `COOKIE_SECURE=true`.
- **CSRF** protection comes from `SameSite=Lax` + the API requiring same-origin cookies.
- **CORS** locked to `http://localhost:3000` by default; override via `CORS_ORIGINS` env var.
- **Username enumeration** mitigated via constant-bcrypt-time login (real or placeholder hash always verified).
- **Voice samples** capped at 2 MB.
