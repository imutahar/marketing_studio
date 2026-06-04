"use client";

import { useState } from "react";
import { ArrowUp, SlidersHorizontal, Plus } from "lucide-react";
import type { ComposerController } from "@/hooks/useComposer";
import { Button } from "@/components/ui/Button";
import { AttachmentSlot } from "./AttachmentSlot";
import { ModeToggle } from "./ModeToggle";
import { ToolbarSelect } from "./ToolbarSelect";
import { ToolbarSlider } from "./ToolbarSlider";
import { ToolbarSheet } from "./ToolbarSheet";
import { CharacterModal } from "./CharacterModal";
import { ProductModal } from "./ProductModal";

interface ComposerProps {
  composer: ComposerController;
  onSubmit: () => void;
  isGenerating: boolean;
}

/** Square icon-only chip (settings / add), matching the toolbar chip height. */
function IconChip({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-8 items-center justify-center rounded-xl border border-line px-2 text-ink-faint transition-colors hover:border-line-hover"
    >
      <Icon className="size-4" strokeWidth={1.75} />
    </button>
  );
}

export function Composer({ composer, onSubmit, isGenerating }: ComposerProps) {
  const {
    mode,
    prompt,
    slots,
    selects,
    selections,
    attachments,
    canSubmit,
    setPrompt,
    changeMode,
    setSelection,
    setAttachment,
  } = composer;

  const [characterOpen, setCharacterOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

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
          <div className="flex shrink-0 gap-2">
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
          </div>
        </div>

        {/* Bottom: toolbar (start/right) + send (end/left) */}
        <div className="flex items-center justify-between gap-2">
          {/* dir=ltr pins the visual order to the design: settings (left) … + (right) */}
          <div dir="ltr" className="flex flex-wrap items-center gap-2">
            <IconChip icon={SlidersHorizontal} label="إعدادات" />
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
            <IconChip icon={Plus} label="إضافة" />
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

      {/* Mode toggle on the outer (end/left) edge */}
      <ModeToggle mode={mode} onChange={changeMode} />

      <CharacterModal
        open={characterOpen}
        onClose={() => setCharacterOpen(false)}
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
      />
    </div>
  );
}
