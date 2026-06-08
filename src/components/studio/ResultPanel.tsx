"use client";

import { Loader2, Download, RotateCcw, Play, ImageIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SaveToProjectButton } from "./SaveToProjectButton";
import type { Generation, StudioMode } from "@/lib/types";
import type { Project } from "@/lib/api/projects";

interface ResultPanelProps {
  /** "generating" while the job runs; "draft" for the 480p preview; "result" when done. */
  status: "generating" | "draft" | "result";
  mode: StudioMode;
  prompt: string;
  result: Generation | null;
  /** The draft generation (480p preview), present when status is "draft". */
  draft?: Generation | null;
  /** Approve the draft → render full resolution. */
  onApprove?: () => void;
  onReset: () => void;
  /** Projects available to file the finished result into. */
  projects: Project[];
  /** File the finished result into an existing project. */
  onSaveToProject: (projectId: string) => Promise<void>;
  /** Create a project from a name and file the result into it. */
  onCreateProjectAndSave: (name: string) => Promise<void>;
}

/** In-place generating → result experience. Renders the real backend output. */
export function ResultPanel({
  status,
  mode,
  prompt,
  result,
  draft,
  onApprove,
  onReset,
  projects,
  onSaveToProject,
  onCreateProjectAndSave,
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

  if (status === "draft") {
    const previewUrl = draft?.draftPreviewUrl;
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <div className="relative aspect-video w-full max-w-[640px] overflow-hidden rounded-3xl bg-neutrals">
          {previewUrl ? (
            <video
              src={previewUrl}
              controls
              className="size-full object-contain bg-black"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center bg-gradient-to-br from-teal-300 via-cyan-400 to-sky-500">
              <Play className="size-12 text-card/90" />
            </span>
          )}
          <span className="absolute start-3 top-3 rounded-full bg-card/95 px-3 py-1 text-xs font-medium text-ink shadow-sm">
            معاينة (مسودة 480p)
          </span>
        </div>

        {prompt && (
          <p className="max-w-[640px] text-center text-sm text-ink-muted line-clamp-2">
            {prompt}
          </p>
        )}

        <div className="flex w-full max-w-[640px] flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button variant="primary" className="w-full sm:w-auto" onClick={onApprove}>
            <Check className="size-4" strokeWidth={2} />
            اعتمد وأنشئ بالجودة الكاملة
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={onReset}>
            <RotateCcw className="size-4" strokeWidth={2} />
            إعادة المحاولة
          </Button>
        </div>

        <p className="text-center text-xs text-ink-muted">
          الصوت والإعدادات تُثبَّت عند المعاينة
        </p>
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

      <div className="flex w-full max-w-[640px] flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
        <a
          href={output?.url}
          download
          target="_blank"
          rel="noreferrer"
          aria-disabled={!output?.url}
          className="w-full sm:w-auto"
        >
          <Button variant="primary" className="w-full sm:w-auto" disabled={!output?.url}>
            <Download className="size-4" strokeWidth={2} />
            تنزيل
          </Button>
        </a>
        <Button variant="outline" className="w-full sm:w-auto" onClick={onReset}>
          <RotateCcw className="size-4" strokeWidth={2} />
          إعلان جديد
        </Button>
        <SaveToProjectButton
          projects={projects}
          onSave={onSaveToProject}
          onCreateAndSave={onCreateProjectAndSave}
        />
      </div>
    </div>
  );
}
