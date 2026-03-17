"use client";

import { useState } from "react";
import { ChatMessage as ChatMessageType } from "@/types";
import CorrectionCard from "./CorrectionCard";

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";
  const [showTranslation, setShowTranslation] = useState(false);

  const hasTranslation = !isUser && message.translatedReply;
  const hasNews = !isUser && message.newsArticles && message.newsArticles.length > 0;

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
          <p className="whitespace-pre-wrap">{message.content}</p>

          {showTranslation && hasTranslation && (
            <p className="mt-2 pt-2 border-t border-gray-100 text-sm text-gray-500 italic">
              {message.translatedReply}
            </p>
          )}

          {!isUser && message.corrections && message.corrections.length > 0 && (
            <CorrectionCard corrections={message.corrections} />
          )}
        </div>

        {/* News articles */}
        {hasNews && (
          <div className="mt-2 space-y-2">
            {message.newsArticles!.map((article, i) => (
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

        {/* Translate button */}
        {hasTranslation && (
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="mt-1 ml-1 text-xs text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
            {showTranslation ? "Hide translation" : "Translate"}
          </button>
        )}
      </div>
    </div>
  );
}
