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

### 1. Clone the repo

```bash
git clone https://github.com/your-username/speakly.git
cd speakly
```

### 2. Setup Backend

```bash
cd backend
pip3 install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```
GROQ_API_KEY=your-groq-api-key-here
```

Start the backend server:

```bash
python3 -m uvicorn app.main:app --reload --port 8000
```

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
