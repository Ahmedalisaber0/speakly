import { ChatMessage, Correction, ChatNewsArticle } from "@/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Shared default for every authed fetch — sends the speakly_session cookie
// and lets the backend's CORS allow_credentials work.
export const FETCH_DEFAULTS: RequestInit = { credentials: "include" };

export interface ChatApiResponse {
  reply: string;
  corrections: Correction[];
  translated_reply: string;
  news_articles: ChatNewsArticle[];
  needs_clarification: boolean;
  suggested_correction: string;
  correction_language: string;
  conversation_id: number | null;
}

// Cap conversation history sent to the LLM to keep prompts short, prevent
// Groq's context window from being filled with old turns, and avoid response
// slowdown on long sessions. The backend still sees the system prompt + this
// trailing window + the current message.
const MAX_HISTORY_MESSAGES = 20;

export async function sendMessage(
  message: string,
  nativeLanguage: string,
  targetLanguage: string,
  conversationHistory: ChatMessage[],
  conversationId: number | null = null
): Promise<ChatApiResponse> {
  const trimmed = conversationHistory.slice(-MAX_HISTORY_MESSAGES);
  const response = await fetch(`${API_URL}/api/chat`, {
    ...FETCH_DEFAULTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      native_language: nativeLanguage,
      target_language: targetLanguage,
      conversation_id: conversationId,
      conversation_history: trimmed.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

interface TranslateCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

interface TranslateApiResponse {
  translated_text: string;
  original_text: string;
  corrected_text: string;
  corrections: TranslateCorrection[];
}

export async function translateText(
  text: string,
  fromLanguage: string,
  toLanguage: string
): Promise<TranslateApiResponse> {
  const response = await fetch(`${API_URL}/api/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      from_language: fromLanguage,
      to_language: toLanguage,
    }),
  });

  if (!response.ok) {
    throw new Error(`Translate error: ${response.status}`);
  }

  return response.json();
}

export interface CloudVoice {
  id: string;
  name: string;
  locale: string;
  gender: string;
}

export async function fetchCloudVoices(lang: string = ""): Promise<CloudVoice[]> {
  const response = await fetch(`${API_URL}/api/voices?lang=${encodeURIComponent(lang)}`);
  if (!response.ok) throw new Error(`Voices error: ${response.status}`);
  const data = await response.json();
  // The backend always returns an array, but be defensive: returning a
  // non-array here historically crashed `availableVoices.length` upstream.
  return Array.isArray(data) ? data : [];
}

export interface NewsArticle {
  title: string;
  url: string;
  body: string;
  source: string;
  image: string;
  date: string;
}

interface NewsApiResponse {
  articles: NewsArticle[];
  query: string;
}

export async function searchNews(
  query: string,
  maxResults: number = 10
): Promise<NewsApiResponse> {
  const params = new URLSearchParams({ q: query, max_results: String(maxResults) });
  const response = await fetch(`${API_URL}/api/news?${params}`);
  if (!response.ok) throw new Error(`News error: ${response.status}`);
  return response.json();
}

export interface NewsTranslation {
  translated_title: string;
  summary: string;
}

export async function translateNewsArticle(
  title: string,
  body: string,
  targetLanguage: string
): Promise<NewsTranslation> {
  const response = await fetch(`${API_URL}/api/news/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      body,
      target_language: targetLanguage,
    }),
  });
  if (!response.ok) throw new Error(`News translate error: ${response.status}`);
  return response.json();
}

export async function translateNewsArticlesBatch(
  articles: { title: string; body: string }[],
  targetLanguage: string
): Promise<{ translations: NewsTranslation[] }> {
  const response = await fetch(`${API_URL}/api/news/translate-batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      articles,
      target_language: targetLanguage,
    }),
  });
  if (!response.ok) throw new Error(`News batch translate error: ${response.status}`);
  return response.json();
}

export interface GrammarCheckResult {
  original: string;
  corrected: string;
  corrections: Array<{ original: string; corrected: string; explanation: string }>;
}

export async function checkGrammar(
  text: string,
  language: string
): Promise<GrammarCheckResult> {
  const response = await fetch(`${API_URL}/api/check-grammar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });
  if (!response.ok) throw new Error(`Grammar check error: ${response.status}`);
  return response.json();
}

export async function transcribeAudio(
  audio: Blob,
  languageCode?: string,
  dialect?: string
): Promise<string> {
  const form = new FormData();
  // Pick a sensible filename extension from the actual MIME so Whisper's
  // file sniffer doesn't have to guess. Falls back to webm.
  const mime = audio.type.toLowerCase();
  const ext = mime.includes("mp4")
    ? "mp4"
    : mime.includes("ogg")
    ? "ogg"
    : mime.includes("wav")
    ? "wav"
    : "webm";
  form.append("audio", audio, `speech.${ext}`);
  if (languageCode) form.append("language", languageCode);
  if (dialect) form.append("dialect", dialect);

  const response = await fetch(`${API_URL}/api/transcribe`, {
    ...FETCH_DEFAULTS,
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Transcribe error ${response.status}: ${text}`);
  }
  const data = await response.json();
  return (data.text || "").trim();
}

// Module-scoped — a new speakCloud call replaces whatever is currently playing
// instead of stacking. stopCloud() lets the UI cut playback short.
let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;

export function stopCloud(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

export async function speakCloud(text: string, voice: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  });

  if (!response.ok) throw new Error(`TTS error: ${response.status}`);

  // Cancel any in-flight clip before starting the new one — otherwise rapid
  // sends produce overlapping voices in the browser.
  stopCloud();

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  currentAudio = audio;
  currentObjectUrl = url;

  return new Promise<void>((resolve) => {
    const cleanup = () => {
      if (currentAudio === audio) {
        currentAudio = null;
        currentObjectUrl = null;
      }
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onended = cleanup;
    audio.onerror = cleanup;
    audio.onpause = () => {
      // Triggered by stopCloud() — ensure cleanup so the consumer's await unblocks.
      if (audio.ended === false && audio.currentTime === 0) cleanup();
    };
    audio.play().catch(cleanup);
  });
}
