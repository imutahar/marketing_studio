"use client";

import { SlidersHorizontal } from "lucide-react";
import { DIR } from "@/lib/locale";
import { usePopover } from "@/hooks/usePopover";
import type { AdvancedSettings } from "@/hooks/useComposer";

interface ToolbarSettingsProps {
  settings: AdvancedSettings;
  onChange: (patch: Partial<AdvancedSettings>) => void;
  /** Camera-fixed: video only AND only when the model supports it (not Seedance 2.0). */
  showCameraFixed: boolean;
  /** Synced-audio toggle: video only. */
  showAudio: boolean;
}

/** Common things merchants want to keep OUT of the result (one-tap, no typing). */
const AVOID_TERMS = [
  "نصوص مشوّهة",
  "أيادٍ غير واقعية",
  "علامات مائية",
  "وجوه مشوّهة",
  "ألوان باهتة",
];

const checkbox =
  "mt-0.5 size-4 shrink-0 accent-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1";

/** ⚙️ Advanced settings: "things to avoid" chips + (video) camera + audio. */
export function ToolbarSettings({ settings, onChange, showCameraFixed, showAudio }: ToolbarSettingsProps) {
  const { open, setOpen, ref } = usePopover();

  const avoided = settings.negativePrompt
    ? settings.negativePrompt.split("، ").filter(Boolean)
    : [];

  function toggleAvoid(term: string) {
    const next = avoided.includes(term)
      ? avoided.filter((t) => t !== term)
      : [...avoided, term];
    onChange({ negativePrompt: next.join("، ") });
  }

  return (
    <div className="relative" dir={DIR} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="إعدادات متقدمة"
        aria-expanded={open}
        className="flex h-8 items-center justify-center rounded-xl border border-line px-2 text-ink-faint transition-colors hover:border-line-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
      >
        <SlidersHorizontal className="size-4" strokeWidth={1.75} />
      </button>

      {open && (
        <div className="absolute bottom-full z-30 mb-1 w-[280px] rounded-xl border border-line bg-card p-3 shadow-[0px_6px_14px_0px_rgba(0,0,0,0.1)]">
          <p className="mb-2 text-xs font-bold text-ink">إعدادات متقدمة</p>

          {/* "Things to avoid" — one-tap chips instead of a negative-prompt box. */}
          <p className="text-[11px] font-medium text-ink">أشياء نتجنّبها في الإعلان</p>
          <p className="mt-0.5 text-[10px] text-ink-faint">
            اختر ما لا تريد ظهوره في النتيجة
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {AVOID_TERMS.map((term) => {
              const active = avoided.includes(term);
              return (
                <button
                  key={term}
                  type="button"
                  onClick={() => toggleAvoid(term)}
                  aria-pressed={active}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 ${
                    active
                      ? "border-primary bg-secondary text-primary"
                      : "border-line text-ink-muted hover:border-line-hover hover:text-ink"
                  }`}
                >
                  {term}
                </button>
              );
            })}
          </div>

          {showCameraFixed && (
            <label className="mt-4 flex items-start justify-between gap-3 text-xs text-ink">
              <span>
                كاميرا ثابتة
                <span className="mt-0.5 block text-[10px] text-ink-faint">
                  بدون حركة للكاميرا في الفيديو
                </span>
              </span>
              <input
                type="checkbox"
                checked={settings.cameraFixed}
                onChange={(e) => onChange({ cameraFixed: e.target.checked })}
                className={checkbox}
              />
            </label>
          )}

          {showAudio && (
            <label className="mt-3 flex items-start justify-between gap-3 text-xs text-ink">
              <span>
                إضافة صوت
                <span className="mt-0.5 block text-[10px] text-ink-faint">
                  تعليق صوتي وموسيقى تلقائية
                </span>
              </span>
              <input
                type="checkbox"
                checked={settings.generateAudio}
                onChange={(e) => onChange({ generateAudio: e.target.checked })}
                className={checkbox}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
