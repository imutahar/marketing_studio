"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Library, Trash2, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { fileToDownscaledDataUrl } from "@/lib/image";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";

interface MediaLibraryModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the chosen media (uploaded or picked from the library). */
  onSelect: (url: string, name: string) => void;
}

type Tab = "upload" | "library";

/**
 * مكتبة الوسائط — reference-image picker for the composer ➕ button.
 * Two tabs: upload a new file (stored in the library for reuse), or pick one
 * already uploaded. Mirrors Figma node 100-17838.
 */
export function MediaLibraryModal({ open, onClose, onSelect }: MediaLibraryModalProps) {
  const { items, add, remove } = useMediaLibrary();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("upload");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const url = await fileToDownscaledDataUrl(file);
      add(url, file.name);
      onSelect(url, file.name);
    } finally {
      setBusy(false);
    }
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
      subtitle="اختر ملفًا من ملفاتك المرفوعة مسبقًا أو أضف وسائط جديدة."
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
        {tab === "upload" ? (
          <div>
            <p className="mb-3 text-xs text-ink-muted">
              يتم حفظ الوسائط التي تم تحميلها في مكتبتك لإعادة استخدامها عبر جميع الحملات.
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line-hover text-ink-muted transition-colors hover:bg-neutrals disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="size-7 animate-spin" strokeWidth={1.75} />
              ) : (
                <Upload className="size-7" strokeWidth={1.75} />
              )}
              <span className="text-sm font-medium text-ink">رفع صورة</span>
              <span className="text-xs">JPG / PNG</span>
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Library className="size-7 text-ink-faint" strokeWidth={1.5} />
            <p className="text-sm text-ink-muted">لا توجد وسائط في مكتبتك بعد.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelect(item.url, item.name)}
                  className="block w-full rounded-2xl border border-line p-1.5 text-start transition-colors hover:border-line-hover"
                >
                  <span className="relative block aspect-square overflow-hidden rounded-xl bg-neutrals">
                    <Image src={item.url} alt={item.name} fill className="object-cover" unoptimized />
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
            ))}
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
    </Modal>
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="حذف الصورة"
        message="سيتم حذف هذه الصورة المرجعية من المكتبة نهائيًا."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        danger
        onConfirm={() => {
          if (pendingDeleteId) remove(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </>
  );
}
