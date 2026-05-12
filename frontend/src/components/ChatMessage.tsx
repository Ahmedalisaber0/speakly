"use client";

import { ChatMessage as ChatMessageType, Language } from "@/types";
import { getStrings } from "@/lib/strings";
import CorrectionCard from "./CorrectionCard";

interface Props {
  message: ChatMessageType;
  nativeLanguage: Language;
}

export default function ChatMessage({ message, nativeLanguage }: Props) {
  // Defensive: a malformed message (or one with surprise field shapes from
  // an older backend / cached API response) must not crash the entire chat.
  if (!message) return null;

  const isUser = message.role === "user";
  const strings = getStrings(nativeLanguage);
  // Coerce to arrays at the top — anything else is treated as empty so the
  // .length / .map calls below can't blow up.
  const newsArticles = Array.isArray(message.newsArticles) ? message.newsArticles : [];
  const corrections = Array.isArray(message.corrections) ? message.corrections : [];
  const hasNews = !isUser && newsArticles.length > 0;

  const status = message.translationStatus;
  const translation = message.translatedContent?.trim();

  // The translation row appears identically inside both user and assistant bubbles,
  // styled with a subtle divider + muted/italic text so it's visually secondary
  // to the primary message.
  const renderTranslationRow = () => {
    const baseRow = isUser
      ? "mt-2 pt-2 border-t border-white/25 text-sm text-white/75 italic"
      : "mt-2 pt-2 border-t border-gray-100 text-sm text-gray-500 italic";

    if (status === "pending") {
      return (
        <div className={`${baseRow} flex items-center gap-1.5`} aria-live="polite">
          <span className="inline-flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-current animate-bounce" />
            <span
              className="w-1 h-1 rounded-full bg-current animate-bounce"
              style={{ animationDelay: "120ms" }}
            />
            <span
              className="w-1 h-1 rounded-full bg-current animate-bounce"
              style={{ animationDelay: "240ms" }}
            />
          </span>
        </div>
      );
    }

    if (translation) {
      return (
        <p className={`${baseRow} whitespace-pre-wrap`} dir="auto">
          {translation}
        </p>
      );
    }

    if (status === "failed") {
      return (
        <p
          className={`${baseRow} ${isUser ? "text-white/60" : "text-gray-400"}`}
          dir="auto"
        >
          {strings.translationUnavailable}
        </p>
      );
    }

    return null;
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%]">
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-blue-600 text-white rounded-br-md"
              : "bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm"
          }`}
        >
          <p className="whitespace-pre-wrap" dir="auto">
            {message.content ?? ""}
          </p>

          {renderTranslationRow()}

          {!isUser && corrections.length > 0 && (
            <CorrectionCard corrections={corrections} />
          )}
        </div>

        {hasNews && (
          <div className="mt-2 space-y-2">
            {newsArticles.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="flex">
                  {article.image && (
                    <div className="w-24 h-20 flex-shrink-0">
                      <img
                        src={article.image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 p-3">
                    <h4 className="font-medium text-gray-800 text-xs leading-snug line-clamp-2">
                      {article.title}
                    </h4>
                    {article.body && (
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                        {article.body}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400">
                      {article.source && <span>{article.source}</span>}
                      {article.source && article.date && (
                        <span className="text-gray-300">|</span>
                      )}
                      {article.date && (
                        <span>
                          {new Date(article.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
