"use client";

import { useState, useCallback } from "react";
import { ChatMessage, Language } from "@/types";
import {
  sendMessage as apiSendMessage,
  translateText,
  ChatApiResponse,
} from "@/lib/api";

export interface PendingClarification {
  suggested: string;
  // Bot's reply was generated, but we hide it until the user confirms or dismisses.
  // If they dismiss, we flush this to the chat.
  pendingReply: ChatApiResponse;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nativeLanguage, setNativeLanguage] = useState<Language | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingClarification, setPendingClarification] =
    useState<PendingClarification | null>(null);

  const setLanguages = useCallback((native: Language, target: Language) => {
    setNativeLanguage(native);
    setTargetLanguage(target);
  }, []);

  const translateUserMessage = useCallback(
    (id: string, text: string, native: Language, target: Language) => {
      // Same-language: translation is the original text — no API round-trip needed.
      if (native === target) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? { ...m, translatedContent: text, translationStatus: "done" }
              : m
          )
        );
        return;
      }
      translateText(text, native, target)
        .then((res) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === id
                ? {
                    ...m,
                    translatedContent: res.translated_text,
                    translationStatus: "done",
                  }
                : m
            )
          );
        })
        .catch(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === id ? { ...m, translationStatus: "failed" } : m
            )
          );
        });
    },
    []
  );

  const buildAssistantMessage = useCallback(
    (response: ChatApiResponse): ChatMessage => ({
      id: generateId(),
      role: "assistant",
      content: response.reply,
      translatedContent: response.translated_reply || undefined,
      translationStatus: response.translated_reply ? "done" : "failed",
      corrections: response.corrections,
      newsArticles: response.news_articles,
    }),
    []
  );

  // Core round-trip: appends `text` as a user message on top of the supplied
  // `history`, fires off the parallel translation, calls the chat API, and
  // either appends the bot reply or surfaces a clarification card.
  // Taking `history` as an explicit argument lets `acceptClarification` swap
  // out the trailing user message without depending on stale closure state.
  const runChat = useCallback(
    async (text: string, history: ChatMessage[]): Promise<string | null> => {
      if (!nativeLanguage || !targetLanguage) return null;

      const userId = generateId();
      const userMessage: ChatMessage = {
        id: userId,
        role: "user",
        content: text,
        translationStatus: "pending",
      };
      const newHistory = [...history, userMessage];
      setMessages(newHistory);
      setIsLoading(true);
      setError(null);
      setPendingClarification(null);

      translateUserMessage(userId, text, nativeLanguage, targetLanguage);

      try {
        const response = await apiSendMessage(
          text,
          nativeLanguage,
          targetLanguage,
          newHistory
        );

        if (response.needs_clarification && response.suggested_correction) {
          setPendingClarification({
            suggested: response.suggested_correction,
            pendingReply: response,
          });
          return null;
        }

        const assistantMessage = buildAssistantMessage(response);
        setMessages((prev) => [...prev, assistantMessage]);
        return response.reply;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [nativeLanguage, targetLanguage, translateUserMessage, buildAssistantMessage]
  );

  const sendMessage = useCallback(
    async (text: string): Promise<string | null> => {
      if (!text.trim()) return null;
      return runChat(text, messages);
    },
    [messages, runChat]
  );

  // Accept the suggested correction: drop the trailing (confusing) user message
  // and re-run the chat with the corrected text in its place.
  const acceptClarification = useCallback(async (): Promise<string | null> => {
    const pending = pendingClarification;
    if (!pending) return null;
    const baseHistory =
      messages.length > 0 && messages[messages.length - 1].role === "user"
        ? messages.slice(0, -1)
        : messages;
    return runChat(pending.suggested, baseHistory);
  }, [pendingClarification, messages, runChat]);

  // Dismiss: keep the original bot reply by flushing it into the chat.
  // Returns the reply text so callers can TTS it.
  const dismissClarification = useCallback((): string | null => {
    const pending = pendingClarification;
    if (!pending) return null;
    setPendingClarification(null);
    const assistantMessage = buildAssistantMessage(pending.pendingReply);
    setMessages((prev) => [...prev, assistantMessage]);
    return pending.pendingReply.reply || null;
  }, [pendingClarification, buildAssistantMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setPendingClarification(null);
  }, []);

  const resetLanguages = useCallback(() => {
    setNativeLanguage(null);
    setTargetLanguage(null);
    setMessages([]);
    setError(null);
    setPendingClarification(null);
  }, []);

  return {
    messages,
    isLoading,
    nativeLanguage,
    targetLanguage,
    error,
    pendingClarification,
    setLanguages,
    sendMessage,
    acceptClarification,
    dismissClarification,
    clearChat,
    resetLanguages,
  };
}
