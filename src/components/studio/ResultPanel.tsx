"use client";

import { Loader2, Download, RotateCcw, Play, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Generation, StudioMode } from "@/lib/types";

interface ResultPanelProps {
  /** "generating" while the job runs; otherwise the finished generation. */
  status: "generating" | "result";
  mode: StudioMode;
  prompt: string;
  result: Generation | null;
  onReset: () => void;
}

/** In-place generating → result experience. Renders the real backend output. */
export function ResultPanel({
  status,
  mode,
  prompt,
  result,
  onReset,
}: ResultPanelProps) {
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

  const output = result?.outputs?.[0];

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="relative aspect-video w-full max-w-[640px] overflow-hidden rounded-3xl bg-neutrals">
        {output?.url ? (
          output.type === "video" ? (
            <video
              src={output.url}
              controls
              className="size-full object-contain bg-black"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={output.url}
              alt={prompt || "النتيجة"}
              className="size-full object-contain"
            />
          )
        ) : (
          // Fallback (no output url, e.g. mock without media)
          <span className="absolute inset-0 grid place-items-center bg-gradient-to-br from-teal-300 via-cyan-400 to-sky-500">
            {mode === "video" ? (
              <Play className="size-12 text-card/90" />
            ) : (
              <ImageIcon className="size-12 text-card/90" />
            )}
          </span>
        )}
        <span className="absolute start-3 top-3 rounded-full bg-card/95 px-3 py-1 text-xs font-medium text-ink shadow-sm">
          {modeLabel}
        </span>
      </div>

      {prompt && (
        <p className="max-w-[640px] text-center text-sm text-ink-muted line-clamp-2">
          {prompt}
        </p>
      )}

      <div className="flex items-center gap-3">
        <a href={output?.url} download target="_blank" rel="noreferrer" aria-disabled={!output?.url}>
          <Button variant="primary" disabled={!output?.url}>
            <Download className="size-4" strokeWidth={2} />
            تنزيل
          </Button>
        </a>
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="size-4" strokeWidth={2} />
          إعلان جديد
        </Button>
      </div>
    </div>
  );
}
