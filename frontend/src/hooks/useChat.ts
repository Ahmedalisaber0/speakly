"use client";

import { useState, useCallback } from "react";
import { ChatMessage, Language } from "@/types";
import { sendMessage as apiSendMessage } from "@/lib/api";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nativeLanguage, setNativeLanguage] = useState<Language | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setLanguages = useCallback(
    (native: Language, target: Language) => {
      setNativeLanguage(native);
      setTargetLanguage(target);
    },
    []
  );

  const sendMessage = useCallback(
    async (text: string): Promise<string | null> => {
      if (!nativeLanguage || !targetLanguage || !text.trim()) return null;

      const userMessage: ChatMessage = { role: "user", content: text };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiSendMessage(
          text,
          nativeLanguage,
          targetLanguage,
          [...messages, userMessage]
        );

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.reply,
          corrections: response.corrections,
          translatedReply: response.translated_reply,
          newsArticles: response.news_articles,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        return response.reply;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Something went wrong";
        setError(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [nativeLanguage, targetLanguage, messages]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const resetLanguages = useCallback(() => {
    setNativeLanguage(null);
    setTargetLanguage(null);
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    nativeLanguage,
    targetLanguage,
    error,
    setLanguages,
    sendMessage,
    clearChat,
    resetLanguages,
  };
}
