"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ConversationDetail,
  ConversationSummary,
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  renameConversation as apiRename,
} from "@/lib/conversations-api";

export function useConversations(enabled: boolean = true) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [current, setCurrent] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const list = await listConversations();
      setConversations(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    }
  }, [enabled]);

  // Sync from the server when this hook becomes enabled (after login).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  // When the selected id changes, fetch the detail (with messages).
  useEffect(() => {
    if (currentId == null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrent(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getConversation(currentId)
      .then((detail) => {
        if (!cancelled) setCurrent(detail);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load conversation");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentId]);

  const select = useCallback((id: number | null) => {
    setCurrentId(id);
  }, []);

  const create = useCallback(async (targetLanguage: string) => {
    const conv = await createConversation(targetLanguage);
    setCurrent(conv);
    setCurrentId(conv.conversation_id);
    await refresh();
    return conv;
  }, [refresh]);

  const remove = useCallback(async (id: number) => {
    await deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.conversation_id !== id));
    if (currentId === id) {
      setCurrentId(null);
      setCurrent(null);
    }
  }, [currentId]);

  const rename = useCallback(async (id: number, title: string) => {
    const updated = await apiRename(id, title);
    setConversations((prev) =>
      prev.map((c) => (c.conversation_id === id ? { ...c, title: updated.title } : c))
    );
    if (current?.conversation_id === id) {
      setCurrent({ ...current, title: updated.title });
    }
  }, [current]);

  // After the chat hook persists a turn, the sidebar needs to refresh order
  // and the current detail's messages don't need a fresh GET because they're
  // already in local React state. We just update the summary timestamps.
  const touch = useCallback((conversationId: number, lastPreview: string) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.conversation_id === conversationId);
      const now = new Date().toISOString();
      if (idx === -1) {
        return [
          {
            conversation_id: conversationId,
            title: lastPreview.slice(0, 40) || "New chat",
            target_language: "English",
            updated_at: now,
            last_message_preview: lastPreview,
          },
          ...prev,
        ];
      }
      const existing = prev[idx];
      const updated: ConversationSummary = {
        ...existing,
        updated_at: now,
        last_message_preview: lastPreview,
        // First-message auto-title — if title was the placeholder, mirror what the backend did.
        title: existing.title === "New chat" ? lastPreview.slice(0, 40) || "New chat" : existing.title,
      };
      const remaining = prev.filter((_, i) => i !== idx);
      return [updated, ...remaining];
    });
  }, []);

  return {
    conversations,
    current,
    currentId,
    loading,
    error,
    select,
    create,
    remove,
    rename,
    refresh,
    touch,
  };
}
