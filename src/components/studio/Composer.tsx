"use client";

import { useState } from "react";
import { ArrowUp, Plus } from "lucide-react";
import type { ComposerController } from "@/hooks/useComposer";
import type { AttachmentSlot as Slot } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { AttachmentSlot } from "./AttachmentSlot";
import { ModeToggle } from "./ModeToggle";
import { ToolbarSelect } from "./ToolbarSelect";
import { ToolbarSlider } from "./ToolbarSlider";
import { ToolbarSheet } from "./ToolbarSheet";
import { ToolbarSettings } from "./ToolbarSettings";
import { CharacterModal } from "./CharacterModal";
import { ProductModal } from "./ProductModal";
import { MediaLibraryModal } from "./MediaLibraryModal";

interface ComposerProps {
  composer: ComposerController;
  onSubmit: () => void;
  isGenerating: boolean;
}

const MAX_EXTRA_REFS = 3;

export function Composer({ composer, onSubmit, isGenerating }: ComposerProps) {
  const {
    mode,
    prompt,
    slots,
    selects,
    selections,
    attachments,
    settings,
    canSubmit,
    setPrompt,
    changeMode,
    setSelection,
    setAttachment,
    addReferenceImage,
    setSettings,
  } = composer;

  const [characterOpen, setCharacterOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  // Extra reference images added via the ➕ button (not part of the fixed slots).
  const extraRefs = Object.values(attachments).filter(
    (a) => !slots.some((s) => s.id === a.slotId),
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="relative flex items-center justify-center gap-6">
      {/* Soft teal glow behind the card */}
      <div className="pointer-events-none absolute inset-x-6 -inset-y-3 -z-10 composer-glow" aria-hidden />

      {/* Mode toggle on the outer (start/right) edge */}
      <ModeToggle mode={mode} onChange={changeMode} />

      {/* The composer card */}
      <div className="relative flex min-h-[168px] w-[946px] flex-col justify-between gap-4 rounded-4xl bg-card p-4 shadow-[0px_0px_0px_1px_rgba(101,101,101,0.06),0px_13px_13px_0px_rgba(0,0,0,0.04),0px_3px_7px_0px_rgba(0,0,0,0.05)]">
        {/* Top: prompt (start/right) + attachments (end/left) */}
        <div className="flex items-start justify-between gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            aria-label="وصف الإعلان"
            placeholder="اوصف ما يحدث في إعلانك..."
            className="min-h-[56px] flex-1 resize-none bg-transparent text-md leading-6 text-ink outline-none placeholder:text-ink-muted"
          />
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            {slots.map((slot) => (
              <AttachmentSlot
                key={slot.id}
                slot={slot}
                value={attachments[slot.id]}
                onChange={setAttachment}
                onPick={
                  slot.kind === "character"
                    ? () => setCharacterOpen(true)
                    : slot.kind === "product"
                      ? () => setProductOpen(true)
                      : undefined
                }
              />
            ))}
            {extraRefs.map((ref) => {
              const refSlot: Slot = { id: ref.slotId, kind: "image", label: "مرجع" };
              return (
                <AttachmentSlot
                  key={ref.slotId}
                  slot={refSlot}
                  value={ref}
                  onChange={setAttachment}
                />
              );
            })}
          </div>
        </div>

        {/* Bottom: toolbar (start/right) + send (end/left) */}
        <div className="flex items-center justify-between gap-2">
          {/* dir=ltr pins the visual order to the design: settings (left) … + (right).
              Stays LTR by design regardless of locale — do not thread through DIR. */}
          <div dir="ltr" className="flex flex-wrap items-center gap-2">
            <ToolbarSettings
              settings={settings}
              onChange={(patch) => setSettings((prev) => ({ ...prev, ...patch }))}
              showCameraFixed={mode === "video"}
            />
            {selects.map((select) => {
              if (select.control === "slider") {
                return (
                  <ToolbarSlider
                    key={select.id}
                    config={select}
                    value={selections[select.id]}
                    onChange={(value) => setSelection(select.id, value)}
                  />
                );
              }
              if (select.control === "sheet") {
                return (
                  <ToolbarSheet
                    key={select.id}
                    config={select}
                    value={selections[select.id]}
                    onSelect={(value) => setSelection(select.id, value)}
                  />
                );
              }
              return (
                <ToolbarSelect
                  key={select.id}
                  config={select}
                  value={selections[select.id]}
                  onSelect={(value) => setSelection(select.id, value)}
                />
              );
            })}
            <button
              type="button"
              aria-label="إضافة صورة مرجعية"
              disabled={extraRefs.length >= MAX_EXTRA_REFS}
              onClick={() => setMediaOpen(true)}
              className="flex h-8 items-center justify-center rounded-xl border border-line px-2 text-ink-faint transition-colors hover:border-line-hover disabled:opacity-40"
            >
              <Plus className="size-4" strokeWidth={1.75} />
            </button>
          </div>

          <Button
            variant="mint"
            size="icon"
            onClick={onSubmit}
            disabled={isGenerating || !canSubmit}
            aria-label="إنشاء الإعلان"
          >
            <ArrowUp className="size-4" strokeWidth={2.5} />
          </Button>
        </div>
      </div>

      <CharacterModal
        open={characterOpen}
        onClose={() => setCharacterOpen(false)}
        selectedImage={attachments.character?.previewUrl}
        onSelect={(avatar) => {
          setAttachment("character", {
            slotId: "character",
            kind: "character",
            fileName: avatar.name,
            previewUrl: avatar.image,
          });
          setCharacterOpen(false);
        }}
      />

      <ProductModal
        open={productOpen}
        onClose={() => setProductOpen(false)}
        selectedImage={attachments.product?.previewUrl}
        onSelect={(product) => {
          setAttachment("product", {
            slotId: "product",
            kind: "product",
            fileName: product.name,
            previewUrl: product.image,
          });
          setProductOpen(false);
        }}
        onUpload={(dataUrl, fileName) => {
          setAttachment("product", {
            slotId: "product",
            kind: "product",
            fileName,
            previewUrl: dataUrl,
          });
          setProductOpen(false);
        }}
      />

      <MediaLibraryModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url, name) => {
          addReferenceImage(url, name);
          setMediaOpen(false);
        }}
      />
    </div>
  );
}
