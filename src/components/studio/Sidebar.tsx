"use client";

import {
  Link2,
  Plug,
  Sparkles,
  Plus,
  Folder,
  MoreHorizontal,
  Pencil,
  Trash2,
  LayoutGrid,
} from "lucide-react";
import { MONTHLY_USAGE_PERCENT, TOOLS } from "@/lib/mock";
import { formatNumber } from "@/lib/locale";
import type { UsageSummary } from "@/lib/api/usage";
import type { Project } from "@/lib/api/projects";
import type { ToolItem } from "@/lib/types";
import { usePopover } from "@/hooks/usePopover";
import { Button } from "@/components/ui/Button";
import { UsageWheel } from "./UsageWheel";

const TOOL_ICONS = {
  link: Link2,
  plug: Plug,
  sparkles: Sparkles,
} as const;

const PROJECT_COLORS = [
  "text-emerald-500",
  "text-amber-500",
  "text-sky-500",
  "text-rose-500",
  "text-violet-500",
  "text-cyan-500",
];

function Badge({ kind }: { kind: "new" | "soon" }) {
  const styles = kind === "new" ? "bg-danger-soft text-danger" : "bg-neutrals text-ink-faint";
  return (
    <span className={`ms-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold ${styles}`}>
      {kind === "new" ? "جديد" : "قريباً"}
    </span>
  );
}

function ToolNavItem({ tool, onSelect }: { tool: ToolItem; onSelect?: (id: string) => void }) {
  const Icon = TOOL_ICONS[tool.icon];
  return (
    <button
      type="button"
      disabled={tool.disabled}
      onClick={() => onSelect?.(tool.id)}
      className={`flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors ${
        tool.disabled ? "cursor-default text-ink-faint" : "text-ink hover:bg-neutrals"
      }`}
    >
      <Icon className="size-4 shrink-0 text-ink-faint" strokeWidth={1.75} />
      <span className="truncate">{tool.label}</span>
      {tool.badge && <Badge kind={tool.badge} />}
    </button>
  );
}

function ProjectNavItem({
  project,
  color,
  active,
  onSelect,
  onEdit,
  onDelete,
}: {
  project: Project;
  color: string;
  active: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  // Note: options button is hover-reveal on desktop (lg+) but always visible
  // below lg since touch devices can't hover.
  const { open, setOpen, ref } = usePopover();

  return (
    <div className="group relative flex items-center" ref={ref}>
      <button
        type="button"
        onClick={onSelect}
        className={`flex flex-1 items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors ${
          active ? "bg-neutrals font-medium text-ink" : "text-ink hover:bg-neutrals"
        }`}
      >
        <Folder className={`size-4 shrink-0 ${color}`} strokeWidth={1.75} />
        <span className="truncate">{project.name}</span>
        {project.generationCount > 0 && (
          <span className="ms-auto text-[10px] text-ink-faint group-hover:opacity-0">
            {project.generationCount}
          </span>
        )}
      </button>

      <button
        type="button"
        aria-label="خيارات المشروع"
        onClick={() => setOpen((o) => !o)}
        className="absolute end-1 block rounded-md p-1 text-ink-faint hover:bg-line lg:hidden lg:group-hover:block"
      >
        <MoreHorizontal className="size-4" strokeWidth={2} />
      </button>

      {open && (
        <ul className="absolute end-0 top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-line bg-card py-1 shadow-[0px_6px_14px_0px_rgba(0,0,0,0.1)]">
          <li>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-ink transition-colors hover:bg-neutrals"
            >
              <Pencil className="size-3.5" strokeWidth={1.75} /> إعدادات المشروع
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-danger transition-colors hover:bg-danger-soft"
            >
              <Trash2 className="size-3.5" strokeWidth={1.75} /> حذف
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="flex items-center gap-1.5 px-2 pb-1 text-xs font-medium text-ink-faint">
        {title}
        {count !== undefined && <span className="text-ink-faint/70">({count})</span>}
      </h3>
      {children}
    </div>
  );
}

interface SidebarProps {
  usage?: UsageSummary | null;
  onToolSelect?: (id: string) => void;
  /** Open the full "all generations" feed. */
  onOpenAssets: () => void;
  /** Whether the all-generations feed is the active view. */
  isAllView?: boolean;
  projects: Project[];
  activeId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onEditProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  /**
   * Fired after a navigation-style action (select/new project, tool, assets) so
   * the mobile drawer can close and drop the user back on the canvas. No-op on
   * the persistent desktop sidebar.
   */
  onNavigate?: () => void;
}

/**
 * The sidebar content (usage, new-project, tools, assets, projects). Rendered in
 * BOTH the persistent desktop aside and the mobile drawer — so its logic lives
 * here once. `onNavigate` is invoked after any action that takes the user back
 * to the canvas.
 */
export function Sidebar({
  usage,
  onToolSelect,
  onOpenAssets,
  isAllView,
  projects,
  activeId,
  onSelectProject,
  onNewProject,
  onEditProject,
  onDeleteProject,
  onNavigate,
}: SidebarProps) {
  const percent = usage?.percentUsed ?? MONTHLY_USAGE_PERCENT;

  return (
    <div className="flex h-full w-full flex-col px-4 py-4 scroll-thin">
      {/* Monthly token usage */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-ink">الاستخدام الشهري</span>
          <UsageWheel percent={percent} />
        </div>
        {usage && (
          <p className="text-[11px] text-ink-faint">
            متبقٍ{" "}
            <span className="font-bold text-ink">
              {formatNumber(usage.remainingTokens)}
            </span>{" "}
            من {formatNumber(usage.totalTokens)} رمز
          </p>
        )}
      </div>

      {/* New project */}
      <Button
        variant="outline"
        className="mt-5 w-full"
        onClick={() => {
          onNewProject();
          onNavigate?.();
        }}
      >
        <Plus className="size-4" strokeWidth={2} />
        مشروع جديد
      </Button>

      {/* Tools */}
      <div className="mt-6">
        <Section title="أدوات">
          {TOOLS.map((tool) => (
            <ToolNavItem
              key={tool.id}
              tool={tool}
              onSelect={(id) => {
                onToolSelect?.(id);
                onNavigate?.();
              }}
            />
          ))}
        </Section>
      </div>

      {/* All generations — the full feed of generated ads */}
      <button
        type="button"
        onClick={() => {
          onOpenAssets();
          onNavigate?.();
        }}
        aria-pressed={isAllView}
        className={`mt-2 flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors ${
          isAllView ? "bg-secondary/40 font-medium text-ink" : "text-ink hover:bg-neutrals"
        }`}
      >
        <LayoutGrid
          className={`size-4 shrink-0 ${isAllView ? "text-primary" : "text-ink-faint"}`}
          strokeWidth={1.75}
        />
        كل الأعمال
      </button>

      {/* Projects */}
      <div className="mt-6 min-h-0 flex-1 overflow-y-auto border-t border-line pt-5 scroll-thin">
        <Section title="المشاريع" count={projects.length}>
          {projects.length === 0 ? (
            <p className="px-2 py-3 text-xs text-ink-faint">لا توجد مشاريع بعد.</p>
          ) : (
            projects.map((project, i) => (
              <ProjectNavItem
                key={project.id}
                project={project}
                color={PROJECT_COLORS[i % PROJECT_COLORS.length]}
                active={project.id === activeId}
                onSelect={() => {
                  onSelectProject(project.id);
                  onNavigate?.();
                }}
                onEdit={() => onEditProject(project.id)}
                onDelete={() => onDeleteProject(project.id)}
              />
            ))
          )}
        </Section>
      </div>
    </div>
  );
}
