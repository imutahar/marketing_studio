"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { fileToDownscaledDataUrl } from "@/lib/image";
import type {
  BrandAsset,
  BrandAssetKind,
  ProjectDetail,
  ProjectInput,
} from "@/lib/api/projects";

const ASSET_SLOTS: { kind: BrandAssetKind; label: string }[] = [
  { kind: "logo", label: "الشعار" },
  { kind: "guideline", label: "هوية العلامة" },
  { kind: "sheet", label: "ملف المنتج" },
];

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  /** Provided = edit mode; absent = create. */
  project?: ProjectDetail | null;
  onSubmit: (body: ProjectInput) => Promise<unknown>;
}

function AssetSlot({
  label,
  asset,
  onUpload,
  onClear,
}: {
  label: string;
  asset?: BrandAsset;
  onUpload: (dataUrl: string, name: string) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      onUpload(await fileToDownscaledDataUrl(file), file.name);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative size-24">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative size-full overflow-hidden rounded-2xl border border-dashed border-line-hover bg-card transition-colors hover:bg-neutrals"
        >
          {busy ? (
            <Loader2 className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 animate-spin text-primary" />
          ) : asset ? (
            <Image src={asset.url} alt={label} fill className="object-cover" unoptimized />
          ) : (
            <Plus className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-ink-faint" strokeWidth={2} />
          )}
        </button>
        {asset && (
          <button
            type="button"
            onClick={onClear}
            aria-label={`إزالة ${label}`}
            className="absolute -end-1.5 -top-1.5 z-10 grid size-5 place-items-center rounded-full bg-ink-strong text-card shadow"
          >
            <X className="size-3" strokeWidth={2.5} />
          </button>
        )}
      </div>
      <span className="text-[11px] text-ink-muted">{label}</span>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={pick} />
    </div>
  );
}

export function ProjectModal({ open, onClose, project, onSubmit }: ProjectModalProps) {
  const [name, setName] = useState(project?.name ?? "");
  const [instructions, setInstructions] = useState(project?.instructions ?? "");
  const [assets, setAssets] = useState<Record<string, BrandAsset>>(() =>
    Object.fromEntries((project?.brandAssets ?? []).map((a) => [a.kind, a])),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset local state whenever the modal (re)opens for a different project.
  const key = `${open}:${project?.id ?? "new"}`;
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setName(project?.name ?? "");
    setInstructions(project?.instructions ?? "");
    setAssets(Object.fromEntries((project?.brandAssets ?? []).map((a) => [a.kind, a])));
    setError(null);
    setBusy(false);
  }

  async function submit() {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        instructions: instructions.trim() || undefined,
        brandAssets: Object.values(assets),
      });
      onClose();
    } catch {
      setError("تعذّر حفظ المشروع.");
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel={project ? "إعدادات المشروع" : "مشروع جديد"}
      title={project ? "إعدادات المشروع" : "مشروع جديد"}
      subtitle="أضف تعليمات وهوية العلامة ليلتزم بها الذكاء الاصطناعي في كل إعلان."
      widthClass="max-w-[560px]"
    >
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 pb-6 scroll-thin">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink">اسم المشروع</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: إطلاق عطر الصيف"
            autoFocus
            className="h-11 w-full rounded-xl border border-line bg-transparent px-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-line-hover"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink">
            تعليمات للذكاء الاصطناعي
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={4}
            placeholder="مثال: استخدم نبرة فاخرة، ألوان العلامة ذهبي وأسود، اذكر دائمًا الشحن المجاني، وتجنّب الموسيقى الصاخبة."
            className="w-full resize-none rounded-xl border border-line bg-transparent p-3 text-sm leading-6 text-ink outline-none placeholder:text-ink-muted focus:border-line-hover"
          />
          <p className="mt-1 text-[11px] text-ink-faint">
            يلتزم بها الذكاء الاصطناعي في كل إعلان داخل هذا المشروع.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-ink">
            هوية العلامة (اختياري)
          </label>
          <div className="flex gap-4">
            {ASSET_SLOTS.map((slot) => (
              <AssetSlot
                key={slot.kind}
                label={slot.label}
                asset={assets[slot.kind]}
                onUpload={(url, fileName) =>
                  setAssets((prev) => ({
                    ...prev,
                    [slot.kind]: { id: slot.kind, kind: slot.kind, name: fileName, url },
                  }))
                }
                onClear={() =>
                  setAssets((prev) => {
                    const next = { ...prev };
                    delete next[slot.kind];
                    return next;
                  })
                }
              />
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <Button
          variant="primary"
          className="w-full"
          onClick={submit}
          disabled={!name.trim() || busy}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : project ? "حفظ التغييرات" : "إنشاء المشروع"}
        </Button>
      </div>
    </Modal>
  );
}
