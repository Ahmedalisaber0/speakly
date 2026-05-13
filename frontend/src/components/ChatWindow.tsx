"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage as ChatMessageType, Language } from "@/types";
import { CloudVoice } from "@/lib/api";
import { PendingClarification } from "@/hooks/useChat";
import { getStrings } from "@/lib/strings";
import ChatMessage from "./ChatMessage";
import CloudVoiceSelector from "./CloudVoiceSelector";
import ClarificationCard from "./ClarificationCard";

interface Props {
  messages: ChatMessageType[];
  nativeLanguage: Language;
  targetLanguage: Language;
  isListening: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  recordingSeconds: number;
  error: string | null;
  micError: string | null;
  availableVoices: CloudVoice[];
  selectedVoice: CloudVoice | null;
  onVoiceSelect: (voice: CloudVoice) => void;
  onMicToggle: () => void;
  onStopSpeaking: () => void;
  onSendText: (text: string) => void;
  pendingClarification: PendingClarification | null;
  onAcceptClarification: () => void;
  onDismissClarification: () => void;
  onListenClarification: () => void;
  isPlayingClarification: boolean;
  lockToNative: boolean;
  onToggleLockToNative: () => void;
  // Optional content slotted into the panel header (e.g. ProfileBadge or
  // a conversation title). When omitted, no header is rendered.
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  emptyStateText?: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ChatWindow({
  messages,
  nativeLanguage,
  targetLanguage,
  isListening,
  isLoading,
  isSpeaking,
  isSupported,
  recordingSeconds,
  error,
  micError,
  availableVoices,
  selectedVoice,
  onVoiceSelect,
  onMicToggle,
  onStopSpeaking,
  onSendText,
  pendingClarification,
  onAcceptClarification,
  onDismissClarification,
  onListenClarification,
  isPlayingClarification,
  lockToNative,
  onToggleLockToNative,
  headerLeft,
  headerRight,
  emptyStateText,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [textInput, setTextInput] = useState("");
  const strings = getStrings(nativeLanguage);
  // Defensive defaults — the API layer occasionally hands back a non-array
  // (e.g. when /api/voices returns 404 and the body parses as something
  // unexpected), and an undefined here would crash the whole render with
  // "Cannot read properties of undefined (reading 'length')".
  const safeMessages = Array.isArray(messages) ? messages : [];
  const safeVoices = Array.isArray(availableVoices) ? availableVoices : [];

  const statusText = isLoading
    ? strings.statusThinking
    : isSpeaking
    ? strings.statusSpeaking
    : isListening
    ? `${strings.statusListening} · ${formatDuration(recordingSeconds)}`
    : strings.statusIdle;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendText = () => {
    if (!textInput.trim() || isLoading) return;
    onSendText(textInput.trim());
    setTextInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {(headerLeft || headerRight) && (
        <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {headerLeft}
          </div>
          <div className="flex items-center gap-3">{headerRight}</div>
        </div>
      )}
      <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] text-xs">
        <span className="text-[var(--text-muted)]">{nativeLanguage}</span>
        <span className="text-[var(--text-muted)]">→</span>
        <span className="font-medium text-[var(--accent)]">{targetLanguage}</span>
        {safeVoices.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Voice:</span>
            <CloudVoiceSelector
              voices={safeVoices}
              selectedVoice={selectedVoice}
              onSelect={onVoiceSelect}
            />
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[var(--bg-app)]">
        {safeMessages.length === 0 && (
          <div className="text-center text-[var(--text-muted)] mt-20">
            <p className="text-lg" dir="auto">
              {emptyStateText ?? `Start practicing ${targetLanguage}!`}
            </p>
            <p className="text-sm mt-1" dir="auto">
              {strings.statusIdle}
            </p>
          </div>
        )}

        {safeMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} nativeLanguage={nativeLanguage} />
        ))}

        {error && (
          <div className="text-center text-[var(--danger)] text-sm bg-red-500/10 rounded-lg p-3">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 relative">
        {pendingClarification && (
          <div className="absolute left-4 right-4 bottom-full mb-2 z-10">
            <ClarificationCard
              suggestedText={pendingClarification.suggested}
              nativeLanguage={nativeLanguage}
              onAccept={onAcceptClarification}
              onDismiss={onDismissClarification}
              onListen={onListenClarification}
              isPlayingListen={isPlayingClarification}
            />
          </div>
        )}

        {micError && (
          <p className="text-sm text-[var(--danger)] text-center mb-2" dir="auto">
            {micError}
          </p>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Type in ${nativeLanguage}...`}
            disabled={isLoading || isListening}
            className="flex-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] text-app px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] disabled:bg-[var(--bg-muted)]"
          />

          {/* Send button */}
          <button
            onClick={handleSendText}
            disabled={!textInput.trim() || isLoading}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19V5m0 0l-7 7m7-7l7 7"
              />
            </svg>
          </button>

          {/* Mic / Stop-speaking button. While the bot is speaking the same
              slot turns into a stop-playback button so the user can cut off
              long replies; while loading it shows a spinner. */}
          {isSupported && (
            <button
              onClick={isSpeaking ? onStopSpeaking : onMicToggle}
              disabled={isLoading}
              aria-label={
                isSpeaking
                  ? strings.stopSpeakingAria
                  : isListening
                  ? strings.statusListening
                  : strings.statusIdle
              }
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isLoading
                  ? "bg-gray-300 cursor-not-allowed"
                  : isSpeaking
                  ? "bg-orange-500 hover:bg-orange-600 shadow-md"
                  : isListening
                  ? "bg-red-500 animate-pulse shadow-lg shadow-red-500/50"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isLoading ? (
                <svg
                  className="w-5 h-5 text-white animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : isSpeaking ? (
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="6" y="6" width="12" height="12" rx="1.5" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 gap-2">
          <p className="text-xs text-[var(--text-muted)] flex-1 text-center" dir="auto">
            {statusText}
          </p>
          <button
            onClick={onToggleLockToNative}
            disabled={isListening}
            title={
              lockToNative
                ? `Mic locked to ${nativeLanguage} — click to auto-detect`
                : `Mic auto-detects language — click to lock to ${nativeLanguage}`
            }
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              lockToNative
                ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
            }`}
          >
            {lockToNative ? (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {nativeLanguage}
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Auto
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
