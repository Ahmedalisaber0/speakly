import { Correction } from "@/types";

interface Props {
  corrections: Correction[];
}

export default function CorrectionCard({ corrections }: Props) {
  if (corrections.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {corrections.map((correction, i) => (
        <div
          key={i}
          className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="line-through text-red-500">
              {correction.original}
            </span>
            <span className="text-gray-400">→</span>
            <span className="font-medium text-green-700">
              {correction.corrected}
            </span>
          </div>
          <p className="mt-1 text-gray-600 text-xs">{correction.explanation}</p>
        </div>
      ))}
    </div>
  );
}
