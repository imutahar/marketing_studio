"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Play,
  Heart,
  MoreHorizontal,
  RefreshCw,
  Pencil,
  Link2,
  Download,
  Copy,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { useHoverVideo } from "@/hooks/useHoverVideo";
import { usePopover } from "@/hooks/usePopover";
import { useFavorites } from "@/hooks/useFavorites";
import { deleteGeneration } from "@/lib/api/generation";
import { downloadUrl } from "@/lib/download";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import type { PendingJob } from "@/hooks/useGenerationQueue";
import type { Generation } from "@/lib/types";

/** A live "generating" card with a cancel button. */
function PendingCard({ job, onCancel }: { job: PendingJob; onCancel?: (id: string) => void }) {
  return (
    <div className="relative flex aspect-[3/4] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-line bg-neutrals p-3 text-center">
      <Loader2 className="size-7 animate-spin text-primary" strokeWidth={1.75} />
      <span className="text-xs font-medium text-ink-muted">
        {job.status === "queued" ? "في الانتظار…" : "جاري الإنشاء…"}
      </span>
      {job.prompt && (
        <span className="line-clamp-2 text-[11px] text-ink-faint">{job.prompt}</span>
      )}
      {onCancel && (
        <button
          type="button"
          onClick={() => onCancel(job.id)}
          className="mt-1 flex h-7 items-center gap-1 rounded-lg border border-line px-2.5 text-[11px] font-medium text-ink-muted transition-colors hover:border-line-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          <X className="size-3.5" strokeWidth={2} />
          إلغاء
        </button>
      )}
    </div>
  );
}

