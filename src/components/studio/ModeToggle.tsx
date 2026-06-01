"use client";

import { ImageIcon, Clapperboard } from "lucide-react";
import type { StudioMode } from "@/lib/types";

const MODES: { id: StudioMode; label: string; icon: React.ElementType }[] = [
  { id: "image", label: "صورة", icon: ImageIcon },
  { id: "video", label: "فيديو", icon: Clapperboard },
];

/** Vertical Image/Video switch that sits on the composer's outer edge. */
export function ModeToggle({
  mode,
  onChange,
}: {
  mode: StudioMode;
  onChange: (mode: StudioMode) => void;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-3xl border border-line bg-card p-1 shadow-[0px_6px_14px_0px_rgba(0,0,0,0.06)]">
      {MODES.map(({ id, label, icon: Icon }) => {
        const active = id === mode;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex w-16 flex-col items-center gap-1 rounded-[14px] px-2 py-2.5 text-xs font-medium transition-colors ${
              active ? "bg-neutrals text-ink-strong" : "text-ink-faint hover:text-ink"
            }`}
            aria-pressed={active}
          >
            <Icon className="size-5" strokeWidth={1.75} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
