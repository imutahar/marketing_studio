"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { X, Search, ChevronDown } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { usePopover } from "@/hooks/usePopover";
import { AVATARS, type Avatar } from "@/lib/avatars";

type GenderFilter = "all" | "male" | "female";

const GENDER_LABELS: Record<GenderFilter, string> = {
  all: "الكل",
  male: "ذكر",
  female: "أنثى",
};

interface CharacterModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (avatar: Avatar) => void;
}

function GenderDropdown({
  value,
  onChange,
}: {
  value: GenderFilter;
  onChange: (v: GenderFilter) => void;
}) {
  const { open, setOpen, ref } = usePopover();
  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-11 items-center gap-1 rounded-xl border border-line px-3 text-sm font-medium text-ink transition-colors hover:border-line-hover"
      >
        {GENDER_LABELS[value]}
        <ChevronDown className={`size-4 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.75} />
      </button>
      {open && (
        <ul className="absolute top-full z-10 mt-1 min-w-[120px] overflow-hidden rounded-xl border border-line bg-card py-1 shadow-[0px_6px_14px_0px_rgba(0,0,0,0.1)]">
          {(Object.keys(GENDER_LABELS) as GenderFilter[]).map((g) => (
            <li key={g}>
              <button
                type="button"
                onClick={() => {
                  onChange(g);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3 py-1.5 text-sm transition-colors hover:bg-neutrals ${
                  g === value ? "font-medium text-primary" : "text-ink"
                }`}
              >
                {GENDER_LABELS[g]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CharacterModal({ open, onClose, onSelect }: CharacterModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState<GenderFilter>("all");

  const close = useCallback(() => {
    onClose();
    setQuery("");
    setGender("all");
  }, [onClose]);

  useFocusTrap(dialogRef, open, close);

  const results = useMemo(() => {
    const q = query.trim();
    return AVATARS.filter(
      (a) =>
        (gender === "all" || a.gender === gender) &&
        (q === "" || a.name.includes(q)),
    );
  }, [query, gender]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={close}
    >
      <div
        ref={dialogRef}
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label="اختر الشخصية"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-[820px] flex-col overflow-hidden rounded-2xl bg-card shadow-[0px_1px_4px_0px_rgba(0,0,0,0.2)]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 py-5">
          <div className="text-right">
            <h3 className="text-md font-bold text-ink">اختر الشخصية</h3>
            <p className="mt-1.5 text-xs text-ink-muted">
              اختر الشخصية التي ستظهر في إعلانك.
            </p>
          </div>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={close}
            className="grid size-8 shrink-0 place-items-center rounded-xl border border-line text-ink transition-colors hover:bg-neutrals"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Toolbar: search + gender filter */}
        <div className="flex shrink-0 items-center gap-3 px-6 pb-4">
          <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-line px-3 focus-within:border-line-hover">
            <Search className="size-4 shrink-0 text-ink-faint" strokeWidth={1.75} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث باسم الشخصية"
              aria-label="ابحث باسم الشخصية"
              className="h-full flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
            />
          </div>
          <GenderDropdown value={gender} onChange={setGender} />
        </div>

        {/* Avatar grid */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 scroll-thin">
          {results.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink-muted">
              لا توجد شخصيات مطابقة.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {results.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => onSelect(avatar)}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutrals text-start transition hover:-translate-y-1"
                >
                  <Image
                    src={avatar.image}
                    alt={avatar.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <span className="absolute start-3 top-3 rounded-full bg-card/95 px-3 py-1 text-xs font-medium text-ink shadow-sm">
                    {avatar.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
