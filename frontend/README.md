# Speakly Frontend

Next.js 16 (App Router + Turbopack) UI for the Speakly personalized AI voice assistant.

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:3000. The backend is expected on `http://localhost:8000` (override with `NEXT_PUBLIC_API_URL`).

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Dev server (Turbopack, hot reload) |
| `npm run build` | Production build (Turbopack) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Routes

| Route | Auth | Description |
|-------|------|-------------|
| `/` | public | Landing page (hero + features + login/register CTAs) |
| `/login` | public | Sign in form |
| `/register` | public | Account + profile + optional voice sample |
| `/chat` | **authed** | Sidebar + chat dashboard |
| `/settings` | **authed** | Profile / password / voice sample |
| `/translate` | public | Text translation |
| `/news` | public | News search |

`middleware.ts` enforces redirects for the authed routes (no cookie → `/login?next=…`) and bounces logged-in users away from `/login` and `/register`.

## Project layout

See the top-level [`DOCUMENTATION.md`](../DOCUMENTATION.md) for the full file-by-file walkthrough. TL;DR:

```
src/
├── middleware.ts                 # route protection
├── app/                          # one folder per route
├── components/                   # shared UI (chat, auth, voice)
├── hooks/                        # useAuth, useConversations, useChat, useSpeechRecognition
├── lib/                          # api / auth-api / conversations-api / strings (i18n)
└── types/                        # ChatMessage, Language, language code maps
```

## Conventions

- **All API calls send `credentials: "include"`** so the `speakly_session` HttpOnly cookie travels.
- **Theme** is driven by CSS variables in `globals.css`; toggle by adding/removing `.dark` on `<html>`. Bootstrap script in `layout.tsx` reads localStorage to avoid flash.
- **i18n** is a flat map in `lib/strings.ts`. Always pull labels via `getStrings(language)`.
- **Voice** input is a custom `MediaRecorder` wrapper in `hooks/useSpeechRecognition.ts` (no Web Speech API — we send audio to backend Whisper for accuracy).

## Build verification

```bash
npx tsc --noEmit       # type-check
npm run lint           # eslint
npm run build          # full prod build
```

The repo currently builds with **0 errors, 3 unchanged pre-existing `<img>` warnings** (`Flag.tsx`, `ChatMessage.tsx` news-card thumbnails, `news/page.tsx` thumbnails).
