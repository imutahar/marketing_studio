"use client";

import { SlidersHorizontal } from "lucide-react";
import { DIR } from "@/lib/locale";
import { usePopover } from "@/hooks/usePopover";
import type { AdvancedSettings } from "@/hooks/useComposer";

interface ToolbarSettingsProps {
  settings: AdvancedSettings;
  onChange: (patch: Partial<AdvancedSettings>) => void;
  /** Camera-fixed only applies to video. */
  showCameraFixed: boolean;
}

/** ⚙️ Advanced settings popover: negative prompt, camera-fixed, seed. */
export function ToolbarSettings({ settings, onChange, showCameraFixed }: ToolbarSettingsProps) {
  const { open, setOpen, ref } = usePopover();

  return (
    <div className="relative" dir={DIR} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="إعدادات متقدمة"
        aria-expanded={open}
        className="flex h-8 items-center justify-center rounded-xl border border-line px-2 text-ink-faint transition-colors hover:border-line-hover"
      >
        <SlidersHorizontal className="size-4" strokeWidth={1.75} />
      </button>

      {open && (
        <div className="absolute bottom-full z-30 mb-1 w-[280px] rounded-xl border border-line bg-card p-3 shadow-[0px_6px_14px_0px_rgba(0,0,0,0.1)]">
          <p className="mb-2 text-xs font-bold text-ink">إعدادات متقدمة</p>

          <label className="block text-[11px] text-ink-faint">النص السلبي (تجنّب)</label>
          <textarea
            value={settings.negativePrompt}
            onChange={(e) => onChange({ negativePrompt: e.target.value })}
            rows={2}
            placeholder="مثال: نصوص مشوهة، أيادٍ غير واقعية"
            className="mt-0.5 w-full resize-none rounded-lg border border-line bg-transparent p-2 text-xs text-ink outline-none focus:border-line-hover"
          />

          {showCameraFixed && (
            <label className="mt-3 flex items-center justify-between text-xs text-ink">
              تثبيت الكاميرا
              <input
                type="checkbox"
                checked={settings.cameraFixed}
                onChange={(e) => onChange({ cameraFixed: e.target.checked })}
                className="size-4 accent-[var(--color-primary)]"
              />
            </label>
          )}

          {showCameraFixed && (
            <label className="mt-3 flex items-center justify-between text-xs text-ink">
              توليد الصوت (تعليق وموسيقى)
              <input
                type="checkbox"
                checked={settings.generateAudio}
                onChange={(e) => onChange({ generateAudio: e.target.checked })}
                className="size-4 accent-[var(--color-primary)]"
              />
            </label>
          )}

          <label className="mt-3 block text-[11px] text-ink-faint">
            البذرة (seed) — اختياري
          </label>
          <input
            value={settings.seed}
            onChange={(e) => onChange({ seed: e.target.value.replace(/[^0-9]/g, "") })}
            inputMode="numeric"
            placeholder="عشوائي"
            className="mt-0.5 h-8 w-full rounded-lg border border-line bg-transparent px-2 text-xs text-ink outline-none focus:border-line-hover"
          />
        </div>
      )}
    </div>
  );
}
