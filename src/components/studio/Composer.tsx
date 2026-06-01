"use client";

import { ArrowUp, Settings2, Plus } from "lucide-react";
import type { ComposerController } from "@/hooks/useComposer";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { AttachmentSlot } from "./AttachmentSlot";
import { ModeToggle } from "./ModeToggle";

interface ComposerProps {
  composer: ComposerController;
  onSubmit: () => void;
  isGenerating: boolean;
}

export function Composer({ composer, onSubmit, isGenerating }: ComposerProps) {
  const {
    mode,
    prompt,
    slots,
    options,
    selectedOptions,
    attachments,
    canSubmit,
    setPrompt,
    changeMode,
    toggleOption,
    setAttachment,
  } = composer;

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
              />
            ))}
          </div>
        </div>

        {/* Bottom: toolbar (start/right) + send (end/left) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" aria-label="إعدادات">
              <Settings2 className="size-4 text-ink-faint" strokeWidth={1.75} />
            </Button>
            {options.map((opt) => (
              <Chip
                key={opt}
                active={selectedOptions.includes(opt)}
                onClick={() => toggleOption(opt)}
              >
                {opt}
              </Chip>
            ))}
            <Button variant="outline" size="sm" aria-label="إضافة خيار">
              <Plus className="size-4 text-ink-faint" strokeWidth={1.75} />
            </Button>
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
    </div>
  );
}
