"use client";

import { useCallback, useEffect, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { fetchCloudVoices, speakCloud, CloudVoice } from "@/lib/api";
import { LANGUAGE_CODES } from "@/types";
import LanguageSelector from "@/components/LanguageSelector";
import ChatWindow from "@/components/ChatWindow";

export default function Home() {
  const chat = useChat();
  const speech = useSpeechRecognition();
  const [cloudVoices, setCloudVoices] = useState<CloudVoice[]>([]);
  const [selectedCloudVoice, setSelectedCloudVoice] = useState<CloudVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!chat.targetLanguage) return;
    const code = LANGUAGE_CODES[chat.targetLanguage].split("-")[0];
    fetchCloudVoices(code)
      .then(setCloudVoices)
      .catch(() => setCloudVoices([]));
    setSelectedCloudVoice(null);
  }, [chat.targetLanguage]);

  const speakReply = useCallback(
    async (text: string) => {
      if (!text) return;
      setIsSpeaking(true);
      try {
        const voiceId = selectedCloudVoice?.id;
        if (voiceId) {
          await speakCloud(text, voiceId);
        } else if (chat.targetLanguage) {
          // fallback to browser TTS
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = LANGUAGE_CODES[chat.targetLanguage];
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      } catch {
        // silent fail
      } finally {
        setIsSpeaking(false);
      }
    },
    [selectedCloudVoice, chat.targetLanguage]
  );

  const handleMicToggle = useCallback(() => {
    if (speech.isListening) {
      speech.stopListening();
      return;
    }

    if (!chat.targetLanguage) return;

    speech.startListening(chat.targetLanguage, async (transcript) => {
      const reply = await chat.sendMessage(transcript);
      if (reply) {
        speakReply(reply);
      }
    });
  }, [speech, chat, speakReply]);

  const handleSendText = useCallback(
    async (text: string) => {
      const reply = await chat.sendMessage(text);
      if (reply) {
        speakReply(reply);
      }
    },
    [chat, speakReply]
  );

  const handleChangeLanguage = useCallback(() => {
    chat.resetLanguages();
    window.speechSynthesis?.cancel();
  }, [chat]);

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
      interimTranscript={speech.interimTranscript}
      error={chat.error}
      micError={speech.error}
      availableVoices={cloudVoices}
      selectedVoice={selectedCloudVoice}
      onVoiceSelect={setSelectedCloudVoice}
      onMicToggle={handleMicToggle}
      onChangeLanguage={handleChangeLanguage}
      onSendText={handleSendText}
    />
  );
}
