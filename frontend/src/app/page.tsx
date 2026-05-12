"use client";

import { useCallback, useEffect, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { fetchCloudVoices, speakCloud, stopCloud, CloudVoice } from "@/lib/api";
import { LANGUAGE_CODES } from "@/types";
import LanguageSelector from "@/components/LanguageSelector";
import ChatWindow from "@/components/ChatWindow";

export default function Home() {
  const chat = useChat();
  const speech = useSpeechRecognition();
  const [cloudVoices, setCloudVoices] = useState<CloudVoice[]>([]);
  const [selectedCloudVoice, setSelectedCloudVoice] = useState<CloudVoice | null>(null);
  const [nativeVoice, setNativeVoice] = useState<CloudVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPlayingClarification, setIsPlayingClarification] = useState(false);
  // Auto-detect by default (Whisper is good at this and it copes when the user
  // mixes a foreign word into native speech). Lock-to-native is opt-in for
  // users whose native language is hard for Whisper to detect on short clips.
  const [lockToNative, setLockToNative] = useState(false);

  // Voices for the target language (used to TTS bot replies).
  useEffect(() => {
    if (!chat.targetLanguage) return;
    const code = LANGUAGE_CODES[chat.targetLanguage].split("-")[0];
    fetchCloudVoices(code)
      .then(setCloudVoices)
      .catch(() => setCloudVoices([]));
    setSelectedCloudVoice(null);
  }, [chat.targetLanguage]);

  // A single default voice for the native language (used to TTS the
  // clarification card's suggested correction so the user hears the proper
  // pronunciation). The user doesn't pick this one — first sensible match wins.
  useEffect(() => {
    if (!chat.nativeLanguage) {
      setNativeVoice(null);
      return;
    }
    const code = LANGUAGE_CODES[chat.nativeLanguage].split("-")[0];
    fetchCloudVoices(code)
      .then((voices) => setNativeVoice(Array.isArray(voices) ? voices[0] ?? null : null))
      .catch(() => setNativeVoice(null));
  }, [chat.nativeLanguage]);

  const speakInVoice = useCallback(
    async (text: string, voice: CloudVoice | null, fallbackLang: string) => {
      if (!text) return;
      try {
        if (voice) {
          await speakCloud(text, voice.id);
        } else if (typeof window !== "undefined" && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = fallbackLang;
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      } catch {
        // silent fail
      }
    },
    []
  );

  const speakReply = useCallback(
    async (text: string) => {
      if (!text || !chat.targetLanguage) return;
      setIsSpeaking(true);
      try {
        await speakInVoice(
          text,
          selectedCloudVoice,
          LANGUAGE_CODES[chat.targetLanguage]
        );
      } finally {
        setIsSpeaking(false);
      }
    },
    [selectedCloudVoice, chat.targetLanguage, speakInVoice]
  );

  const sendChatMessage = useCallback(
    async (text: string) => {
      const reply = await chat.sendMessage(text);
      if (reply) speakReply(reply);
    },
    [chat, speakReply]
  );

  const handleMicToggle = useCallback(() => {
    if (speech.isListening) {
      speech.stopListening();
      return;
    }
    if (!chat.nativeLanguage) return;
    // Default: pass null so Whisper auto-detects whatever language the user
    // actually speaks. If `lockToNative` is on, hint Whisper with the user's
    // declared native language for slightly better accuracy on that language
    // (at the cost of misreading any foreign words mixed in).
    const hint = lockToNative ? chat.nativeLanguage : null;
    speech.startListening(
      hint,
      (transcript) => {
        if (transcript) sendChatMessage(transcript);
      },
      { skipGrammarCheck: true }
    );
  }, [speech, chat.nativeLanguage, lockToNative, sendChatMessage]);

  const handleSendText = useCallback(
    (text: string) => {
      sendChatMessage(text);
    },
    [sendChatMessage]
  );

  const handleAcceptClarification = useCallback(async () => {
    const reply = await chat.acceptClarification();
    if (reply) speakReply(reply);
  }, [chat, speakReply]);

  const handleDismissClarification = useCallback(() => {
    const reply = chat.dismissClarification();
    if (reply) speakReply(reply);
  }, [chat, speakReply]);

  const handleListenClarification = useCallback(async () => {
    const text = chat.pendingClarification?.suggested;
    if (!text || !chat.nativeLanguage) return;
    setIsPlayingClarification(true);
    try {
      await speakInVoice(text, nativeVoice, LANGUAGE_CODES[chat.nativeLanguage]);
    } finally {
      setIsPlayingClarification(false);
    }
  }, [chat.pendingClarification, chat.nativeLanguage, nativeVoice, speakInVoice]);

  const handleStopSpeaking = useCallback(() => {
    // Cuts both Edge-TTS playback (via the module-level Audio instance) and any
    // browser-TTS fallback that might be in progress.
    stopCloud();
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const handleChangeLanguage = useCallback(() => {
    chat.resetLanguages();
    handleStopSpeaking();
  }, [chat, handleStopSpeaking]);

  if (!chat.nativeLanguage || !chat.targetLanguage) {
    return <LanguageSelector onSelect={chat.setLanguages} />;
  }

  return (
    <ChatWindow
      messages={chat.messages}
      nativeLanguage={chat.nativeLanguage}
      targetLanguage={chat.targetLanguage}
      isListening={speech.isListening}
      isLoading={chat.isLoading}
      isSpeaking={isSpeaking}
      isSupported={speech.isSupported}
      recordingSeconds={speech.recordingSeconds}
      error={chat.error}
      micError={speech.error}
      availableVoices={cloudVoices}
      selectedVoice={selectedCloudVoice}
      onVoiceSelect={setSelectedCloudVoice}
      onMicToggle={handleMicToggle}
      onStopSpeaking={handleStopSpeaking}
      onChangeLanguage={handleChangeLanguage}
      onSendText={handleSendText}
      pendingClarification={chat.pendingClarification}
      onAcceptClarification={handleAcceptClarification}
      onDismissClarification={handleDismissClarification}
      onListenClarification={handleListenClarification}
      isPlayingClarification={isPlayingClarification}
      lockToNative={lockToNative}
      onToggleLockToNative={() => setLockToNative((prev) => !prev)}
    />
  );
}
