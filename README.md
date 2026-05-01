# Speakly

Practice any language by speaking with an AI chatbot. Get real-time grammar corrections, translations, and web-powered answers — all in your target language.

## Features

- **Practice (Chatbot)** — Chat with AI in your target language. It corrects grammar mistakes, explains errors, and can search the web when it doesn't know the answer.
- **Translate** — Translate text between 10 languages with grammar checking and corrections.
- **News Search** — Search for latest news articles powered by DuckDuckGo.
- **Text-to-Speech** — Listen to AI responses with natural cloud voices (Microsoft Edge TTS).
- **Speech-to-Text** — Speak into the microphone and the app transcribes your speech using the browser Web Speech API.

## Supported Languages

Spanish, French, German, Italian, Portuguese, Japanese, Korean, Arabic, Chinese, English

## Tech Stack

### Backend
- **FastAPI** — Python API framework
- **Groq API** — LLM inference (via OpenAI SDK)
- **Edge TTS** — Microsoft text-to-speech
- **DuckDuckGo Search** — Web and news search

### Frontend
- **Next.js 16** — React framework
- **TypeScript**
- **Tailwind CSS 4**
- **Web Speech API** — Browser speech recognition and synthesis

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- [Groq API Key](https://console.groq.com/keys)

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

Move into the `backend/` folder:

```bash
cd backend
```

#### Create a virtual environment

A virtual environment keeps the project's Python packages isolated from your system Python. Create it once, then activate it every time you work on the project.

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

When activated, your terminal prompt will be prefixed with `(.venv)`.

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

#### Start the backend server

```bash
python -m uvicorn app.main:app --reload --port 8000
```

> 💡 To leave the virtual environment later, run `deactivate`.

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser

- **http://localhost:3000** — Speakly app
- **http://localhost:8000/docs** — API documentation

## Project Structure

```
speakly/
├── backend/
│   ├── app/
│   │   ├── main.py              # API endpoints
│   │   ├── models.py            # Request/response schemas
│   │   ├── config.py            # Settings & env loading
│   │   ├── prompts.py           # LLM system prompts
│   │   └── services/
│   │       ├── llm_service.py   # Chat & translation (Groq LLM)
│   │       ├── search_service.py # Web & news search (DuckDuckGo)
│   │       └── tts_service.py   # Text-to-speech (Edge TTS)
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx          # Practice (chatbot)
    │   │   ├── translate/        # Translate page
    │   │   └── news/             # News search page
    │   ├── components/
    │   │   ├── ChatWindow.tsx    # Chat UI
    │   │   ├── ChatMessage.tsx   # Message bubbles + news cards
    │   │   ├── CorrectionCard.tsx # Grammar corrections
    │   │   ├── LanguageSelector.tsx # Language picker
    │   │   └── CloudVoiceSelector.tsx # Voice dropdown
    │   ├── hooks/
    │   │   ├── useChat.ts        # Chat state management
    │   │   └── useSpeechRecognition.ts # Speech-to-text
    │   ├── lib/
    │   │   └── api.ts            # Backend API client
    │   └── types/
    │       └── index.ts          # TypeScript interfaces
    └── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/chat` | Practice chatbot (with auto web search) |
| POST | `/api/translate` | Text translation with corrections |
| GET | `/api/voices?lang=es` | List available TTS voices |
| POST | `/api/tts` | Text-to-speech synthesis |
| GET | `/api/news?q=topic` | Search news articles |
