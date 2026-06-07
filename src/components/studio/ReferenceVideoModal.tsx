"use client";

import { useRef, useState } from "react";
import { Upload, Download, Clapperboard, Play } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useHoverVideo } from "@/hooks/useHoverVideo";
import {
  REFERENCE_UPLOADS,
  REFERENCE_GENERATIONS,
  type ReferenceVideo,
} from "@/lib/ad-reference-library";

interface ReferenceVideoModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (videoUrl: string) => void;
}

function VideoCard({ item, onSelect }: { item: ReferenceVideo; onSelect: () => void }) {
  const { videoRef, hoverHandlers } = useHoverVideo();
  return (
    <button
      type="button"
      onClick={onSelect}
      {...hoverHandlers}
      className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutrals transition hover:-translate-y-1"
    >
      <video
        ref={videoRef}
        src={item.video}
        muted
        loop
        playsInline
        preload="metadata"
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />
      <span className="absolute inset-0 grid place-items-center bg-black/10">
        <Play className="size-7 text-card/90" />
      </span>
    </button>
  );
}

export function ReferenceVideoModal({ open, onClose, onSelect }: ReferenceVideoModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"uploads" | "generations">("uploads");
  const items = tab === "uploads" ? REFERENCE_UPLOADS : REFERENCE_GENERATIONS;

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onSelect(URL.createObjectURL(file));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel="فيديو مرجعي"
      title="فيديو مرجعي"
      subtitle="اختر فيديو إعلان مرجعي لاستنساخ بنيته."
      widthClass="max-w-[880px]"
    >
      <div className="flex min-h-0 flex-1 gap-4 px-6 pb-6">
        {/* Tabs */}
        <div className="flex w-40 shrink-0 flex-col gap-1">
          {(
            [
              { id: "uploads", label: "التحميلات", icon: Download },
              { id: "generations", label: "الإنشاءات", icon: Clapperboard },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                tab === t.id ? "bg-neutrals font-medium text-ink" : "text-ink-muted hover:bg-neutrals"
              }`}
            >
              <t.icon className="size-4" strokeWidth={1.75} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {tab === "uploads" && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-hover text-ink-muted transition-colors hover:bg-neutrals"
              >
                <Upload className="size-6" strokeWidth={1.75} />
                <span className="text-xs font-medium">رفع وسائط</span>
              </button>
            )}
            {items.map((item) => (
              <VideoCard key={item.id} item={item} onSelect={() => onSelect(item.video)} />
            ))}
          </div>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="video/*" hidden onChange={handleUpload} />
    </Modal>
  );
}
