"use client";

import { Sparkles, X } from "lucide-react";

interface BrandNudgeProps {
  onCreate: () => void;
  onDismiss: () => void;
}

/**
 * Gentle, dismissible suggestion to create a brand project — shown after a few
 * ungrouped generations. Non-blocking: a tip, never a gate.
 */
export function BrandNudge({ onCreate, onDismiss }: BrandNudgeProps) {
  return (
    <div className="flex w-full max-w-[640px] items-start gap-3 rounded-2xl border border-primary/30 bg-card px-4 py-3 text-start">
      <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.75} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-ink">حافظ على هوية علامتك</p>
        <p className="mt-0.5 text-sm text-ink-muted">
          أنشئ مشروعًا لعلامتك التجارية ليُطبَّق شعارك وإرشاداتك تلقائيًا على كل
          إعلان.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-2 rounded-lg text-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
        >
          أنشئ مشروعًا
        </button>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="إغلاق"
        className="shrink-0 rounded-lg p-1 text-ink-faint transition-colors hover:bg-neutrals hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      >
        <X className="size-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}
