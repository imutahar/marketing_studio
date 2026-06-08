"use client";

import { ChevronDown } from "lucide-react";
import { DIR } from "@/lib/locale";
import { usePopover } from "@/hooks/usePopover";
import type { DropdownSelect } from "@/lib/toolbar";

interface ToolbarSelectProps {
  config: DropdownSelect;
  value?: string;
  onSelect: (value: string) => void;
}

/**
 * Composer toolbar dropdown: [leading icon] [value/placeholder] [chevron].
 * Matches the Figma chips (e.g. 720p / 9:16 / نوع الصورة).
 */
export function ToolbarSelect({ config, value, onSelect }: ToolbarSelectProps) {
  const { open, setOpen, ref } = usePopover();
  const Icon = config.icon;

  return (
    <div className="relative" dir={DIR} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-8 items-center gap-1 rounded-xl border border-line px-2 text-xs font-medium transition-colors hover:border-line-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
      >
        <Icon className="size-4 text-ink-faint" strokeWidth={1.75} />
        <span className={value ? "text-ink" : "text-ink-muted"}>
          {value ?? config.placeholder}
        </span>
        <ChevronDown
          className={`size-3.5 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute bottom-full z-30 mb-1 min-w-[120px] max-w-[240px] overflow-hidden rounded-xl border border-line bg-card py-1 shadow-[0px_6px_14px_0px_rgba(0,0,0,0.1)]"
        >
          {config.options.map((opt) => {
            const hint = config.optionHints?.[opt];
            return (
              <li key={opt}>
                <button
                  type="button"
                  role="option"
                  aria-selected={opt === value}
                  onClick={() => {
                    onSelect(opt);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-xs transition-colors hover:bg-neutrals focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)] ${
                    opt === value ? "font-medium text-primary" : "text-ink"
                  }`}
                >
                  <span>{opt}</span>
                  {hint ? <span className="text-[11px] text-ink-faint">{hint}</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
