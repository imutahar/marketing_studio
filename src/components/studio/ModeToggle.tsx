"use client";

import { Image as ImageIcon, ListVideo } from "lucide-react";
import type { StudioMode } from "@/lib/types";

const MODES: { id: StudioMode; label: string; icon: React.ElementType }[] = [
  { id: "image", label: "صورة", icon: ImageIcon },
  { id: "video", label: "فيديو", icon: ListVideo },
];

/**
 * Image/Video switch on the composer's outer edge. Horizontal full-width pill on
 * mobile; the vertical 76×147 pill (matches Figma) at `sm` and up.
 */
export function ModeToggle({
  mode,
  onChange,
}: {
  mode: StudioMode;
  onChange: (mode: StudioMode) => void;
}) {
  return (
    <div className="flex w-full flex-row gap-1.5 rounded-[19px] bg-card p-1.5 shadow-[0px_6px_14px_0px_rgba(0,0,0,0.06)] sm:h-[147px] sm:w-[76px] sm:flex-col">
      {MODES.map(({ id, label, icon: Icon }) => {
        const active = id === mode;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={active}
            className={`flex flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 sm:flex-col sm:py-0 sm:text-[10px] ${
              active
                ? "bg-card text-ink shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05),0px_0px_6px_3px_rgba(0,0,0,0.05)]"
                : "text-ink-faint hover:text-ink"
            }`}
          >
            <Icon className="size-[22px]" strokeWidth={1.75} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
