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

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  corrections?: Correction[];
  translatedReply?: string;
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
