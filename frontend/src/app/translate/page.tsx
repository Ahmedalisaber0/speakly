"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Language, LANGUAGES, LANGUAGE_CODES } from "@/types";
import { translateText, fetchCloudVoices, speakCloud, CloudVoice } from "@/lib/api";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import CloudVoiceSelector from "@/components/CloudVoiceSelector";
import SpeechCorrectionCard from "@/components/SpeechCorrectionCard";
import Flag from "@/components/Flag";

export default function TranslatePage() {
  const [fromLang, setFromLang] = useState<Language>("English");
  const [toLang, setToLang] = useState<Language>("Spanish");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [corrections, setCorrections] = useState<
    { original: string; corrected: string; explanation: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingCorrection, setIsPlayingCorrection] = useState(false);

  const speech = useSpeechRecognition();

  const [fromVoices, setFromVoices] = useState<CloudVoice[]>([]);
  const [toVoices, setToVoices] = useState<CloudVoice[]>([]);
  const [fromVoice, setFromVoice] = useState<CloudVoice | null>(null);
  const [toVoice, setToVoice] = useState<CloudVoice | null>(null);

  const loadVoices = useCallback(async (lang: Language, setter: (v: CloudVoice[]) => void) => {
    try {
      const code = LANGUAGE_CODES[lang].split("-")[0];
      const voices = await fetchCloudVoices(code);
      setter(voices);
    } catch {
      setter([]);
    }
  }, []);

  useEffect(() => {
    loadVoices(fromLang, setFromVoices);
    setFromVoice(null);
  }, [fromLang, loadVoices]);

  useEffect(() => {
    loadVoices(toLang, setToVoices);
    setToVoice(null);
  }, [toLang, loadVoices]);

  const handleSwapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setInputText(outputText);
    setOutputText(inputText);
    setCorrectedText("");
    setCorrections([]);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await translateText(inputText, fromLang, toLang);
      setOutputText(result.translated_text);
      setCorrectedText(result.corrected_text);
      setCorrections(result.corrections || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async (text: string, voice: CloudVoice | null, language: Language) => {
    if (!text) return;
    if (voice) {
      try {
        await speakCloud(text, voice.id);
      } catch {
        // Fallback to browser TTS
        browserSpeak(text, language);
      }
    } else {
      browserSpeak(text, language);
    }
  };

  const browserSpeak = (text: string, language: Language) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGE_CODES[language];
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleMicToggle = () => {
    if (speech.isListening) {
      speech.stopListening();
      return;
    }
    speech.startListening(fromLang, (transcript) => {
      setInputText((prev) => (prev ? prev + " " + transcript : transcript));
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-md">
        <div className="h-16 px-6 flex items-center justify-between max-w-full">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-azure)] flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <span className="font-bold text-[var(--text-primary)]">Speakly</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-smooth"
            >
              Practice
            </Link>
            <Link 
              href="/translate" 
              className="text-sm text-[var(--color-primary)] font-medium"
            >
              Translate
            </Link>
            <Link 
              href="/news" 
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-smooth"
            >
              News
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button className="md:hidden w-10 h-10 flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--color-primary)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Language Selector Bar - Modern */}
      <div className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] px-6 py-4">
        <div className="flex items-center justify-center gap-4 max-w-full">
          {/* From Language */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)]">
            <Flag language={fromLang} size={20} />
            <select
              value={fromLang}
              onChange={(e) => setFromLang(e.target.value as Language)}
              className="text-sm font-medium bg-transparent focus:outline-none text-[var(--text-primary)] cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapLanguages}
            className="w-10 h-10 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-smooth flex items-center justify-center"
            title="Swap languages"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m0 0l4 4m10-4v12m0 0l4-4m0 0l-4-4" />
            </svg>
          </button>

          {/* To Language */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)]">
            <Flag language={toLang} size={20} />
            <select
              value={toLang}
              onChange={(e) => setToLang(e.target.value as Language)}
              className="text-sm font-medium bg-transparent focus:outline-none text-[var(--text-primary)] cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-[#fee2e2] border border-[var(--color-accent)] text-[var(--color-accent)] text-sm">
              {error}
            </div>
          )}

          {/* Translation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Input Box */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                {fromLang}
              </label>
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Enter text in ${fromLang}...`}
                  className="w-full h-64 p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none transition-smooth"
                />
                <div className="absolute bottom-3 right-3 text-xs text-[var(--text-tertiary)]">
                  {inputText.length} characters
                </div>
              </div>
              <div className="flex items-center gap-2 justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSpeak(inputText, fromVoice, fromLang)}
                    disabled={!inputText.trim()}
                    className="p-2.5 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
                    title="Play"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  {inputText && (
                    <button
                      onClick={() => { setInputText(""); setOutputText(""); setCorrectedText(""); setCorrections([]); }}
                      className="p-2.5 rounded-lg border border-[var(--border-primary)] hover:bg-[#fee2e2] text-[var(--text-secondary)] hover:text-[var(--color-accent)] transition-smooth"
                      title="Clear"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {speech.isSupported && (
                  <button
                    onClick={handleMicToggle}
                    className={`p-2.5 rounded-lg transition-smooth ${
                      speech.isListening
                        ? "bg-[var(--color-accent)] text-white animate-pulse"
                        : "border border-[var(--border-primary)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--color-primary)]"
                    }`}
                    title={speech.isListening ? "Stop listening" : "Start listening"}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Output Box */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                {toLang}
              </label>
              <div className="relative">
                <div className="w-full h-64 p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] resize-none overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-6 h-6 text-[var(--color-primary)] animate-spin-slow" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  ) : outputText ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{outputText}</p>
                  ) : (
                    <p className="text-[var(--text-tertiary)] italic">Translation will appear here...</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 justify-between">
                <button
                  onClick={() => handleSpeak(outputText, toVoice, toLang)}
                  disabled={!outputText}
                  className="p-2.5 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
                  title="Play"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleCopy(outputText)}
                  disabled={!outputText}
                  className="p-2.5 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
                  title="Copy"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Corrections Section */}
          {corrections.length > 0 && (
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)]">
                Corrections & Suggestions
              </h3>
              <div className="space-y-2">
                {corrections.map((c, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#fef3c7] border border-[#fcd34d] space-y-1">
                    <div className="text-sm">
                      <span className="line-through text-[#b45309]">{c.original}</span>
                      <span className="mx-2 text-[#b45309]">→</span>
                      <span className="font-medium text-[#15803d]">{c.corrected}</span>
                    </div>
                    {c.explanation && (
                      <p className="text-xs text-[#7c2d12]">{c.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] px-6 py-4 sticky bottom-0">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-4">
          <button
            onClick={handleTranslate}
            disabled={!inputText.trim() || isLoading}
            className="flex-1 max-w-sm px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-smooth flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-5 h-5 animate-spin-slow" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Translating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Translate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
