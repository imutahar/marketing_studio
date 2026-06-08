"use client";

import { useRef } from "react";
import { DIR } from "@/lib/locale";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style the confirm action as destructive (red). */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Small confirm / cancel dialog for guarding an action (e.g. a destructive
 * delete). Centered card with scrim, focus trap, and Escape-to-cancel. Default
 * focus lands on Cancel, so Enter doesn't fire a destructive action.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onCancel);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4"
      onClick={onCancel}
      dir={DIR}
    >
      <div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[380px] rounded-2xl border border-line bg-card p-5 text-start shadow-[0px_13px_13px_0px_rgba(0,0,0,0.08),0px_3px_7px_0px_rgba(0,0,0,0.06)]"
      >
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {message && (
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{message}</p>
        )}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-start">
          {/* Cancel first in DOM → it receives initial focus (safe default). */}
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-xl border border-line px-4 text-sm font-medium text-ink transition-colors hover:bg-neutrals focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-10 rounded-xl px-4 text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
              danger
                ? "bg-danger focus-visible:ring-danger"
                : "bg-primary focus-visible:ring-[var(--color-primary)]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
