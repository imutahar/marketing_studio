"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { DropdownSelect } from "@/lib/toolbar";

interface ToolbarSelectProps {
  config: DropdownSelect;
  value?: string;
  onSelect: (value: string) => void;
}

/**
 * Composer toolbar dropdown: [leading icon] [value/placeholder] [chevron].
 * Matches the Figma chips (e.g. 12 ث / 720p / 9:16 / نوع الفيديو).
 */
export function ToolbarSelect({ config, value, onSelect }: ToolbarSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = config.icon;

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" dir="rtl" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-8 items-center gap-1 rounded-xl border border-line px-2 text-xs font-medium transition-colors hover:border-line-hover"
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
          className="absolute bottom-full z-30 mb-1 min-w-[120px] overflow-hidden rounded-xl border border-line bg-card py-1 shadow-[0px_6px_14px_0px_rgba(0,0,0,0.1)]"
        >
          {config.options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                role="option"
                aria-selected={opt === value}
                onClick={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3 py-1.5 text-xs transition-colors hover:bg-neutrals ${
                  opt === value ? "font-medium text-primary" : "text-ink"
                }`}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
