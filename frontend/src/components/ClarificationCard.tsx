"use client";

import { Language } from "@/types";
import { getStrings } from "@/lib/strings";

interface Props {
  suggestedText: string;
  nativeLanguage: Language;
  onAccept: () => void;
  onDismiss: () => void;
  onListen?: () => void;
  isPlayingListen?: boolean;
}

export default function ClarificationCard({
  suggestedText,
  nativeLanguage,
  onAccept,
  onDismiss,
  onListen,
  isPlayingListen,
}: Props) {
  const strings = getStrings(nativeLanguage);

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/95 shadow-md p-3 space-y-2 backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold uppercase tracking-wide" dir="auto">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h.01a1 1 0 100-2H10V10a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{strings.clarificationTitle}</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-amber-700 hover:text-amber-900 text-sm leading-none"
          aria-label={strings.clarificationDismissAria}
        >
          ✕
        </button>
      </div>

      <div className="flex items-start gap-2">
        <p className="flex-1 text-sm text-gray-900 font-medium" dir="auto">
          {suggestedText}
        </p>
        {onListen && (
          <button
            onClick={onListen}
            disabled={isPlayingListen}
            className="flex-shrink-0 mt-0.5 p-1.5 rounded-full text-amber-700 hover:text-amber-900 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={strings.listenAria}
            title={strings.listenAria}
          >
            {isPlayingListen ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeOpacity="0.25"
                />
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4.03v8.05A4.5 4.5 0 0016.5 12zM14 3.23v2.06a7.001 7.001 0 010 13.42v2.06A9.001 9.001 0 0023 12 9 9 0 0014 3.23z" />
              </svg>
            )}
          </button>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onAccept}
          className="flex-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors"
          dir="auto"
        >
          {strings.clarificationYes}
        </button>
        <button
          onClick={onDismiss}
          className="px-3 py-1.5 rounded-lg border border-amber-300 hover:bg-amber-100 text-amber-800 text-xs font-medium transition-colors"
          dir="auto"
        >
          {strings.clarificationNo}
        </button>
      </div>
    </div>
  );
}
