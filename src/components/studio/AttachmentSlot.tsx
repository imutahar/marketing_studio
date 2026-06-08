"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, PackageOpen, ImageIcon, User, Loader2, X } from "lucide-react";
import { fileToDownscaledDataUrl } from "@/lib/image";
import type { AttachmentSlot as Slot, AttachmentValue } from "@/lib/types";

const KIND_ICON = {
  product: PackageOpen,
  character: User,
  image: ImageIcon,
} as const;

interface AttachmentSlotProps {
  slot: Slot;
  value?: AttachmentValue;
  onChange: (slotId: string, value: AttachmentValue | null) => void;
  /** Overrides the default file-upload click (e.g. open a picker modal). */
  onPick?: () => void;
}

/**
 * 80×80 attachment card inside the composer. Default = simple image upload;
 * pass `onPick` to open a picker instead (e.g. product/character modal).
 * Filled slots show a thumbnail + a clear (✕) control.
 */
export function AttachmentSlot({ slot, value, onChange, onPick }: AttachmentSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const Icon = KIND_ICON[slot.kind];
  const filled = Boolean(value?.previewUrl);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(false);
    try {
      const dataUrl = await fileToDownscaledDataUrl(file);
      onChange(slot.id, {
        slotId: slot.id,
        kind: slot.kind,
        fileName: file.name,
        previewUrl: dataUrl,
      });
    } catch {
      // Corrupt / unsupported file — surface a brief inline hint and let the user retry.
      setError(true);
    } finally {
      setLoading(false);
      // Allow re-selecting the same file after a failure.
      e.target.value = "";
    }
  }

  return (
    <div className="relative size-20 shrink-0">
      <button
        type="button"
        onClick={() => (onPick ? onPick() : inputRef.current?.click())}
        className="relative size-full overflow-hidden rounded-3xl bg-card shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
        aria-label={`إضافة ${slot.label}`}
      >
        {loading ? (
          <Loader2 className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 animate-spin text-primary" />
        ) : value?.previewUrl ? (
          <Image src={value.previewUrl} alt={slot.label} fill className="object-cover" unoptimized />
        ) : (
          <Icon
            className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-ink-faint"
            strokeWidth={1.75}
          />
        )}

        {/* "+" badge (only when empty) */}
        {!filled && (
          <span className="absolute start-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-neutrals">
            <Plus className="size-3 text-ink" strokeWidth={2.5} />
          </span>
        )}

        {/* Label, bottom-end corner */}
        <span className="absolute bottom-2 end-1.5 text-xs font-medium text-ink">
          {slot.label}
          {slot.required && <span className="text-danger"> *</span>}
        </span>
      </button>

      {/* Clear (✕) — sibling button so it isn't nested inside the slot button */}
      {filled && (
        <button
          type="button"
          onClick={() => onChange(slot.id, null)}
          aria-label={`إزالة ${slot.label}`}
          className="absolute -end-1.5 -top-1.5 z-10 grid size-5 place-items-center rounded-full bg-ink-strong text-card shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
        >
          <X className="size-3" strokeWidth={2.5} />
        </button>
      )}

      {/* Inline decode-failure hint */}
      {error && (
        <p role="alert" className="absolute inset-x-0 top-full mt-1 text-center text-[10px] leading-tight text-danger">
          تعذّر قراءة الصورة
        </p>
      )}

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
    </div>
  );
}
