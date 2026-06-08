"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { DIR } from "@/lib/locale";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. */
  ariaLabel: string;
  /** Optional header title + subtitle (omit for a custom header). */
  title?: string;
  subtitle?: string;
  /** Width utility class. Default: max-w-[820px]. */
  widthClass?: string;
  children: React.ReactNode;
}

/** Shared modal shell: overlay, centered dialog, focus trap, optional header. */
export function Modal({
  open,
  onClose,
  ariaLabel,
  title,
  subtitle,
  widthClass = "max-w-[820px]",
  children,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        ref={ref}
        dir={DIR}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
        className={`flex h-dvh max-h-none w-full ${widthClass} flex-col overflow-hidden rounded-none bg-card shadow-[0px_1px_4px_0px_rgba(0,0,0,0.2)] sm:h-auto sm:max-h-[88vh] sm:rounded-2xl`}
      >
        {(title || subtitle) && (
          <div className="flex shrink-0 items-start justify-between gap-4 px-6 py-5">
            <div className="text-start">
              {title && <h3 className="text-md font-bold text-ink">{title}</h3>}
              {subtitle && (
                <p className="mt-1.5 text-xs text-ink-muted">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              aria-label="إغلاق"
              onClick={onClose}
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-line text-ink transition-colors hover:bg-neutrals sm:size-8"
            >
              <X className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
