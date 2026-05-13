# Speakly — Full Project Documentation

Speakly is a web app for practicing a foreign language by chatting with an AI tutor. The tutor replies in your target language, corrects your grammar, translates news, reads its answers out loud, and listens when you speak into the microphone. This document explains how every piece of the project fits together.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture at a Glance](#2-architecture-at-a-glance)
3. [Tech Stack](#3-tech-stack)
4. [Repository Layout](#4-repository-layout)
5. [Backend](#5-backend)
    - [Configuration](#51-configuration-backendappconfigpy)
    - [Data Models](#52-data-models-backendappmodelspy)
    - [System Prompt](#53-system-prompt-backendapppromptspy)
    - [API Endpoints](#54-api-endpoints-backendappmainpy)
    - [LLM Service](#55-llm-service-backendappservicesllm_servicepy)
    - [Search Service](#56-search-service-backendappservicessearch_servicepy)
    - [TTS Service](#57-tts-service-backendappservicestts_servicepy)
6. [Frontend](#6-frontend)
    - [Pages (Next.js App Router)](#61-pages-next-js-app-router)
    - [Components](#62-components)
    - [Hooks](#63-hooks)
    - [API Client](#64-api-client-srclibapits)
    - [Types](#65-types-srctypesindexts)
7. [End-to-End Data Flow](#7-end-to-end-data-flow)
8. [Supported Languages](#8-supported-languages)
9. [Running the Project Locally](#9-running-the-project-locally)
10. [Environment Variables](#10-environment-variables)
11. [Troubleshooting](#11-troubleshooting)
12. [Extending Speakly](#12-extending-speakly)

---

## 1. Overview

Speakly has three main user-facing features:

| Feature | What it does |
|---------|--------------|
| **Practice (Chat)** | The user types or speaks; the AI replies in the chosen target language, flags grammar mistakes, translates its reply back to the user's native language, and falls back to web search when it doesn't know an answer. |
| **Translate** | Pastes text in language A, gets a translation in language B plus a list of grammar corrections for the original input. |
| **News** | Searches recent news headlines via DuckDuckGo and (optionally) translates titles + summaries into the user's target language. |

Two helper features support all three:

- **Text-to-Speech (TTS)** — natural-sounding voices via Microsoft Edge TTS.
- **Speech-to-Text (STT)** — the browser records audio, the backend transcribes it with Groq's Whisper.

---

## 2. Architecture at a Glance

```
+--------------------+        HTTP/JSON         +-----------------------+
|                    |  ----------------------> |                       |
|   Next.js 16 UI    |                          |   FastAPI Backend     |
|   (React 19, TS)   | <----------------------  |   (Python 3.12)       |
|                    |        JSON / MP3        |                       |
+--------------------+                          +-----------+-----------+
        |                                                   |
        | Web Speech API (browser)                          |
        |                                                   |
        |                                       +-----------+-----------+
        |                                       |                       |
        |                                       |   External services   |
        |                                       |                       |
        |                                       |   - Groq API (LLM +   |
        |                                       |     Whisper STT)      |
        |                                       |   - DuckDuckGo Search |
        |                                       |   - Microsoft Edge TTS|
        |                                       +-----------------------+
```

- The **frontend** is a Next.js single-page app that handles UI, recording, and playback. It never talks to Groq, DuckDuckGo, or Edge TTS directly — only to the backend.
- The **backend** is a thin FastAPI service that orchestrates calls to three external providers. It holds the only secret in the project: `GROQ_API_KEY`.
- The system is **stateless** — there is no database. Chat history lives in the user's browser and is sent with each request (capped at the last 20 messages by the frontend).

---

## 3. Tech Stack

### Backend
- **FastAPI 0.135** — async API framework
- **Uvicorn** — ASGI server
- **OpenAI Python SDK 2.26** — used as a compatible client against Groq's OpenAI-style API
- **Pydantic / pydantic-settings** — request/response validation and `.env` loading
- **edge-tts 7.2** — Microsoft Edge TTS over the unofficial public endpoint
- **ddgs** (maintained successor to `duckduckgo_search`) — web and news search

### Frontend
- **Next.js 16.1** with the **App Router**
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4** (via `@tailwindcss/postcss`)
- **Web Speech API** (browser-native) — only used as a fallback voice for TTS

### External Services
- **Groq** — `openai/gpt-oss-120b` for chat/translate/grammar, `whisper-large-v3` for STT
- **DuckDuckGo** — search results (no API key needed)
- **Microsoft Edge TTS** — text-to-speech (no API key needed)

---

## 4. Repository Layout

```
speakly/
├── README.md                  # Quick-start guide
├── DOCUMENTATION.md           # This file
├── GRAPH.md                   # Architecture diagrams
├── Speakly_Documentation.docx # Older Word-format documentation
│
├── backend/
│   ├── .env                   # GROQ_API_KEY lives here (gitignored)
│   ├── requirements.txt
│   └── app/
│       ├── main.py            # FastAPI app + routes
│       ├── config.py          # Settings (env vars, model names)
│       ├── models.py          # Pydantic request/response schemas
│       ├── prompts.py         # System prompt builder for chat
│       └── services/
│           ├── llm_service.py    # Chat, translate, news translate, grammar, Whisper
│           ├── search_service.py # DuckDuckGo wrapper with retry
│           └── tts_service.py    # Edge TTS wrapper
│
└── frontend/
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── layout.tsx          # Root layout
        │   ├── page.tsx            # /  — Practice (chatbot)
        │   ├── translate/page.tsx  # /translate
        │   └── news/page.tsx       # /news
        ├── components/
        │   ├── ChatWindow.tsx
        │   ├── ChatMessage.tsx
        │   ├── ClarificationCard.tsx
        │   ├── CloudVoiceSelector.tsx
        │   ├── CorrectionCard.tsx
        │   ├── Flag.tsx
        │   ├── LanguageSelector.tsx
        │   ├── NewsLanguagePicker.tsx
        │   └── SpeechCorrectionCard.tsx
        ├── hooks/
        │   ├── useChat.ts
        │   └── useSpeechRecognition.ts
        ├── lib/
        │   ├── api.ts           # All backend calls
        │   └── strings.ts       # UI translations
        └── types/
            └── index.ts         # ChatMessage, Language, language codes
```

---

## 5. Backend

The backend is a small FastAPI app split into a routing layer (`main.py`) and three service modules (`services/`). Each service owns one external dependency, which keeps the routes thin and easy to test.

### 5.1 Configuration (`backend/app/config.py`)

Settings are loaded from `.env` via `pydantic-settings`:

| Setting | Default | Purpose |
|---------|---------|---------|
| `groq_api_key` | *(required)* | API key for Groq inference |
| `chat_model` | `openai/gpt-oss-120b` | LLM used for chat, translate, grammar, news summaries |
| `whisper_model` | `whisper-large-v3` | Groq Whisper variant used for `/api/transcribe` |
| `cors_origins` | `["http://localhost:3000"]` | Allowed CORS origins |

The non-turbo Whisper model is the default because it handles diacritic-heavy languages (Arabic, Japanese, Korean) noticeably better, at the cost of slightly more latency.

### 5.2 Data Models (`backend/app/models.py`)

All requests and responses are `pydantic.BaseModel` classes. The key shapes:

- **`ChatRequest`** — `message`, `native_language`, `target_language`, `conversation_history`
- **`ChatResponse`** — `reply`, `corrections[]`, `translated_reply`, `news_articles[]`, plus clarification fields (`needs_clarification`, `suggested_correction`, `correction_language`)
- **`TranslateRequest` / `TranslateResponse`** — text in/out plus a `corrections[]` list
- **`NewsTranslateRequest` / `NewsTranslateBatchRequest`** — translate one or many news articles
- **`GrammarCheckRequest` / `GrammarCheckResponse`** — pure grammar-check endpoint
- **`Correction`** — `{ original, corrected, explanation }`, reused everywhere

The clarification fields on `ChatResponse` are how the AI signals "I don't understand your input — here's what I think you meant" rather than silently guessing.

### 5.3 System Prompt (`backend/app/prompts.py`)

`build_system_prompt(native_language, target_language)` produces a single string used as the `system` message for every chat call. It tells the model:

1. Always reply **in the target language** to keep the user immersed.
2. Stay conversational (1–3 sentences, ask follow-ups).
3. Match the user's apparent level.
4. Return a strict JSON object containing:
   - `reply` — the conversational answer
   - `translated_reply` — that same answer translated to the native language
   - `needs_search` — set to `true` when web search would help
   - `needs_clarification` + `suggested_correction` — set when the user's input is genuinely unparseable
   - `correction_language` — always the native language

JSON-only output is enforced by passing `response_format={"type": "json_object"}` to the Groq API.

### 5.4 API Endpoints (`backend/app/main.py`)

| Method | Path | Body / Query | Returns | Purpose |
|--------|------|--------------|---------|---------|
| `GET`  | `/api/health` | – | `{"status":"ok"}` | Liveness probe |
| `POST` | `/api/chat` | `ChatRequest` | `ChatResponse` | Practice chatbot turn |
| `POST` | `/api/translate` | `TranslateRequest` | `TranslateResponse` | Translate + grammar-check text |
| `GET`  | `/api/voices?lang=es` | `lang` query | `CloudVoice[]` | List Edge TTS voices, filtered by language code |
| `POST` | `/api/tts` | `{ text, voice }` | `audio/mpeg` MP3 | Synthesize speech |
| `GET`  | `/api/news?q=...&max_results=10` | query | `NewsResponse` | DuckDuckGo news search |
| `POST` | `/api/news/translate` | `NewsTranslateRequest` | `NewsTranslateResponse` | Translate one article (title + summary) |
| `POST` | `/api/news/translate-batch` | `NewsTranslateBatchRequest` | `NewsTranslateBatchResponse` | Translate many articles in one LLM call |
| `POST` | `/api/check-grammar` | `GrammarCheckRequest` | `GrammarCheckResponse` | Grammar-only check (no translation) |
| `POST` | `/api/transcribe` | multipart `audio` file + `language` form field | `{"text": "..."}` | Whisper speech-to-text |

CORS is enabled for the configured origins so the Next.js dev server at `http://localhost:3000` can call the backend at `http://localhost:8000`.

### 5.5 LLM Service (`backend/app/services/llm_service.py`)

This file is the heart of the backend. It exports five async functions plus a few helpers.

#### `_call_llm(messages, max_tokens, json_mode)`

Single internal helper that wraps the Groq client. When `json_mode=True`, it forces a single valid JSON object — this eliminates truncation or accidental plain-text replies that would break `json.loads`.

#### `get_response(request) -> ChatResponse`

The main chat function. It runs up to **four steps**:

1. **News intent detection.** If the user's message contains a news keyword (in any of the supported languages), the backend proactively searches DuckDuckGo News and injects the top 5 results into the system prompt under a `[NEWS RESULTS]` section.
2. **First LLM call.** Send the system prompt plus the trimmed conversation history plus the user's message; expect a JSON object back.
3. **Web-search retry.** If the model said `needs_search: true` (or the response text matches one of the "I can't access real-time info" giveaway phrases in `CANT_ANSWER_PHRASES`), do a general DuckDuckGo web search, append the results under `[WEB SEARCH RESULTS]`, and call the LLM again.
4. **Assemble `ChatResponse`.** Pull `reply`, `translated_reply`, `corrections`, and the clarification flags out of the parsed JSON. If the model claimed it needed clarification but didn't supply a `suggested_correction`, the flag is downgraded to `False` (the UI card has nothing to display otherwise).

#### `translate_text(request) -> TranslateResponse`

Translates text and grammar-checks the input in the same JSON-mode LLM call. Returns the translation, a `corrected_text` version of the input, and an array of `corrections`.

#### `check_grammar(request) -> GrammarCheckResponse`

A standalone grammar checker used by the speech-recognition flow when the user records a clip in their native language. Returns `corrected` text plus a list of `Correction` objects. Tolerant of informal speech — only flags real errors a learner should know about.

#### `translate_news_article` / `translate_news_articles`

Translates a single news article (title + summary, body excerpt capped at 600 chars) or a batch in one LLM call. Batched mode is important: translating each article separately would blow through Groq's tokens-per-minute limit on a long news list.

#### `transcribe_audio(audio_bytes, filename, language)`

Calls Groq's Whisper endpoint. Key details:

- The **prompt is language-matched** (see `_WHISPER_PROMPTS`). Whisper expects the bias prompt in the same language as the audio — an English prompt on Arabic audio biases the model toward romanized output.
- Each prompt is a short casual phrase. This nudges Whisper toward informal vocabulary and away from the common hallucinations ("Subscribe to my channel", "Thanks for watching") it emits on quiet clips.
- `temperature=0` for deterministic, repeatable transcripts.

### 5.6 Search Service (`backend/app/services/search_service.py`)

A thin async wrapper around the synchronous DuckDuckGo library:

- Uses the maintained `ddgs` package, falling back to `duckduckgo_search` for older environments.
- The blocking DDG call runs in a worker thread via `asyncio.to_thread` so the event loop stays free.
- Retries up to 3 times with exponential backoff when DuckDuckGo rate-limits (HTTP 403 or "ratelimit" in the error string). Anything else fails fast and returns an empty list.
- Two public functions:
  - `search_web(query, max_results)` → general text search
  - `search_news(query, max_results)` → news vertical (includes `image`, `date`, `source`)

Both normalize results into a consistent dict shape so the rest of the codebase doesn't care which DDG endpoint produced them.

### 5.7 TTS Service (`backend/app/services/tts_service.py`)

Two functions:

- `get_voices(language_code)` — calls `edge_tts.list_voices()` and returns `{id, name, locale, gender}` dicts. Optionally filtered by language code prefix (e.g. `"es"` → all Spanish locales).
- `synthesize_speech(text, voice)` — streams Edge TTS audio chunks into an in-memory buffer and returns the MP3 bytes. The route handler in `main.py` sends those bytes back with `Content-Type: audio/mpeg`.

No streaming response — the whole MP3 is returned in one shot. Clips in this app are short (a chat reply), so that's fine.

---

## 6. Frontend

The frontend is a Next.js 16 App Router project. Three routes, a handful of shared components, two hooks, and one API client.

### 6.1 Pages (Next.js App Router)

| Route | File | What it shows |
|-------|------|---------------|
| `/` | `src/app/page.tsx` | **Practice** — chat with the AI. Shows the language picker on first load, then the chat window. Manages voice selection, mic state, and TTS playback. |
| `/translate` | `src/app/translate/page.tsx` | **Translate** — two text areas plus a "from" / "to" picker; uses `/api/translate` and `/api/check-grammar`. |
| `/news` | `src/app/news/page.tsx` | **News** — search box and result cards; translates titles + summaries on demand. |

The root layout at `src/app/layout.tsx` only sets fonts and the page shell.

### 6.2 Components

- **`ChatWindow.tsx`** — the main chat surface: message list, input box, mic button, voice selector, language switcher, and the clarification card. Receives all callbacks as props and is otherwise stateless.
- **`ChatMessage.tsx`** — renders a single chat bubble. Handles both user and assistant turns, embeds `CorrectionCard` and news article cards when present, and shows the inline translation under each bubble.
- **`CorrectionCard.tsx`** — compact "you said / try this / why" card for inline grammar corrections.
- **`ClarificationCard.tsx`** — shown when the assistant returns `needs_clarification: true`. Lets the user accept the suggested rewrite (re-sends it as the next message), dismiss it, or click "Listen" to hear the proper pronunciation in their **native** language.
- **`SpeechCorrectionCard.tsx`** — shown after a voice clip is transcribed and grammar-checked, before the message is actually sent.
- **`LanguageSelector.tsx`** — the first-run picker for native + target languages.
- **`NewsLanguagePicker.tsx`** — the target-language picker on the News page.
- **`CloudVoiceSelector.tsx`** — dropdown of Edge TTS voices for the current target language.
- **`Flag.tsx`** — small flag-emoji-style image keyed by `LANGUAGE_COUNTRY_CODES`.

### 6.3 Hooks

#### `useChat` (`src/hooks/useChat.ts`)

Owns the entire chat state machine:
- `messages: ChatMessage[]`
- `nativeLanguage`, `targetLanguage`
- `isLoading`, `error`
- `pendingClarification` — populated when the backend asks for a clarification
- methods: `setLanguages`, `resetLanguages`, `sendMessage`, `acceptClarification`, `dismissClarification`

`sendMessage` posts to `/api/chat`, appends the user + assistant messages, and surfaces any inline corrections / news articles / clarification flags from the response. The history sent to the backend is trimmed to the last 20 messages in `lib/api.ts`.

#### `useSpeechRecognition` (`src/hooks/useSpeechRecognition.ts`)

Wraps `MediaRecorder` for recording in the browser and then posts the audio blob to `/api/transcribe`. Exposes:
- `isListening`, `isSupported`, `recordingSeconds`, `error`
- `startListening(languageCode, onTranscript, opts)`
- `stopListening()`

The `lockToNative` toggle in the chat page decides whether to pass the native language code as a Whisper hint or to let Whisper auto-detect.

### 6.4 API Client (`src/lib/api.ts`)

Single file that wraps every backend call:

- `sendMessage(message, native, target, history)` — `/api/chat`, trims history to the last 20 messages
- `translateText(text, from, to)` — `/api/translate`
- `fetchCloudVoices(lang)` — `/api/voices`
- `searchNews(query, max)` — `/api/news`
- `translateNewsArticle` / `translateNewsArticlesBatch` — `/api/news/translate*`
- `checkGrammar(text, lang)` — `/api/check-grammar`
- `transcribeAudio(audio, langCode)` — `/api/transcribe` (multipart)
- `speakCloud(text, voice)` / `stopCloud()` — `/api/tts` with a **module-scoped current audio element** so a new TTS call cancels the previous one instead of stacking voices

The base URL is `process.env.NEXT_PUBLIC_API_URL` (falls back to `http://localhost:8000`).

### 6.5 Types (`src/types/index.ts`)

- `Language` — the union of the 10 supported languages
- `LANGUAGE_CODES` — maps each language name to its BCP-47 locale (`"Spanish" → "es-ES"`)
- `LANGUAGE_COUNTRY_CODES` — maps each language to a flag image country code
- `ChatMessage` — chat bubble shape, including optional `translatedContent`, `translationStatus`, `corrections`, `newsArticles`
- `Correction` — `{ original, corrected, explanation }`

---

## 7. End-to-End Data Flow

### Sending a typed chat message

```
User clicks "Send" in ChatWindow
   → useChat.sendMessage(text)
       → fetch POST /api/chat  (api.ts)
           → FastAPI route /api/chat  (main.py)
               → llm_service.get_response(request)
                   1. detect news intent → maybe search_news()
                   2. _call_llm(messages, json_mode=True)
                   3. if needs_search → search_web() then _call_llm() again
                   4. assemble ChatResponse
               ← JSON response
           ← JSON response
       ← ChatApiResponse
   ← appended to messages[]; reply read by speakCloud(reply, voice)
       → fetch POST /api/tts
           → tts_service.synthesize_speech(text, voice)
               → edge_tts streams MP3 bytes
           ← Response(content=mp3, media_type="audio/mpeg")
       ← Blob played by HTMLAudioElement
```

### Sending a voice message

```
User taps the mic
   → useSpeechRecognition.startListening(lang, onTranscript)
       → MediaRecorder begins capturing
   User taps the mic again
   → MediaRecorder.stop() produces a webm Blob
       → fetch POST /api/transcribe  (multipart)
           → llm_service.transcribe_audio(bytes, filename, language)
               → Groq Whisper with a language-matched prompt
           ← plain text transcript
       ← { text }
   → (optional) checkGrammar() if not skipped
   → onTranscript(transcript) → useChat.sendMessage(transcript)
       (continues as above)
```

### News page

```
User types a query → searchNews(q)
   → /api/news → search_service.search_news → DDG news vertical
   ← list of articles (title, body, source, image, date)

User picks a target language → translateNewsArticlesBatch(articles, lang)
   → /api/news/translate-batch
       → llm_service.translate_news_articles
           → single _call_llm({json_mode: true}) with all titles+bodies
       ← { translations: [{translated_title, summary}, ...] }
   ← UI fills in translated titles + summaries
```

---

## 8. Supported Languages

Ten languages are first-class throughout the app:

| Language | Locale | Country code | News keyword |
|----------|--------|--------------|--------------|
| English | `en-US` | `us` | "news", "latest", "headlines" |
| Spanish | `es-ES` | `es` | "noticias", "actualidad" |
| French | `fr-FR` | `fr` | "nouvelles", "actualités" |
| German | `de-DE` | `de` | "nachrichten", "neuigkeiten" |
| Italian | `it-IT` | `it` | "notizie" |
| Portuguese | `pt-BR` | `br` | "notícias" |
| Japanese | `ja-JP` | `jp` | "ニュース", "最新" |
| Korean | `ko-KR` | `kr` | "뉴스", "최신" |
| Arabic | `ar-SA` | `sa` | "أخبار", "عاجل", "آخر" |
| Chinese | `zh-CN` | `cn` | "新闻", "最新" |

These are the languages the AI is instructed to speak and that have a matching Whisper prompt seed.

---

## 9. Running the Project Locally

### Prerequisites
- Python 3.12+
- Node.js 18+
- A free [Groq API key](https://console.groq.com/keys)

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate         # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
echo "GROQ_API_KEY=sk-..." > .env
python -m uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000`, with auto-generated Swagger UI at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The first screen asks for your native and target languages, then drops you into the chat.

---

## 10. Environment Variables

| Variable | Where | Required | Default | Description |
|----------|-------|----------|---------|-------------|
| `GROQ_API_KEY` | `backend/.env` | yes | – | Your Groq inference key |
| `CHAT_MODEL` | `backend/.env` | no | `openai/gpt-oss-120b` | Groq LLM ID for chat/translate/grammar |
| `WHISPER_MODEL` | `backend/.env` | no | `whisper-large-v3` | Groq Whisper variant for STT (use `whisper-large-v3-turbo` for less latency) |
| `CORS_ORIGINS` | `backend/.env` | no | `["http://localhost:3000"]` | JSON list of allowed CORS origins |
| `NEXT_PUBLIC_API_URL` | frontend env | no | `http://localhost:8000` | Backend base URL the browser hits |

---

## 11. Troubleshooting

- **`401 Unauthorized` from Groq** — check `GROQ_API_KEY` in `backend/.env`.
- **`429 / rate limit` from Groq** — the chat model is on a free-tier TPM limit. Reduce conversation history, use a smaller `CHAT_MODEL`, or upgrade your Groq plan.
- **DuckDuckGo returns nothing** — DDG aggressively rate-limits scrapers. The search service retries 3× with backoff, then returns `[]`; the chat will simply skip the news/web-search step.
- **No microphone permission** — browsers only expose `MediaRecorder` on `https://` or `localhost`. Don't open the frontend over a LAN IP without HTTPS.
- **Edge TTS silent** — the unofficial Edge endpoint is occasionally blocked from certain networks. The frontend automatically falls back to `window.speechSynthesis` when `speakCloud` throws.
- **`npm.ps1 cannot be loaded` on Windows** — run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` in PowerShell as Administrator, or use Command Prompt.

---

## 12. Extending Speakly

A few common changes and where to make them:

- **Add a new language.** Add it to `Language`, `LANGUAGE_CODES`, `LANGUAGE_COUNTRY_CODES`, and `LANGUAGES` in `frontend/src/types/index.ts`. Add a Whisper prompt seed in `_WHISPER_PROMPTS` in `backend/app/services/llm_service.py`. Optionally add news keywords in `NEWS_KEYWORDS`.
- **Swap the LLM.** Change `CHAT_MODEL` in `backend/.env` to any model ID Groq exposes. The code uses the OpenAI SDK shape, so nothing else needs to change.
- **Persist chat history.** Today every refresh wipes the conversation. Add a localStorage hook in `useChat` (or a small DB on the backend) and rehydrate on mount.
- **Stream chat responses.** The current `_call_llm` waits for the full response. For streaming you'd switch to `client.chat.completions.create(..., stream=True)` and have FastAPI emit Server-Sent Events.
- **Add authentication.** There is none today. Plug a middleware in `backend/app/main.py` and pass a token from the frontend `api.ts`.

---

*Last updated: 2026-05-12*