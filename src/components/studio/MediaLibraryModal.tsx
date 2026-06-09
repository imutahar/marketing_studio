"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Upload, Library, Trash2, Loader2, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { fileToDownscaledDataUrl } from "@/lib/image";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";

export interface MediaSelection {
  url: string;
  name: string;
}

interface MediaLibraryModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with ALL chosen media (uploaded this session + picked from the library). */
  onSelectMany: (items: MediaSelection[]) => void;
  /**
   * Max number of items that may be confirmed in one go (the remaining
   * reference-image budget). Selection and upload are capped to this.
   */
  maxSelectable: number;
}

type Tab = "upload" | "library";

/**
 * مكتبة الوسائط — multi-image reference picker for the composer.
 * Two tabs: upload one or more files (stored in the library for reuse), or
 * multi-select from previously uploaded media. A sticky footer confirms the
 * full selection. Mirrors Figma node 100-17838.
 */
export function MediaLibraryModal({
  open,
  onClose,
  onSelectMany,
  maxSelectable,
}: MediaLibraryModalProps) {
  const { items, add, remove } = useMediaLibrary();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("upload");
  const [busy, setBusy] = useState(false);
  // Library items selected for confirmation (by url — the stable identity).
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  // Media uploaded during THIS modal session — auto-included on confirm.
  const [uploaded, setUploaded] = useState<MediaSelection[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset selection state on each open/close transition. Adjusting state during
  // render (the React-recommended pattern) instead of in an effect avoids a
  // cascading re-render — the new state applies on this same render.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    setSelectedUrls(new Set());
    setUploaded([]);
    setTab("upload");
  }

  const selectedLibrary = useMemo(
    () => items.filter((i) => selectedUrls.has(i.url)),
    [items, selectedUrls],
  );

  // Total confirmable count = library picks + this-session uploads (deduped by url).
  const confirmed = useMemo(() => {
    const map = new Map<string, MediaSelection>();
    for (const u of uploaded) map.set(u.url, u);
    for (const i of selectedLibrary) map.set(i.url, { url: i.url, name: i.name });
    return Array.from(map.values());
  }, [uploaded, selectedLibrary]);

  const count = confirmed.length;
  const atCap = count >= maxSelectable;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setBusy(true);
    try {
      for (const file of files) {
        // Stop once the remaining budget is exhausted.
        if (uploaded.length + selectedLibrary.length >= maxSelectable) break;
        try {
          const url = await fileToDownscaledDataUrl(file);
          add(url, file.name);
          setUploaded((prev) =>
            prev.some((u) => u.url === url) ? prev : [...prev, { url, name: file.name }],
          );
        } catch {
          // Skip a corrupt/unsupported file and continue with the rest.
        }
      }
    } finally {
      setBusy(false);
    }
  }

  function toggleLibrary(url: string) {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        // Respect the remaining budget (uploads count toward it too).
        if (uploaded.length + next.size >= maxSelectable) return prev;
        next.add(url);
      }
      return next;
    });
  }

  function confirm() {
    if (count === 0) return;
    onSelectMany(confirmed);
  }

  const tabs: { id: Tab; label: string; icon: typeof Upload }[] = [
    { id: "upload", label: "رفع ملف", icon: Upload },
    { id: "library", label: "مكتبتي", icon: Library },
  ];

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        ariaLabel="مكتبة الوسائط"
        title="مكتبة الوسائط"
        subtitle="اختر ملفًا أو أكثر من ملفاتك المرفوعة مسبقًا أو أضف وسائط جديدة."
        widthClass="max-w-[640px]"
      >
        {/* Tabs */}
        <div className="flex shrink-0 gap-2 px-6 pb-4">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-pressed={active}
                className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors ${
                  active
                    ? "border-secondary-dark bg-secondary/30 text-ink"
                    : "border-line text-ink-muted hover:border-line-hover"
                }`}
              >
                <Icon className="size-4" strokeWidth={1.75} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 scroll-thin">
          {atCap && (
            <p className="mb-3 text-xs text-ink-muted">الحد الأقصى {maxSelectable} صور</p>
          )}
          {tab === "upload" ? (
            <div>
              <p className="mb-3 text-xs text-ink-muted">
                يتم حفظ الوسائط التي تم تحميلها في مكتبتك لإعادة استخدامها عبر جميع الحملات.
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy || atCap}
                className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line-hover text-ink-muted transition-colors hover:bg-neutrals disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="size-7 animate-spin" strokeWidth={1.75} />
                ) : (
                  <Upload className="size-7" strokeWidth={1.75} />
                )}
                <span className="text-sm font-medium text-ink">رفع صورة</span>
                <span className="text-xs">JPG / PNG · يمكن اختيار عدة ملفات</span>
              </button>
              {uploaded.length > 0 && (
                <p className="mt-3 text-xs text-ink-muted">
                  تم رفع {uploaded.length} {uploaded.length === 1 ? "صورة" : "صور"}.
                </p>
              )}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Library className="size-7 text-ink-faint" strokeWidth={1.5} />
              <p className="text-sm text-ink-muted">لا توجد وسائط في مكتبتك بعد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
              {items.map((item) => {
                const selected = selectedUrls.has(item.url);
                const blocked = !selected && atCap;
                return (
                  <div key={item.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => toggleLibrary(item.url)}
                      disabled={blocked}
                      aria-pressed={selected}
                      className={`block w-full rounded-2xl border p-1.5 text-start transition-colors disabled:opacity-40 ${
                        selected
                          ? "border-primary"
                          : "border-line hover:border-line-hover"
                      }`}
                    >
                      <span className="relative block aspect-square overflow-hidden rounded-xl bg-neutrals">
                        <Image src={item.url} alt={item.name} fill className="object-cover" unoptimized />
                        {selected && (
                          <span
                            className="absolute inset-0 grid place-items-center bg-primary/30"
                            aria-hidden
                          >
                            <span className="grid size-7 place-items-center rounded-full bg-primary text-white">
                              <Check className="size-4" strokeWidth={2.5} />
                            </span>
                          </span>
                        )}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(item.id)}
                      aria-label="حذف"
                      className="absolute end-2.5 top-2.5 grid size-7 place-items-center rounded-lg bg-black/55 text-white opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      <Trash2 className="size-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky footer — confirm the full selection (uploads + library picks). */}
        <div className="flex shrink-0 items-center justify-end border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={confirm}
            disabled={count === 0}
            className="flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
          >
            إضافة ({count})
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFile}
        />
      </Modal>
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="حذف الصورة"
        message="سيتم حذف هذه الصورة المرجعية من المكتبة نهائيًا."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        danger
        onConfirm={() => {
          if (pendingDeleteId) {
            const target = items.find((i) => i.id === pendingDeleteId);
            remove(pendingDeleteId);
            // Drop it from the pending selection if it was picked.
            if (target) {
              setSelectedUrls((prev) => {
                if (!prev.has(target.url)) return prev;
                const next = new Set(prev);
                next.delete(target.url);
                return next;
              });
            }
          }
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </>
  );
}
