# Speakly — Project Architecture & Design

## Overview

Speakly is a language learning platform built with a client-server architecture. The system is split into **4 main layers** that work together to deliver a seamless experience.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        USER                             │
│              (Browser - localhost:3000)                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              LAYER 1: PRESENTATION                      │
│              (Next.js / React / Tailwind)                │
│                                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │ Practice  │  │ Translate │  │   News    │           │
│  │ (Chatbot) │  │   Page    │  │  Search   │           │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘           │
│        │              │              │                  │
│  ┌─────┴──────────────┴──────────────┴─────┐            │
│  │         Shared Components               │            │
│  │  ChatWindow, ChatMessage, Corrections   │            │
│  │  LanguageSelector, CloudVoiceSelector   │            │
│  └─────────────────┬───────────────────────┘            │
│                    │                                    │
│  ┌─────────────────┴───────────────────────┐            │
│  │         Hooks & API Client              │            │
│  │  useChat, useSpeechRecognition, api.ts  │            │
│  └─────────────────┬───────────────────────┘            │
└────────────────────┼────────────────────────────────────┘
                     │  HTTP (JSON)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              LAYER 2: API GATEWAY                       │
│              (FastAPI - localhost:8000)                  │
│                                                         │
│  ┌──────────┐ ┌───────────┐ ┌────────┐ ┌───────────┐   │
│  │POST /chat│ │POST /trans│ │GET /news│ │POST /tts  │   │
│  └────┬─────┘ └─────┬─────┘ └───┬────┘ └─────┬─────┘   │
│       │             │           │             │         │
└───────┼─────────────┼───────────┼─────────────┼─────────┘
        │             │           │             │
        ▼             ▼           ▼             ▼
┌─────────────────────────────────────────────────────────┐
│              LAYER 3: SERVICES                          │
│              (Business Logic)                           │
│                                                         │
│  ┌──────────────────────────────────────────┐           │
│  │           LLM Service                    │           │
│  │  • Chat with grammar corrections        │           │
│  │  • Translation with error detection     │           │
│  │  • Auto web search fallback             │           │
│  └──────────────────┬───────────────────────┘           │
│                     │                                   │
│  ┌──────────────────┴───────────────────────┐           │
│  │         Search Service                   │           │
│  │  • Web search (DuckDuckGo)              │           │
│  │  • News search (DuckDuckGo)             │           │
│  └──────────────────────────────────────────┘           │
│                                                         │
│  ┌──────────────────────────────────────────┐           │
│  │           TTS Service                    │           │
│  │  • Cloud voices (Edge TTS)              │           │
│  │  • MP3 audio synthesis                  │           │
│  └──────────────────────────────────────────┘           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              LAYER 4: EXTERNAL APIs                     │
│              (Third-Party Services)                     │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │   Groq API   │ │  DuckDuckGo  │ │  Edge TTS    │    │
│  │  (LLM Chat)  │ │ (Web Search) │ │  (Voices)    │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## The 4 Layers Explained

### Layer 1: Presentation (Frontend)

**Technology:** Next.js 16, React 19, TypeScript, Tailwind CSS 4

**Responsibility:** Everything the user sees and interacts with.

```
frontend/src/
├── app/
│   ├── page.tsx              → Practice chatbot (home page)
│   ├── translate/page.tsx    → Translation page
│   └── news/page.tsx         → News search page
├── components/
│   ├── ChatWindow.tsx        → Main chat interface (input, messages, mic)
│   ├── ChatMessage.tsx       → Message bubbles + news cards + corrections
│   ├── CorrectionCard.tsx    → Grammar error display (red → green)
│   ├── LanguageSelector.tsx  → Language picker with flags
│   └── CloudVoiceSelector.tsx → Voice selection dropdown
├── hooks/
│   ├── useChat.ts            → Chat state (messages, loading, languages)
│   └── useSpeechRecognition.ts → Microphone speech-to-text
├── lib/
│   └── api.ts                → All HTTP calls to backend
└── types/
    └── index.ts              → TypeScript interfaces & language codes
```

**How it works:**
1. User selects native + target language
2. User types or speaks a message
3. Frontend sends message to backend via `api.ts`
4. Backend returns reply + corrections + news articles
5. Frontend renders the response in chat bubbles

---

