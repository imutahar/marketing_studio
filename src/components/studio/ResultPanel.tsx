"use client";

import { Loader2, Download, RotateCcw, Play, ImageIcon } from "lucide-react";
import type { GenerationStatus, StudioMode } from "@/lib/types";

interface ResultPanelProps {
  status: Exclude<GenerationStatus, "idle">;
  mode: StudioMode;
  prompt: string;
  onReset: () => void;
}

/**
 * In-place generating → result experience (mock, no backend).
 * Keeps the whole flow on the home screen.
 */
export function ResultPanel({ status, mode, prompt, onReset }: ResultPanelProps) {
  const modeLabel = mode === "video" ? "فيديو" : "صورة";

  if (status === "generating") {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex aspect-video w-full max-w-[640px] flex-col items-center justify-center gap-3 rounded-3xl border border-line bg-neutrals">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-ink-muted">جاري إنشاء إعلانك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="relative aspect-video w-full max-w-[640px] overflow-hidden rounded-3xl bg-gradient-to-br from-teal-300 via-cyan-400 to-sky-500">
        <span className="absolute inset-0 grid place-items-center">
          {mode === "video" ? (
            <Play className="size-12 text-card/90" />
          ) : (
            <ImageIcon className="size-12 text-card/90" />
          )}
        </span>
        <span className="absolute start-3 top-3 rounded-full bg-card/95 px-3 py-1 text-xs font-medium text-ink shadow-sm">
          {modeLabel}
        </span>
      </div>

      {prompt && (
        <p className="max-w-[640px] text-center text-sm text-ink-muted line-clamp-2">{prompt}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-card transition-opacity hover:opacity-90"
        >
          <Download className="size-4" strokeWidth={2} />
          تنزيل
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-neutrals"
        >
          <RotateCcw className="size-4" strokeWidth={2} />
          إعلان جديد
        </button>
      </div>
    </div>
  );
}
