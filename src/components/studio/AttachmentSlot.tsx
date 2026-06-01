"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, PackageOpen, ImageIcon, User } from "lucide-react";
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
}

/**
 * 80×80 attachment card inside the composer. MVP = simple image upload
 * (no catalog browsing yet). Controlled by the composer state; revokes any
 * object URL it creates to avoid leaks.
 */
export function AttachmentSlot({ slot, value, onChange }: AttachmentSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const createdUrl = useRef<string | null>(null);
  const Icon = KIND_ICON[slot.kind];

  // Revoke the object URL this slot created when it unmounts.
  useEffect(
    () => () => {
      if (createdUrl.current) URL.revokeObjectURL(createdUrl.current);
    },
    [],
  );

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (createdUrl.current) URL.revokeObjectURL(createdUrl.current);
    const url = URL.createObjectURL(file);
    createdUrl.current = url;
    onChange(slot.id, {
      slotId: slot.id,
      kind: slot.kind,
      fileName: file.name,
      previewUrl: url,
    });
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="relative size-20 shrink-0 overflow-hidden rounded-3xl bg-card shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.12)]"
      aria-label={`إضافة ${slot.label}`}
    >
      {value?.previewUrl ? (
        <Image src={value.previewUrl} alt={slot.label} fill className="object-cover" unoptimized />
      ) : (
        <Icon
          className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-ink-faint"
          strokeWidth={1.75}
        />
      )}

      {/* "+" badge, top-start corner */}
      <span className="absolute start-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-neutrals">
        <Plus className="size-3 text-ink" strokeWidth={2.5} />
      </span>

      {/* Label, bottom-end corner */}
      <span className="absolute bottom-2 end-1.5 text-xs font-medium text-ink">
        {slot.label}
        {slot.required && <span className="text-danger"> *</span>}
      </span>

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick} />
    </button>
  );
}
