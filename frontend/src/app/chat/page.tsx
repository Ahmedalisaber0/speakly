"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { useConversations } from "@/hooks/useConversations";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { fetchCloudVoices, speakCloud, stopCloud, CloudVoice } from "@/lib/api";
import { LANGUAGE_CODES, Language } from "@/types";
import { getStrings } from "@/lib/strings";
import ChatWindow from "@/components/ChatWindow";
import ConversationSidebar from "@/components/chat/ConversationSidebar";
import ProfileBadge from "@/components/chat/ProfileBadge";

export default function ChatPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Native + target language come from the user profile (set at registration,
  // editable in /settings). Per-conversation override is handled below via
  // conv.target_language.
  const nativeLanguage: Language | null = (user?.language as Language) || null;
  const userTarget: Language = (user?.target_language as Language) || "English";

  const conversations = useConversations(!!user);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPlayingClarification, setIsPlayingClarification] = useState(false);
  const [lockToNative, setLockToNative] = useState(false);
  const [cloudVoices, setCloudVoices] = useState<CloudVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<CloudVoice | null>(null);
  const [nativeVoice, setNativeVoice] = useState<CloudVoice | null>(null);

  // Per-conversation target language: prefer the conversation's own setting,
  // fall back to the user's default. Useful when the user later supports
  // per-chat targets in the UI.
  const targetLanguage: Language =
    (conversations.current?.target_language as Language) || userTarget;

  // Fetch voice list for current target language so the user can pick a TTS voice.
  useEffect(() => {
    if (!targetLanguage) return;
    const code = LANGUAGE_CODES[targetLanguage].split("-")[0];
    fetchCloudVoices(code)
      .then(setCloudVoices)
      .catch(() => setCloudVoices([]));
    setSelectedVoice(null);
  }, [targetLanguage]);

  // First-available native voice for clarification card pronunciation.
  useEffect(() => {
    if (!nativeLanguage) {
      setNativeVoice(null);
      return;
    }
    const code = LANGUAGE_CODES[nativeLanguage].split("-")[0];
    fetchCloudVoices(code)
      .then((voices) => setNativeVoice(Array.isArray(voices) ? voices[0] ?? null : null))
      .catch(() => setNativeVoice(null));
  }, [nativeLanguage]);

  const speech = useSpeechRecognition();

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
        // silent — TTS failures shouldn't break chat flow
      }
    },
    []
  );

  const speakReply = useCallback(
    async (text: string) => {
      if (!text || !targetLanguage) return;
      setIsSpeaking(true);
      try {
        await speakInVoice(text, selectedVoice, LANGUAGE_CODES[targetLanguage]);
      } finally {
        setIsSpeaking(false);
      }
    },
    [selectedVoice, targetLanguage, speakInVoice]
  );

  const chat = useChat({
    nativeLanguage,
    targetLanguage,
    conversationId: conversations.currentId,
    seedMessages: conversations.current?.messages ?? [],
    onConversationCreated: (id, firstMessage) => {
      // Update sidebar immediately so it shows the new entry without round-trip.
      conversations.touch(id, firstMessage);
      conversations.select(id);
    },
    onTurnPersisted: (id, lastMessage) => {
      conversations.touch(id, lastMessage);
    },
  });

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
    if (!nativeLanguage) return;
    const hint = lockToNative ? nativeLanguage : null;
    speech.startListening(
      hint,
      (transcript) => {
        if (transcript) sendChatMessage(transcript);
      },
      { skipGrammarCheck: true }
    );
  }, [speech, nativeLanguage, lockToNative, sendChatMessage]);

  const handleStopSpeaking = useCallback(() => {
    stopCloud();
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

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
    if (!text || !nativeLanguage) return;
    setIsPlayingClarification(true);
    try {
      await speakInVoice(text, nativeVoice, LANGUAGE_CODES[nativeLanguage]);
    } finally {
      setIsPlayingClarification(false);
    }
  }, [chat.pendingClarification, nativeLanguage, nativeVoice, speakInVoice]);

  const handleNewChat = useCallback(async () => {
    // Create a fresh conversation row up-front so the sidebar shows it
    // immediately, then `useChat` will use its id on next send.
    if (!user) return;
    await conversations.create(userTarget);
  }, [user, conversations, userTarget]);

  // Middleware redirects unauthed visitors, but if the cookie is invalid the
  // server will 401 our /api/auth/me. Force a bounce in that case.
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/chat");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user || !nativeLanguage) {
    return (
      <div className="h-screen flex items-center justify-center text-[var(--text-muted)] text-sm">
        Loading…
      </div>
    );
  }

  const strings = getStrings(nativeLanguage);

  return (
    <div className="h-screen flex bg-[var(--bg-app)]">
      <ConversationSidebar
        conversations={conversations.conversations}
        currentId={conversations.currentId}
        nativeLanguage={nativeLanguage}
        onSelect={conversations.select}
        onNew={handleNewChat}
        onDelete={conversations.remove}
      />
      <main className="flex-1 min-w-0 flex flex-col">
        <ChatWindow
          messages={chat.messages}
          nativeLanguage={nativeLanguage}
          targetLanguage={targetLanguage}
          isListening={speech.isListening}
          isLoading={chat.isLoading}
          isSpeaking={isSpeaking}
          isSupported={speech.isSupported}
          recordingSeconds={speech.recordingSeconds}
          error={chat.error}
          micError={speech.error}
          availableVoices={cloudVoices}
          selectedVoice={selectedVoice}
          onVoiceSelect={setSelectedVoice}
          onMicToggle={handleMicToggle}
          onStopSpeaking={handleStopSpeaking}
          onSendText={sendChatMessage}
          pendingClarification={chat.pendingClarification}
          onAcceptClarification={handleAcceptClarification}
          onDismissClarification={handleDismissClarification}
          onListenClarification={handleListenClarification}
          isPlayingClarification={isPlayingClarification}
          lockToNative={lockToNative}
          onToggleLockToNative={() => setLockToNative((p) => !p)}
          emptyStateText={strings.conversationEmptyState}
          headerLeft={
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-app truncate" dir="auto">
                {conversations.current?.title ?? strings.newChat}
              </h1>
              {user.dialect && (
                <p className="text-xs text-[var(--text-muted)] truncate" dir="auto">
                  {user.username} · {user.dialect}
                </p>
              )}
            </div>
          }
          headerRight={<ProfileBadge nativeLanguage={nativeLanguage} />}
        />
      </main>
    </div>
  );
}