interface CardActions {
  onView: () => void;
  onRecreate: () => void;
  onReuse: () => void;
  onUseAsReference: () => void;
  onDownload: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const overlayBtn =
  "grid size-9 place-items-center rounded-lg bg-black/45 text-white backdrop-blur transition focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";
const menuItem =
  "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-start text-xs text-ink transition-colors hover:bg-neutrals focus-visible:outline-none focus-visible:bg-neutrals";

function WorkCard({ gen, actions }: { gen: Generation; actions: CardActions }) {
  const { videoRef, hoverHandlers } = useHoverVideo();
  const { open, setOpen, ref } = usePopover<HTMLDivElement>();
  const out = gen.outputs[0];
  if (!out) return null;
  const isVideo = out.type === "video";

  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutrals transition hover:-translate-y-1">
      <button
        type="button"
        onClick={actions.onView}
        {...(isVideo ? hoverHandlers : {})}
        aria-label="عرض الإعلان"
        className="block size-full focus-visible:outline-none"
      >
        {isVideo ? (
          <>
            <video
              ref={videoRef}
              src={out.url}
              muted
              loop
              playsInline
              preload="metadata"
              className="pointer-events-none absolute inset-0 size-full object-cover"
            />
            <span className="absolute inset-0 grid place-items-center bg-black/10">
              <Play className="size-6 text-card/90" />
            </span>
          </>
        ) : (
          <Image src={out.url} alt="" fill className="object-cover" unoptimized />
        )}
      </button>

      {/* Favorite — always visible when favorited, else on hover. */}
      <button
        type="button"
        onClick={actions.onToggleFavorite}
        aria-pressed={actions.isFavorite}
        aria-label={actions.isFavorite ? "إزالة من المفضلة" : "أضف إلى المفضلة"}
        className={`absolute top-2 start-2 ${overlayBtn} ${
          actions.isFavorite
            ? "opacity-100"
            : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
        }`}
      >
        <Heart
          className={`size-4 ${actions.isFavorite ? "fill-red-500 text-red-500" : ""}`}
          strokeWidth={1.75}
        />
      </button>

      {/* ⋯ overflow menu. */}
      <div ref={ref} className="absolute top-2 end-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="خيارات"
          aria-expanded={open}
          className={`${overlayBtn} opacity-100 lg:opacity-0 lg:group-hover:opacity-100 ${open ? "lg:opacity-100" : ""}`}
        >
          <MoreHorizontal className="size-4" strokeWidth={1.75} />
        </button>
        {open && (
          <div className="absolute end-0 top-full z-30 mt-1 w-44 max-w-[calc(100vw-1.5rem)] rounded-xl border border-line bg-card p-1.5 shadow-[0px_6px_14px_0px_rgba(0,0,0,0.12)]">
            <button type="button" className={menuItem} onClick={() => { setOpen(false); actions.onRecreate(); }}>
              <RefreshCw className="size-4 text-ink-muted" strokeWidth={1.75} /> أعد الإنشاء
            </button>
            <button type="button" className={menuItem} onClick={() => { setOpen(false); actions.onReuse(); }}>
              <Pencil className="size-4 text-ink-muted" strokeWidth={1.75} /> عدّل الوصف
            </button>
            {isVideo && (
              <button type="button" className={menuItem} onClick={() => { setOpen(false); actions.onUseAsReference(); }}>
                <Link2 className="size-4 text-ink-muted" strokeWidth={1.75} /> استخدم كمرجع
              </button>
            )}
            <div className="my-1 h-px bg-line" />
            <button type="button" className={menuItem} onClick={() => { setOpen(false); actions.onDownload(); }}>
              <Download className="size-4 text-ink-muted" strokeWidth={1.75} /> تنزيل
            </button>
            <button type="button" className={menuItem} onClick={() => { setOpen(false); actions.onCopyLink(); }}>
              <Copy className="size-4 text-ink-muted" strokeWidth={1.75} /> نسخ الرابط
            </button>
            <div className="my-1 h-px bg-line" />
            <button
              type="button"
              className={`${menuItem} text-danger hover:bg-danger-soft`}
              onClick={() => { setOpen(false); actions.onDelete(); }}
            >
              <Trash2 className="size-4" strokeWidth={1.75} /> حذف
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface GenerationGridProps {
  title: string;
  generations: Generation[];
  onView: (g: Generation) => void;
  onRecreate: (g: Generation) => void;
  onReuse: (g: Generation) => void;
  onUseAsReference: (g: Generation) => void;
  /** Called after a generation is deleted so the parent can drop it. */
  onDeleted: (id: string) => void;
  /** Shown when there are no generations (e.g. the all-generations view). */
  emptyHint?: string;
  /** Live in-flight generations rendered as cards before the finished ones. */
  pending?: PendingJob[];
  /** Cancel an in-flight generation. */
  onCancel?: (id: string) => void;
}

/**
 * Reusable grid of generated ads with per-card actions (favorite, ⋯ menu,
 * download, copy link, delete). Used by the project gallery and the full
 * "all generations" view. Favorites, delete, copy and the toast are handled
 * here; the parent owns the list and the iteration handlers.
 */
export function GenerationGrid({
  title,
  generations,
  onView,
  onRecreate,
  onReuse,
  onUseAsReference,
  onDeleted,
  emptyHint,
  pending,
  onCancel,
}: GenerationGridProps) {
  const [favOnly, setFavOnly] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Generation | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  function handleDownload(gen: Generation) {
    const out = gen.outputs[0];
    if (!out) return;
    const ext = out.type === "video" ? "mp4" : "jpg";
    void downloadUrl(out.url, `senz-ad-${gen.id.slice(0, 8)}.${ext}`);
  }

  async function handleCopyLink(gen: Generation) {
    const url = gen.outputs[0]?.url;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      showToast("تم نسخ الرابط");
    } catch {
      showToast("تعذّر نسخ الرابط");
    }
  }

  async function confirmDelete() {
    const gen = pendingDelete;
    setPendingDelete(null);
    if (!gen) return;
    try {
      await deleteGeneration(gen.id);
      onDeleted(gen.id);
      showToast("تم حذف الإعلان");
    } catch {
      showToast("تعذّر حذف الإعلان");
    }
  }

  const visible = favOnly ? generations.filter((g) => isFavorite(g.id)) : generations;
  // In-flight cards only show in the unfiltered view (nothing to favorite yet).
  const showPending = favOnly ? [] : pending ?? [];

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink">{title}</h3>
        <button
          type="button"
          onClick={() => setFavOnly((v) => !v)}
          aria-pressed={favOnly}
          className={`flex h-8 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 ${
            favOnly
              ? "border-primary bg-secondary text-primary"
              : "border-line text-ink-muted hover:border-line-hover hover:text-ink"
          }`}
        >
          <Heart className={`size-3.5 ${favOnly ? "fill-current" : ""}`} strokeWidth={1.75} />
          المفضلة
        </button>
      </div>

      {showPending.length === 0 && visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-muted">
          {favOnly ? "لا توجد إعلانات مفضّلة بعد." : emptyHint ?? "لا توجد أعمال بعد."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          {showPending.map((job) => (
            <PendingCard key={job.id} job={job} onCancel={onCancel} />
          ))}
          {visible.map((gen) => (
            <WorkCard
              key={gen.id}
              gen={gen}
              actions={{
                onView: () => onView(gen),
                onRecreate: () => onRecreate(gen),
                onReuse: () => onReuse(gen),
                onUseAsReference: () => onUseAsReference(gen),
                onDownload: () => handleDownload(gen),
                onCopyLink: () => void handleCopyLink(gen),
                onDelete: () => setPendingDelete(gen),
                isFavorite: isFavorite(gen.id),
                onToggleFavorite: () => toggleFavorite(gen.id),
              }}
            />
          ))}
        </div>
      )}

      {toast && (
        <div role="status" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
          <span className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-card shadow-lg">{toast}</span>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="حذف الإعلان"
        message="سيتم حذف هذا الإعلان نهائيًا. لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        danger
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