### Layer 2: API Gateway (FastAPI)

**Technology:** FastAPI, Python 3.12

**Responsibility:** Receives HTTP requests, validates data, routes to the correct service.

```
Endpoints:
POST /api/chat       → Chatbot conversation
POST /api/translate  → Text translation
GET  /api/news       → News search
GET  /api/voices     → Available TTS voices
POST /api/tts        → Text-to-speech audio
GET  /api/health     → Health check
```

**How it works:**
1. Receives JSON request from frontend
2. Validates data with Pydantic models
3. Calls the appropriate service
4. Returns JSON response (or audio bytes for TTS)

---

### Layer 3: Services (Business Logic)

**Technology:** Python, OpenAI SDK, DuckDuckGo Search, Edge TTS

**Responsibility:** All the smart logic — LLM calls, web search, voice synthesis.

```
services/
├── llm_service.py      → Brain of the app
├── search_service.py   → Eyes to the web
└── tts_service.py      → Voice of the app
```

#### LLM Service (llm_service.py)
The core service. Handles all AI interactions:

```
User Message
     │
     ▼
┌─────────────────┐    YES    ┌──────────────┐
│ News keywords?  │─────────→│ Search News  │
└────────┬────────┘           └──────┬───────┘
         │ NO                        │
         ▼                           ▼
┌─────────────────┐         ┌──────────────────┐
│  Call LLM       │         │ Call LLM with    │
│  (Groq API)     │         │ news context     │
└────────┬────────┘         └──────────────────┘
         │
         ▼
┌─────────────────┐    YES    ┌──────────────┐
│ Can't answer?   │─────────→│ Search Web   │
│ (needs_search)  │          └──────┬───────┘
└────────┬────────┘                 │
         │ NO                       ▼
         │                  ┌──────────────────┐
         │                  │ Call LLM again   │
         │                  │ with web results │
         │                  └──────┬───────────┘
         ▼                         ▼
┌─────────────────────────────────────────┐
│          Return Response                │
│  reply + corrections + translated_reply │
│  + news_articles (if any)              │
└─────────────────────────────────────────┘
```

#### Search Service (search_service.py)
- `search_web()` → General web search via DuckDuckGo
- `search_news()` → News-specific search via DuckDuckGo

#### TTS Service (tts_service.py)
- `get_voices()` → Lists available voices filtered by language
- `synthesize_speech()` → Converts text to MP3 audio

---

### Layer 4: External APIs

**Responsibility:** Third-party services that Speakly depends on.

| Service | Purpose | How Used |
|---------|---------|----------|
| **Groq API** | LLM inference (chat, translation, corrections) | OpenAI SDK with Groq base URL |
| **DuckDuckGo** | Web search & news search | `duckduckgo-search` Python package |
| **Microsoft Edge TTS** | Text-to-speech with natural voices | `edge-tts` Python package |
| **Web Speech API** | Speech-to-text in browser | Built into Chrome/Edge |

---

## Data Flow — Full Chat Request

```
1. User types "Hola, quiero saber las noticias de tecnología"
                          │
2. Frontend (useChat.ts)  │  Adds to message history
                          ▼
3. api.ts                 │  POST /api/chat { message, languages, history }
                          ▼
4. main.py                │  Validates request with Pydantic
                          ▼
5. llm_service.py         │  Detects "noticias" → news keyword
                          ▼
6. search_service.py      │  DuckDuckGo news search → 5 articles
                          ▼
7. llm_service.py         │  Sends to Groq LLM with news context
                          │  LLM responds in target language
                          │  LLM corrects grammar errors
                          ▼
8. main.py                │  Returns ChatResponse JSON
                          ▼
9. api.ts                 │  Receives response
                          ▼
10. ChatMessage.tsx       │  Renders reply bubble + correction cards
                          │  + clickable news article cards
                          ▼
11. speakCloud()          │  Edge TTS reads the reply aloud
                          ▼
12. User hears and reads the response
```

---

## Configuration

```
backend/.env
├── GROQ_API_KEY          → Required: Groq API key for LLM
└── CORS_ORIGINS          → Optional: Allowed frontend origins (default: localhost:3000)

frontend/.env.local
└── NEXT_PUBLIC_API_URL   → Optional: Backend URL (default: http://localhost:8000)
```
