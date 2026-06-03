"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import type { SheetCard, SheetSelect } from "@/lib/toolbar";

interface ToolbarSheetProps {
  config: SheetSelect;
  value?: string;
  onSelect: (value: string) => void;
}

/** A single card: shows the video first frame, plays it on hover. */
function SheetCardButton({
  card,
  selected,
  onSelect,
}: {
  card: SheetCard;
  selected: boolean;
  onSelect: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  function handleEnter() {
    videoRef.current?.play().catch(() => {});
  }
  function handleLeave() {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`relative aspect-[3/4] overflow-hidden rounded-3xl bg-gradient-to-br ${card.gradient} text-start transition ${
        selected ? "ring-2 ring-primary ring-offset-2" : "hover:-translate-y-1"
      }`}
    >
      {card.video && (
        <video
          ref={videoRef}
          src={card.video}
          muted
          loop
          playsInline
          preload="metadata"
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
      )}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
      <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-card/95 px-3 py-1 text-[10px] font-bold text-ink shadow-sm">
        {card.label}
      </span>
    </button>
  );
}

/** نوع الفيديو chip → modal popup sheet with a grid of style cards. */
export function ToolbarSheet({ config, value, onSelect }: ToolbarSheetProps) {
  const [open, setOpen] = useState(false);
  const Icon = config.icon;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        dir="rtl"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="flex h-8 items-center gap-1 rounded-xl border border-line px-2 text-xs font-medium transition-colors hover:border-line-hover"
      >
        <Icon className="size-4 text-ink-faint" strokeWidth={1.75} />
        <span className={value ? "text-ink" : "text-ink-muted"}>
          {value ?? config.placeholder}
        </span>
        <ChevronDown className="size-3.5 text-ink-faint" strokeWidth={1.75} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            dir="rtl"
            role="dialog"
            aria-label={config.title}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-[800px] flex-col overflow-hidden rounded-2xl bg-card shadow-[0px_1px_4px_0px_rgba(0,0,0,0.2)]"
          >
            {/* Header (fixed) */}
            <div className="flex shrink-0 items-start justify-between gap-4 px-6 py-5">
              <div className="text-right">
                <h3 className="text-md font-bold text-ink">{config.title}</h3>
                <p className="mt-1.5 text-xs text-ink-muted">{config.subtitle}</p>
              </div>
              <button
                type="button"
                aria-label="إغلاق"
                onClick={() => setOpen(false)}
                className="grid size-8 shrink-0 place-items-center rounded-xl border border-line text-ink transition-colors hover:bg-neutrals"
              >
                <X className="size-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* Scrollable card grid */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 scroll-thin">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {config.cards.map((card) => (
                  <SheetCardButton
                    key={card.id}
                    card={card}
                    selected={card.label === value}
                    onSelect={() => {
                      onSelect(card.label);
                      setOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
