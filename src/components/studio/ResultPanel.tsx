"use client";

import { Loader2, Download, RotateCcw, Play, ImageIcon, Check, RefreshCw, Pencil, Link2 } from "lucide-react";
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
  /** Re-run this exact generation (another take). */
  onRecreate?: () => void;
  /** Load this generation's prompt + settings into the composer to tweak. */
  onReuse?: () => void;
  /** Use this result as an ad reference (video results only). */
  onUseAsReference?: () => void;
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
  onRecreate,
  onReuse,
  onUseAsReference,
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

  const outputs = result?.outputs ?? [];
  const output = outputs[0];
  // Image variations come back as a SET — show every image in a grid so the
  // merchant can compare and download each. Video is always a single output.
  const isMultiImage = mode !== "video" && outputs.length > 1;
  const isVideoResult = output?.type === "video";

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {isMultiImage ? (
        <div className="grid w-full max-w-[640px] grid-cols-2 gap-3">
          {outputs.map((out, i) => (
            <div
              key={out.url ?? i}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-neutrals"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={out.url}
                alt={prompt ? `${prompt} (${i + 1})` : `النتيجة ${i + 1}`}
                className="size-full object-contain"
              />
              <a
                href={out.url}
                download
                target="_blank"
                rel="noreferrer"
                aria-label={`تنزيل الصورة ${i + 1}`}
                className="absolute end-2 top-2 grid size-8 place-items-center rounded-lg bg-card/90 text-ink shadow-sm transition-opacity hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] lg:opacity-0 lg:group-hover:opacity-100"
              >
                <Download className="size-4" strokeWidth={2} />
              </a>
            </div>
          ))}
        </div>
      ) : (
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
      )}

      {prompt && (
        <p className="max-w-[640px] text-center text-sm text-ink-muted line-clamp-2">
          {prompt}
        </p>
      )}

      {/* Iterate on this ad — recreate / edit the prompt / use as a reference. */}
      {(onRecreate || onReuse || (onUseAsReference && isVideoResult)) && (
        <div className="flex w-full max-w-[640px] flex-col items-center gap-2">
          <p className="text-xs text-ink-faint">أنشئ المزيد من هذا الإعلان</p>
          <div className="flex flex-wrap justify-center gap-2">
            {onRecreate && (
              <button
                type="button"
                onClick={onRecreate}
                title="إنشاء نسخة جديدة بنفس الإعدادات"
                className="flex h-9 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-medium text-ink-muted transition-colors hover:border-line-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
              >
                <RefreshCw className="size-4" strokeWidth={1.75} />
                أعد الإنشاء
              </button>
            )}
            {onReuse && (
              <button
                type="button"
                onClick={onReuse}
                title="تحميل الوصف والإعدادات في المحرّر لتعديلها"
                className="flex h-9 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-medium text-ink-muted transition-colors hover:border-line-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
              >
                <Pencil className="size-4" strokeWidth={1.75} />
                عدّل الوصف
              </button>
            )}
            {onUseAsReference && isVideoResult && (
              <button
                type="button"
                onClick={onUseAsReference}
                title="استخدم هذا الفيديو كمرجع لإنشاء إعلان مشابه"
                className="flex h-9 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-medium text-ink-muted transition-colors hover:border-line-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
              >
                <Link2 className="size-4" strokeWidth={1.75} />
                استخدم كمرجع
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex w-full max-w-[640px] flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
        {/* Single download lives here; the multi-image grid has a per-image
            download instead. */}
        {!isMultiImage && (
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
        )}
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
