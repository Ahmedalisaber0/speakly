"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChatMessage as ChatMessageType, Language } from "@/types";
import { CloudVoice } from "@/lib/api";
import ChatMessage from "./ChatMessage";
import CloudVoiceSelector from "./CloudVoiceSelector";

interface Props {
  messages: ChatMessageType[];
  nativeLanguage: Language;
  targetLanguage: Language;
  isListening: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  interimTranscript: string;
  error: string | null;
  micError: string | null;
  availableVoices: CloudVoice[];
  selectedVoice: CloudVoice | null;
  onVoiceSelect: (voice: CloudVoice) => void;
  onMicToggle: () => void;
  onChangeLanguage: () => void;
  onSendText: (text: string) => void;
}

export default function ChatWindow({
  messages,
  nativeLanguage,
  targetLanguage,
  isListening,
  isLoading,
  isSpeaking,
  isSupported,
  interimTranscript,
  error,
  micError,
  availableVoices,
  selectedVoice,
  onVoiceSelect,
  onMicToggle,
  onChangeLanguage,
  onSendText,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [textInput, setTextInput] = useState("");

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
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-800">Speakly</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/" className="text-blue-600 font-medium">
              Practice
            </Link>
            <Link
              href="/translate"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Translate
            </Link>
            <Link
              href="/news"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              News
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{nativeLanguage}</span>
            <span className="text-gray-400">→</span>
            <span className="text-sm font-medium text-blue-600">{targetLanguage}</span>
            <button
              onClick={onChangeLanguage}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              change
            </button>
          </div>
        </div>
        {availableVoices.length > 0 && (
          <div className="flex items-center gap-2 px-4 pb-2">
            <span className="text-xs text-gray-400">Voice:</span>
            <CloudVoiceSelector
              voices={availableVoices}
              selectedVoice={selectedVoice}
              onSelect={onVoiceSelect}
            />
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg">Start practicing {targetLanguage}!</p>
            <p className="text-sm mt-1">
              Type a message or tap the microphone to speak.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}

        {error && (
          <div className="text-center text-red-500 text-sm bg-red-50 rounded-lg p-3">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        {interimTranscript && (
          <p className="text-sm text-gray-500 italic text-center mb-2">
            {interimTranscript}
          </p>
        )}

        {micError && (
          <p className="text-sm text-red-500 text-center mb-2">{micError}</p>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Type in ${targetLanguage}...`}
            disabled={isLoading || isListening}
            className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-100"
          />

          {/* Send button */}
          <button
            onClick={handleSendText}
            disabled={!textInput.trim() || isLoading}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
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

          {/* Mic button */}
          <button
            onClick={onMicToggle}
            disabled={isLoading || isSpeaking}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isLoading || isSpeaking
                ? "bg-gray-300 cursor-not-allowed"
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
        </div>

        <p className="text-xs text-gray-400 text-center mt-2">
          {isLoading
            ? "Thinking..."
            : isSpeaking
            ? "Speaking..."
            : isListening
            ? "Listening... tap mic to stop"
            : "Type or tap mic to speak"}
        </p>
      </div>
    </div>
  );
}
