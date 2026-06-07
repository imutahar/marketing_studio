"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useHoverVideo } from "@/hooks/useHoverVideo";
import type { SheetCard, SheetSelect } from "@/lib/toolbar";

interface ToolbarSheetProps {
  config: SheetSelect;
  value?: string;
  onSelect: (value: string) => void;
}

/** A single card: shows the clip's first frame and plays it on hover. */
function SheetCardButton({
  card,
  selected,
  onSelect,
}: {
  card: SheetCard;
  selected: boolean;
  onSelect: () => void;
}) {
  const { videoRef, hoverHandlers } = useHoverVideo();

  return (
    <button
      type="button"
      onClick={onSelect}
      {...hoverHandlers}
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        ariaLabel={config.title}
        title={config.title}
        subtitle={config.subtitle}
      >
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
      </Modal>
    </>
  );
}
