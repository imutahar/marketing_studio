"use client";

import { useState } from "react";
import { FolderPlus, Plus, Loader2, Check } from "lucide-react";
import { DIR } from "@/lib/locale";
import { usePopover } from "@/hooks/usePopover";
import { Button } from "@/components/ui/Button";
import type { Project } from "@/lib/api/projects";

interface SaveToProjectButtonProps {
  projects: Project[];
  /** Save into an existing project. Resolves when filed. */
  onSave: (projectId: string) => Promise<void>;
  /** Create a new project from a name and file into it. Resolves when filed. */
  onCreateAndSave: (name: string) => Promise<void>;
}

/**
 * Compact "file this result into a project" control for the result actions.
 * States: idle (button) → open (popover: pick a project or create one inline)
 * → saving (spinner, disabled) → saved (non-interactive success label).
 * Unlike ProjectSwitcher there is no "بدون مشروع" — this action files INTO a
 * project.
 */
export function SaveToProjectButton({
  projects,
  onSave,
  onCreateAndSave,
}: SaveToProjectButtonProps) {
  const { open, setOpen, ref } = usePopover();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedName, setSavedName] = useState<string | null>(null);

  function reset() {
    setCreating(false);
    setName("");
  }

  async function settle(savedAs: string, run: () => Promise<void>) {
    setSaving(true);
    try {
      await run();
      setSavedName(savedAs);
      setOpen(false);
      reset();
      // Revert to idle after a few seconds so the action stays reusable
      // (e.g. moving it to another project) until the panel changes.
      window.setTimeout(() => setSavedName(null), 4000);
    } finally {
      setSaving(false);
    }
  }

  function saveExisting(project: Project) {
    void settle(project.name, () => onSave(project.id));
  }

  function submitNew() {
    const trimmed = name.trim();
    if (!trimmed) return;
    void settle(trimmed, () => onCreateAndSave(trimmed));
  }

  if (savedName) {
    return (
      <span className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary">
        <Check className="size-4" strokeWidth={2} />
        تم الحفظ في «{savedName}»
      </span>
    );
  }

  const row =
    "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-start text-sm transition-colors hover:bg-neutrals focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50 disabled:pointer-events-none";

  return (
    <div className="relative w-full sm:w-auto" dir={DIR} ref={ref}>
      <Button
        variant="outline"
        className="w-full sm:w-auto"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        disabled={saving}
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" strokeWidth={2} />
        ) : (
          <FolderPlus className="size-4" strokeWidth={1.75} />
        )}
        احفظ في مشروع
      </Button>

      {open && (
        <div className="absolute left-1/2 top-full z-30 mt-1.5 w-[230px] -translate-x-1/2 rounded-xl border border-line bg-card p-1 text-start text-ink shadow-[0px_6px_14px_0px_rgba(0,0,0,0.1)]">
          {projects.length > 0 && (
            <div className="max-h-[220px] overflow-y-auto">
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => saveExisting(p)}
                  disabled={saving}
                  className={row}
                >
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          )}

          {projects.length > 0 && <div className="my-1 border-t border-line" />}

          {creating ? (
            <div className="flex items-center gap-1 p-1">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitNew();
                  else if (e.key === "Escape") reset();
                }}
                placeholder="اسم المشروع"
                maxLength={60}
                disabled={saving}
                className="h-8 min-w-0 flex-1 rounded-lg border border-line bg-transparent px-2 text-sm text-ink outline-none focus:border-line-hover disabled:opacity-50"
              />
              <button
                type="button"
                onClick={submitNew}
                disabled={!name.trim() || saving}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg bg-primary px-3 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {saving ? (
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
                ) : (
                  "إنشاء"
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              disabled={saving}
              className={`${row} font-medium text-primary`}
            >
              <Plus className="size-4" strokeWidth={2} /> مشروع جديد
            </button>
          )}
        </div>
      )}
    </div>
  );
}
