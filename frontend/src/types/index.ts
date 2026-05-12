export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
}

export interface ChatNewsArticle {
  title: string;
  url: string;
  body: string;
  source: string;
  image: string;
  date: string;
}

export type TranslationStatus = "pending" | "done" | "failed";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  // Translation of `content` into the OTHER language. For user messages this is
  // native -> target, for assistant messages it's target -> native (provided
  // by the chat API in `translated_reply`).
  translatedContent?: string;
  translationStatus?: TranslationStatus;
  corrections?: Correction[];
  newsArticles?: ChatNewsArticle[];
}

export type Language =
  | "Spanish"
  | "French"
  | "German"
  | "Italian"
  | "Portuguese"
  | "Japanese"
  | "Korean"
  | "Arabic"
  | "Chinese"
  | "English";

export const LANGUAGE_CODES: Record<Language, string> = {
  Spanish: "es-ES",
  French: "fr-FR",
  German: "de-DE",
  Italian: "it-IT",
  Portuguese: "pt-BR",
  Japanese: "ja-JP",
  Korean: "ko-KR",
  Arabic: "ar-SA",
  Chinese: "zh-CN",
  English: "en-US",
};

// ISO 3166-1 alpha-2 country codes (lowercase) — used for flag images
export const LANGUAGE_COUNTRY_CODES: Record<Language, string> = {
  Spanish: "es",
  French: "fr",
  German: "de",
  Italian: "it",
  Portuguese: "br",
  Japanese: "jp",
  Korean: "kr",
  Arabic: "sa",
  Chinese: "cn",
  English: "us",
};

export const LANGUAGES: Language[] = [
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Japanese",
  "Korean",
  "Arabic",
  "Chinese",
  "English",
];
