"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { AVATARS, type Avatar } from "@/lib/avatars";

type GenderFilter = "all" | "male" | "female";

const GENDER_LABELS: Record<GenderFilter, string> = {
  all: "الكل",
  male: "ذكر",
  female: "أنثى",
};
const GENDERS: GenderFilter[] = ["all", "male", "female"];

interface CharacterModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (avatar: Avatar) => void;
  /** Image URL of the currently-attached character (to show selection). */
  selectedImage?: string;
}

export function CharacterModal({
  open,
  onClose,
  onSelect,
  selectedImage,
}: CharacterModalProps) {
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState<GenderFilter>("all");

  function handleClose() {
    setQuery("");
    setGender("all");
    onClose();
  }

  const results = useMemo(() => {
    const q = query.trim();
    return AVATARS.filter(
      (a) =>
        (gender === "all" || a.gender === gender) &&
        (q === "" || a.name.includes(q)),
    );
  }, [query, gender]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      ariaLabel="اختر الشخصية"
      title="اختر الشخصية"
      subtitle="اختر الشخصية التي ستظهر في إعلانك."
    >
      {/* Toolbar */}
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
        <SelectDropdown
          value={gender}
          options={GENDERS}
          labels={GENDER_LABELS}
          onChange={setGender}
        />
      </div>

      {/* Avatar grid */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 scroll-thin">
        {results.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-muted">
            لا توجد شخصيات مطابقة.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {results.map((avatar) => {
              const selected = avatar.image === selectedImage;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => onSelect(avatar)}
                  aria-pressed={selected}
                  className={`relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutrals text-start transition ${
                    selected
                      ? "ring-2 ring-primary ring-offset-2"
                      : "hover:-translate-y-1"
                  }`}
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
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
