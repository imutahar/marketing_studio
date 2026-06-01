"use client";

import { PRESETS } from "@/lib/mock";
import type { Preset } from "@/lib/types";

/** The Higgsfield-style preset cards. Clicking one pre-fills the composer. */
export function PresetGallery({ onPick }: { onPick: (preset: Preset) => void }) {
  return (
    <div className="flex w-full gap-[18px]">
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onPick(preset)}
          className={`group relative h-[338px] flex-1 overflow-hidden rounded-3xl bg-gradient-to-br ${preset.gradient} text-start transition-transform hover:-translate-y-1`}
        >
          {/* subtle dark gradient for legibility */}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          {/* category badge */}
          <span className="absolute start-3 top-3 rounded-full bg-card/95 px-3 py-1 text-xs font-medium text-ink shadow-sm">
            {preset.label}
          </span>
        </button>
      ))}
    </div>
  );
}
