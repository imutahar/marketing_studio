"use client";

import { useState } from "react";
import { Folder, Plus, Check, ChevronDown } from "lucide-react";
import { DIR } from "@/lib/locale";
import { usePopover } from "@/hooks/usePopover";
import type { Project } from "@/lib/api/projects";

interface ProjectSwitcherProps {
  projects: Project[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  /** Create a project on the fly from just a name; it becomes active. */
  onCreate: (name: string) => void | Promise<void>;
}

/**
 * Compact project picker for the composer header: switch project, clear to
 * none ("بدون مشروع" → the default workspace), or create one inline without
 * opening the full project modal.
 */
export function ProjectSwitcher({
  projects,
  activeId,
  onSelect,
  onCreate,
}: ProjectSwitcherProps) {
  const { open, setOpen, ref } = usePopover();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const active = projects.find((p) => p.id === activeId);

  function reset() {
    setCreating(false);
    setName("");
  }

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    void onCreate(trimmed);
    reset();
    setOpen(false);
  }

  const row =
    "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-start text-sm transition-colors hover:bg-neutrals focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";

  return (
    <div className="relative" dir={DIR} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="المشروع"
        className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-line-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
      >
        <Folder className="size-4 text-primary" strokeWidth={1.75} />
        <span className="max-w-[160px] truncate">
          {active ? active.name : "بدون مشروع"}
        </span>
        <ChevronDown className="size-3.5 text-ink-faint" strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-30 mt-1.5 w-[230px] -translate-x-1/2 rounded-xl border border-line bg-card p-1 text-ink shadow-[0px_6px_14px_0px_rgba(0,0,0,0.1)]">
          <div className="max-h-[220px] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
              className={row}
            >
              {!activeId && (
                <Check className="size-3.5 text-primary" strokeWidth={2} />
              )}
              <span className={activeId ? "ms-[22px]" : ""}>بدون مشروع</span>
            </button>
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onSelect(p.id);
                  setOpen(false);
                }}
                className={row}
              >
                {p.id === activeId && (
                  <Check className="size-3.5 text-primary" strokeWidth={2} />
                )}
                <span className={`truncate ${p.id === activeId ? "" : "ms-[22px]"}`}>
                  {p.name}
                </span>
              </button>
            ))}
          </div>

          <div className="my-1 border-t border-line" />

          {creating ? (
            <div className="flex items-center gap-1 p-1">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                  else if (e.key === "Escape") reset();
                }}
                placeholder="اسم المشروع"
                maxLength={60}
                className="h-8 min-w-0 flex-1 rounded-lg border border-line bg-transparent px-2 text-sm text-ink outline-none focus:border-line-hover"
              />
              <button
                type="button"
                onClick={submit}
                disabled={!name.trim()}
                className="h-8 shrink-0 rounded-lg bg-primary px-3 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                إنشاء
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
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
