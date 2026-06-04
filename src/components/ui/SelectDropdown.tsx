"use client";

import { ChevronDown } from "lucide-react";
import { usePopover } from "@/hooks/usePopover";

interface SelectDropdownProps<T extends string> {
  value: T;
  options: readonly T[];
  /** Optional display labels keyed by option value. */
  labels?: Record<string, string>;
  onChange: (value: T) => void;
}

/** A compact, downward-opening dropdown (search/filter bars, etc.). */
export function SelectDropdown<T extends string>({
  value,
  options,
  labels,
  onChange,
}: SelectDropdownProps<T>) {
  const { open, setOpen, ref } = usePopover();
  const label = (v: T) => labels?.[v] ?? v;

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-11 items-center gap-1 rounded-xl border border-line px-3 text-sm font-medium text-ink transition-colors hover:border-line-hover"
      >
        {label(value)}
        <ChevronDown
          className={`size-4 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={1.75}
        />
      </button>
      {open && (
        <ul className="absolute top-full z-10 mt-1 min-w-[120px] overflow-hidden rounded-xl border border-line bg-card py-1 shadow-[0px_6px_14px_0px_rgba(0,0,0,0.1)]">
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={option === value}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3 py-1.5 text-sm transition-colors hover:bg-neutrals ${
                  option === value ? "font-medium text-primary" : "text-ink"
                }`}
              >
                {label(option)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
