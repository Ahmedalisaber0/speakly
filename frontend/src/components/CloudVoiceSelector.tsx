"use client";

import { CloudVoice } from "@/lib/api";

interface Props {
  voices: CloudVoice[];
  selectedVoice: CloudVoice | null;
  onSelect: (voice: CloudVoice) => void;
}

export default function CloudVoiceSelector({ voices, selectedVoice, onSelect }: Props) {
  if (voices.length === 0) return null;

  return (
    <select
      value={selectedVoice?.id || ""}
      onChange={(e) => {
        const voice = voices.find((v) => v.id === e.target.value);
        if (voice) onSelect(voice);
      }}
      className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white focus:outline-none focus:border-blue-400 max-w-[220px]"
    >
      <option value="">Select voice</option>
      {voices.map((voice) => (
        <option key={voice.id} value={voice.id}>
          {voice.name.replace("Microsoft ", "").replace(" Online (Natural)", "")} ({voice.gender})
        </option>
      ))}
    </select>
  );
}
