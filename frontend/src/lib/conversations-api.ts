import { API_URL, FETCH_DEFAULTS } from "./api";

export interface ConversationSummary {
  conversation_id: number;
  title: string;
  target_language: string;
  updated_at: string;
  last_message_preview: string | null;
}

export interface DbMessage {
  message_id: number;
  role: "user" | "assistant";
  content: string;
  translated_content: string | null;
  timestamp: string;
}

export interface ConversationDetail {
  conversation_id: number;
  title: string;
  target_language: string;
  created_at: string;
  updated_at: string;
  messages: DbMessage[];
}

async function jsonFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { ...FETCH_DEFAULTS, ...init });
  if (!res.ok) {
    let detail = `Request failed: ${res.status}`;
    try {
      detail = (await res.json())?.detail ?? detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export function listConversations(): Promise<ConversationSummary[]> {
  return jsonFetch<ConversationSummary[]>("/api/conversations");
}

export function getConversation(id: number): Promise<ConversationDetail> {
  return jsonFetch<ConversationDetail>(`/api/conversations/${id}`);
}

export function createConversation(targetLanguage: string): Promise<ConversationDetail> {
  return jsonFetch<ConversationDetail>("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_language: targetLanguage }),
  });
}

export function renameConversation(id: number, title: string): Promise<ConversationSummary> {
  return jsonFetch<ConversationSummary>(`/api/conversations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

export function setConversationTargetLanguage(
  id: number,
  targetLanguage: string
): Promise<ConversationSummary> {
  return jsonFetch<ConversationSummary>(`/api/conversations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_language: targetLanguage }),
  });
}

export function deleteConversation(id: number): Promise<void> {
  return jsonFetch<void>(`/api/conversations/${id}`, { method: "DELETE" });
}
