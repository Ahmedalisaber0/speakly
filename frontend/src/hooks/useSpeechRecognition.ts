"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { LANGUAGE_CODES, Language } from "@/types";
import { transcribeAudio, checkGrammar, GrammarCheckResult } from "@/lib/api";

export interface SpeechCorrection extends GrammarCheckResult {
  language: Language;
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechCorrection, setSpeechCorrection] = useState<SpeechCorrection | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const onResultRef = useRef<((text: string) => void) | null>(null);
  // null = auto-detect (Whisper picks the language) and skip the grammar check.
  const languageRef = useRef<Language | null>(null);
  const skipGrammarCheckRef = useRef<boolean>(false);
  const mimeRef = useRef<string>("");
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof window.MediaRecorder === "undefined"
    ) {
      setIsSupported(false);
    }
  }, []);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const stopTicker = useCallback(() => {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  }, []);

  // Stop & release the stream if the component using this hook unmounts mid-record.
  useEffect(() => {
    return () => {
      const rec = mediaRecorderRef.current;
      if (rec && rec.state !== "inactive") {
        try {
          rec.stop();
        } catch {
          // ignore
        }
      }
      cleanupStream();
      stopTicker();
    };
  }, [cleanupStream, stopTicker]);

  const startListening = useCallback(
    async (
      language: Language | null,
      onResult: (text: string) => void,
      options?: { skipGrammarCheck?: boolean }
    ) => {
      if (!isSupported) return;
      setError(null);
      onResultRef.current = onResult;
      languageRef.current = language;
      skipGrammarCheckRef.current = !!options?.skipGrammarCheck;

      try {
        // Mono 16 kHz with browser-side noise / echo cleanup is what Whisper
        // actually wants. Without these constraints browsers default to 48 kHz
        // stereo with no cleanup, and Whisper hallucinates words on quiet
        // breaths or background noise.
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 16000,
          },
        });
        streamRef.current = stream;

        const candidates = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/mp4",
          "audio/ogg;codecs=opus",
        ];
        const mimeType =
          candidates.find((m) => MediaRecorder.isTypeSupported(m)) || "";
        mimeRef.current = mimeType;

        // 32 kbps Opus is plenty for speech and avoids the very-low-bitrate
        // dropouts the codec defaults to during quiet passages, which were
        // garbling short utterances.
        const recorderOptions: MediaRecorderOptions = {
          audioBitsPerSecond: 32000,
        };
        if (mimeType) recorderOptions.mimeType = mimeType;
        const recorder = new MediaRecorder(stream, recorderOptions);
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onerror = (e) => {
          console.error("MediaRecorder error", e);
          setError("Recording failed");
          cleanupStream();
          stopTicker();
          setIsListening(false);
        };

        recorder.onstop = async () => {
          cleanupStream();
          stopTicker();
          setIsListening(false);

          if (chunksRef.current.length === 0) return;
          const blob = new Blob(chunksRef.current, {
            type: mimeRef.current || "audio/webm",
          });
          chunksRef.current = [];

          if (blob.size < 500) {
            // Probably silent / cancelled too fast.
            return;
          }

          setIsTranscribing(true);
          let transcribedText = "";
          try {
            const lang = languageRef.current;
            const langCode = lang
              ? LANGUAGE_CODES[lang].split("-")[0]
              : undefined;
            transcribedText = await transcribeAudio(blob, langCode);
          } catch (err) {
            console.error("Transcription failed", err);
            setError(
              err instanceof Error ? err.message : "Transcription failed"
            );
          } finally {
            setIsTranscribing(false);
          }

          if (!transcribedText) return;

          const lang = languageRef.current;
          const shouldGrammarCheck = !!lang && !skipGrammarCheckRef.current;

          // IMPORTANT: mark grammar-check as in-progress BEFORE notifying the
          // consumer, so consumers (e.g. the Practice page) can decide to wait
          // for it before auto-sending. React 18 batches these state updates
          // with whatever the consumer does inside onResult, so by the time
          // their useEffect runs both updates are visible together.
          if (shouldGrammarCheck) {
            setIsCheckingGrammar(true);
          }

          setTranscript(transcribedText);
          onResultRef.current?.(transcribedText);

          if (shouldGrammarCheck && lang) {
            try {
              const result = await checkGrammar(transcribedText, lang);
              const safeCorrections = Array.isArray(result?.corrections)
                ? result.corrections
                : [];
              const hasFixes =
                safeCorrections.length > 0 &&
                (result?.corrected ?? "").trim() !== transcribedText.trim();
              if (hasFixes) {
                setSpeechCorrection({
                  ...result,
                  corrections: safeCorrections,
                  language: lang,
                });
              }
            } catch (err) {
              console.error("Grammar check failed", err);
            } finally {
              setIsCheckingGrammar(false);
            }
          }
        };

        setTranscript("");
        setSpeechCorrection(null);
        setIsListening(true);
        // Live recording timer — gives the user feedback that the mic is
        // actually capturing (Whisper has no interim results, so without
        // this nothing changes on screen between mic-press and stop).
        setRecordingSeconds(0);
        const startedAt = Date.now();
        stopTicker();
        tickerRef.current = setInterval(() => {
          setRecordingSeconds(Math.floor((Date.now() - startedAt) / 1000));
        }, 250);
        recorder.start();
      } catch (err) {
        cleanupStream();
        stopTicker();
        setIsListening(false);
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setError(
            "Microphone access denied. Please allow microphone permission in your browser settings."
          );
        } else {
          setError(
            err instanceof Error ? err.message : "Could not access microphone"
          );
        }
      }
    },
    [isSupported, cleanupStream, stopTicker]
  );

  const stopListening = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop();
    } else {
      cleanupStream();
      stopTicker();
      setIsListening(false);
    }
  }, [cleanupStream, stopTicker]);

  const clearSpeechCorrection = useCallback(() => {
    setSpeechCorrection(null);
  }, []);

  return {
    isListening,
    isTranscribing,
    isCheckingGrammar,
    transcript,
    interimTranscript: "", // Whisper doesn't provide interim results — kept for API compat.
    recordingSeconds,
    isSupported,
    error,
    speechCorrection,
    clearSpeechCorrection,
    startListening,
    stopListening,
  };
}
