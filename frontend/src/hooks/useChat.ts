"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatMessage, Language } from "@/types";
import {
  sendMessage as apiSendMessage,
  translateText,
  ChatApiResponse,
} from "@/lib/api";
import { DbMessage } from "@/lib/conversations-api";

export interface PendingClarification {
  suggested: string;
  // Bot's reply was generated, but we hide it until the user confirms or dismisses.
  // If they dismiss, we flush this to the chat.
  pendingReply: ChatApiResponse;
}

export interface UseChatOptions {
  nativeLanguage: Language | null;
  targetLanguage: Language | null;
  // Conversation ID to attach this chat to. null means the next message
  // creates a new conversation; the server returns its id, which the parent
  // should latch onto via onConversationCreated.
  conversationId: number | null;
  // Initial messages to seed when conversationId changes (loaded by useConversations).
  seedMessages: DbMessage[];
  // Called once when the server creates a fresh conversation in response to a
  // chat call with conversationId=null. Parent should set the new id and
  // refresh the sidebar.
  onConversationCreated?: (conversationId: number, firstUserMessage: string) => void;
  // Called after every successful (non-clarified) round-trip so the sidebar
  // can resort and update the preview.
  onTurnPersisted?: (conversationId: number, lastUserMessage: string) => void;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function dbMessageToChat(m: DbMessage): ChatMessage {
  return {
    id: `db-${m.message_id}`,
    role: m.role,
    content: m.content,
    translatedContent: m.translated_content || undefined,
    translationStatus: m.translated_content ? "done" : undefined,
  };
}

export function useChat({
  nativeLanguage,
  targetLanguage,
  conversationId,
  seedMessages,
  onConversationCreated,
  onTurnPersisted,
}: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingClarification, setPendingClarification] =
    useState<PendingClarification | null>(null);

  // Track which conversation's messages we've seeded so we don't clobber
  // local state with stale seedMessages on every render.
  const seededForRef = useRef<number | null | "none">("none");

  useEffect(() => {
    // When the conversation switches, replace local messages with the seed
    // (DB messages of the new conversation) and clear stale clarifications.
    const key = conversationId ?? null;
    if (seededForRef.current === key) return;
    seededForRef.current = key;
    setMessages(seedMessages.map(dbMessageToChat));
    setPendingClarification(null);
    setError(null);
  }, [conversationId, seedMessages]);

  const translateUserMessage = useCallback(
    (id: string, text: string, native: Language, target: Language) => {
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
          newHistory,
          conversationId
        );

        // Server may have created a new conversation for us — surface its id
        // so the parent can latch onto it for subsequent turns.
        const echoedId = response.conversation_id;
        if (echoedId != null && conversationId == null && onConversationCreated) {
          // Mark the seed-ref as "we own this id now" so the upcoming
          // seedMessages flip from useConversations doesn't wipe local state.
          seededForRef.current = echoedId;
          onConversationCreated(echoedId, text);
        }

        if (response.needs_clarification && response.suggested_correction) {
          setPendingClarification({
            suggested: response.suggested_correction,
            pendingReply: response,
          });
          return null;
        }

        const assistantMessage = buildAssistantMessage(response);
        setMessages((prev) => [...prev, assistantMessage]);

        if (echoedId != null && onTurnPersisted) {
          onTurnPersisted(echoedId, text);
        }

        return response.reply;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [
      nativeLanguage,
      targetLanguage,
      conversationId,
      translateUserMessage,
      buildAssistantMessage,
      onConversationCreated,
      onTurnPersisted,
    ]
  );

  const sendMessage = useCallback(
    async (text: string): Promise<string | null> => {
      if (!text.trim()) return null;
      return runChat(text, messages);
    },
    [messages, runChat]
  );

  const acceptClarification = useCallback(async (): Promise<string | null> => {
    const pending = pendingClarification;
    if (!pending) return null;
    const baseHistory =
      messages.length > 0 && messages[messages.length - 1].role === "user"
        ? messages.slice(0, -1)
        : messages;
    return runChat(pending.suggested, baseHistory);
  }, [pendingClarification, messages, runChat]);

  const dismissClarification = useCallback((): string | null => {
    const pending = pendingClarification;
    if (!pending) return null;
    setPendingClarification(null);
    const assistantMessage = buildAssistantMessage(pending.pendingReply);
    setMessages((prev) => [...prev, assistantMessage]);
    return pending.pendingReply.reply || null;
  }, [pendingClarification, buildAssistantMessage]);

  return {
    messages,
    isLoading,
    error,
    pendingClarification,
    sendMessage,
    acceptClarification,
    dismissClarification,
  };
}
