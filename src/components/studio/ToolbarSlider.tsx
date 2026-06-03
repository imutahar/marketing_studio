"use client";

import { ChevronDown } from "lucide-react";
import { usePopover } from "@/hooks/usePopover";
import type { SliderSelect } from "@/lib/toolbar";

interface ToolbarSliderProps {
  config: SliderSelect;
  value?: string;
  onChange: (value: string) => void;
}

/** Duration chip → popover with a range slider (e.g. 6–12 ث). */
export function ToolbarSlider({ config, value, onChange }: ToolbarSliderProps) {
  const { open, setOpen, ref } = usePopover();
  const Icon = config.icon;
  const current = Number.parseInt(value ?? "", 10) || config.max;

  return (
    <div className="relative" dir="rtl" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex h-8 items-center gap-1 rounded-xl border border-line px-2 text-xs font-medium text-ink transition-colors hover:border-line-hover"
      >
        <Icon className="size-4 text-ink-faint" strokeWidth={1.75} />
        <span>{value ?? config.placeholder}</span>
        <ChevronDown
          className={`size-3.5 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <div className="absolute bottom-full z-30 mb-1 w-[208px] rounded-xl border border-line bg-card p-3 shadow-[0px_6px_14px_0px_rgba(0,0,0,0.1)]">
          <div className="mb-2 flex items-center justify-between text-xs text-ink-faint">
            <span>{config.min} {config.unit}</span>
            <span className="font-bold text-primary">{current} {config.unit}</span>
            <span>{config.max} {config.unit}</span>
          </div>
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step ?? 1}
            value={current}
            onChange={(e) => onChange(`${e.target.value} ${config.unit}`)}
            className="w-full accent-[var(--color-primary)]"
            aria-label={config.placeholder}
          />
        </div>
      )}
    </div>
  );
}
