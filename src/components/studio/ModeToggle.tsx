"use client";

import { Image as ImageIcon, ListVideo } from "lucide-react";
import type { StudioMode } from "@/lib/types";

const MODES: { id: StudioMode; label: string; icon: React.ElementType }[] = [
  { id: "image", label: "صورة", icon: ImageIcon },
  { id: "video", label: "فيديو", icon: ListVideo },
];

/** Vertical Image/Video switch on the composer's outer edge (matches Figma). */
export function ModeToggle({
  mode,
  onChange,
}: {
  mode: StudioMode;
  onChange: (mode: StudioMode) => void;
}) {
  return (
    <div className="flex h-[147px] w-[76px] flex-col gap-1.5 rounded-[19px] bg-card p-1.5 shadow-[0px_6px_14px_0px_rgba(0,0,0,0.06)]">
      {MODES.map(({ id, label, icon: Icon }) => {
        const active = id === mode;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={active}
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-medium transition-colors ${
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
