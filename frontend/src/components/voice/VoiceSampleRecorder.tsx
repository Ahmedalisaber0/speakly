"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  // Called whenever the user finalizes (or clears) a sample. Pass the recorded
  // Blob to the parent for upload, or null when the user discards a recording.
  onChange: (blob: Blob | null) => void;
  initialUrl?: string | null;   // optional existing sample URL for replay
  maxSeconds?: number;
}

export default function VoiceSampleRecorder({
  onChange,
  initialUrl = null,
  maxSeconds = 10,
}: Props) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAll = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const r = recorderRef.current;
    if (r && r.state !== "inactive") {
      try {
        r.stop();
      } catch {
        // ignore
      }
    }
  }, []);

  // Ensure mic + recorder are released when the component unmounts mid-record.
  useEffect(() => () => stopAll(), [stopAll]);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { audioBitsPerSecond: 32000 });
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (tickRef.current) {
          clearInterval(tickRef.current);
          tickRef.current = null;
        }
        setRecording(false);
        if (blob.size < 200) {
          setError("Recording too short. Try again.");
          return;
        }
        setPreviewUrl(URL.createObjectURL(blob));
        onChange(blob);
      };
      recorder.start();
      setRecording(true);
      setSeconds(0);
      const startedAt = Date.now();
      tickRef.current = setInterval(() => {
        const s = Math.floor((Date.now() - startedAt) / 1000);
        setSeconds(s);
        if (s >= maxSeconds) {
          recorder.stop();
        }
      }, 250);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Microphone access denied");
    }
  }, [maxSeconds, onChange]);

  const stop = useCallback(() => {
    const r = recorderRef.current;
    if (r && r.state !== "inactive") r.stop();
  }, []);

  const reset = useCallback(() => {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onChange(null);
  }, [previewUrl, onChange]);

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-3 space-y-2">
      <div className="flex items-center gap-3">
        {!recording && !previewUrl && (
          <button
            type="button"
            onClick={start}
            className="rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium px-3 py-1.5"
          >
            ● Record sample
          </button>
        )}
        {recording && (
          <>
            <button
              type="button"
              onClick={stop}
              className="rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-3 py-1.5 animate-pulse"
            >
              ■ Stop
            </button>
            <span className="text-xs text-[var(--text-muted)]">
              Recording… {seconds}s / {maxSeconds}s
            </span>
          </>
        )}
        {!recording && previewUrl && (
          <>
            <audio src={previewUrl} controls className="h-8" />
            <button
              type="button"
              onClick={reset}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--danger)] underline"
            >
              Re-record
            </button>
          </>
        )}
      </div>
      {error && (
        <p className="text-xs text-[var(--danger)]">{error}</p>
      )}
      <p className="text-xs text-[var(--text-muted)]">
        Optional: a 5–10 second sample of you speaking your native language. Stored on your account.
      </p>
    </div>
  );
}
