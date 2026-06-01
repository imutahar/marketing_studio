"use client";

import { useState } from "react";
import { ArrowUp, Settings2, Plus } from "lucide-react";
import type { StudioMode } from "@/lib/types";
import { attachmentsForMode, toolbarOptionsForMode } from "@/lib/mock";
import { AttachmentSlot } from "./AttachmentSlot";
import { ModeToggle } from "./ModeToggle";

interface ComposerProps {
  mode: StudioMode;
  onModeChange: (mode: StudioMode) => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

function ToolbarChip({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-8 items-center gap-1 rounded-xl border border-line px-2 text-xs font-medium text-ink transition-colors hover:border-line-hover"
    >
      {children}
    </button>
  );
}

export function Composer({
  mode,
  onModeChange,
  prompt,
  onPromptChange,
  onSubmit,
  isGenerating,
}: ComposerProps) {
  const [iconOnly] = useState(true); // settings/add chips render icon-only, per design
  const attachments = attachmentsForMode(mode);
  const options = toolbarOptionsForMode(mode);

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
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="اوصف ما يحدث في إعلانك..."
            className="min-h-[56px] flex-1 resize-none bg-transparent text-md leading-6 text-ink outline-none placeholder:text-ink-muted"
          />
          <div className="flex shrink-0 gap-2">
            {attachments.map((slot) => (
              <AttachmentSlot key={slot.id} slot={slot} />
            ))}
          </div>
        </div>

        {/* Bottom: toolbar (start/right) + send (end/left) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <ToolbarChip>
              <Settings2 className="size-4 text-ink-faint" strokeWidth={1.75} />
            </ToolbarChip>
            {options.map((opt) => (
              <ToolbarChip key={opt}>{opt}</ToolbarChip>
            ))}
            {iconOnly && (
              <ToolbarChip>
                <Plus className="size-4 text-ink-faint" strokeWidth={1.75} />
              </ToolbarChip>
            )}
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isGenerating}
            className="grid size-8 shrink-0 place-items-center rounded-xl border-2 border-secondary bg-secondary text-primary transition-opacity hover:opacity-90 disabled:opacity-50"
            aria-label="إنشاء الإعلان"
          >
            <ArrowUp className="size-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Mode toggle on the outer (end/left) edge */}
      <ModeToggle mode={mode} onChange={onModeChange} />
    </div>
  );
}
