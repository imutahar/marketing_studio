"use client";

import { useHoverVideo } from "@/hooks/useHoverVideo";
import { PRESETS } from "@/lib/mock";
import type { Preset } from "@/lib/types";

/** A single preset card: shows the clip's first frame, plays it on hover. */
function PresetCard({ preset, onPick }: { preset: Preset; onPick: () => void }) {
  const { videoRef, hoverHandlers } = useHoverVideo();

  return (
    <button
      type="button"
      onClick={onPick}
      {...hoverHandlers}
      className={`group relative h-[338px] flex-1 overflow-hidden rounded-3xl bg-gradient-to-br ${preset.gradient} text-start transition-transform hover:-translate-y-1`}
    >
      {/* Preview plays on hover (no autoplay) so the 5 clips don't all stream
          at once on load. Falls back to the gradient if absent/blocked. */}
      {preset.video && (
        <video
          ref={videoRef}
          src={preset.video}
          muted
          loop
          playsInline
          preload="metadata"
          // Some browser extensions tag <video> elements (e.g. data-video="0"),
          // mutating the DOM before hydration. Tolerate that mismatch.
          suppressHydrationWarning
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
      )}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
      <span className="absolute start-3 top-3 rounded-full bg-card/95 px-3 py-1 text-xs font-medium text-ink shadow-sm">
        {preset.label}
      </span>
    </button>
  );
}

/** The Higgsfield-style preset cards. Clicking one pre-fills the composer. */
export function PresetGallery({ onPick }: { onPick: (preset: Preset) => void }) {
  return (
    <div className="flex w-full gap-[18px]">
      {PRESETS.map((preset) => (
        <PresetCard key={preset.id} preset={preset} onPick={() => onPick(preset)} />
      ))}
    </div>
  );
}
