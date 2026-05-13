"use client";

import Link from "next/link";
import { ConversationSummary } from "@/lib/conversations-api";
import { getStrings } from "@/lib/strings";
import { Language } from "@/types";

interface Props {
  conversations: ConversationSummary[];
  currentId: number | null;
  nativeLanguage: Language | null;
  onSelect: (id: number) => void;
  onNew: () => void;
  onDelete: (id: number) => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ConversationSidebar({
  conversations,
  currentId,
  nativeLanguage,
  onSelect,
  onNew,
  onDelete,
}: Props) {
  const strings = getStrings(nativeLanguage);

  return (
    <aside className="w-72 flex-shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-card)] flex flex-col h-full">
      <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <Link href="/" className="font-semibold text-app">
          Speakly
        </Link>
        <div className="flex gap-2 text-xs">
          <Link
            href="/translate"
            className="text-[var(--text-muted)] hover:text-app"
          >
            Translate
          </Link>
          <Link href="/news" className="text-[var(--text-muted)] hover:text-app">
            News
          </Link>
        </div>
      </div>

      <button
        onClick={onNew}
        className="m-3 rounded-lg border border-dashed border-[var(--border-subtle)] hover:border-[var(--accent)] hover:bg-[var(--bg-muted)] text-sm py-2 transition-colors flex items-center justify-center gap-2"
      >
        <span className="text-[var(--accent)] text-lg leading-none">＋</span>
        {strings.newChat}
      </button>

      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
        {conversations.length === 0 && (
          <p className="text-center text-xs text-[var(--text-muted)] mt-6 px-3">
            {strings.noConversationsYet}
          </p>
        )}
        {conversations.map((c) => {
          const active = c.conversation_id === currentId;
          return (
            <div
              key={c.conversation_id}
              className={`group rounded-lg px-3 py-2 cursor-pointer transition-colors flex items-start gap-2 ${
                active
                  ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30"
                  : "hover:bg-[var(--bg-muted)] border border-transparent"
              }`}
              onClick={() => onSelect(c.conversation_id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p
                    className={`text-sm truncate ${
                      active ? "text-app font-medium" : "text-app"
                    }`}
                    dir="auto"
                  >
                    {c.title}
                  </p>
                  <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0">
                    {formatTime(c.updated_at)}
                  </span>
                </div>
                {c.last_message_preview && (
                  <p className="text-xs text-[var(--text-muted)] truncate mt-0.5" dir="auto">
                    {c.last_message_preview}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(strings.deleteConversation + "?")) {
                    onDelete(c.conversation_id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-[var(--danger)] p-1 -m-1"
                aria-label={strings.deleteConversation}
                title={strings.deleteConversation}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
