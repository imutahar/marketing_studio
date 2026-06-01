import { Link2, Plug, Sparkles, Plus, Folder } from "lucide-react";
import { MONTHLY_USAGE_PERCENT, PROJECTS, TOOLS } from "@/lib/mock";
import type { ToolItem } from "@/lib/types";
import { UsageWheel } from "./UsageWheel";

const TOOL_ICONS = {
  link: Link2,
  plug: Plug,
  sparkles: Sparkles,
} as const;

function NavItem({ label, icon: Icon, isNew }: { label: string; icon: React.ElementType; isNew?: boolean }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-ink transition-colors hover:bg-neutrals"
    >
      <Icon className="size-4 shrink-0 text-ink-faint" strokeWidth={1.75} />
      <span className="truncate">{label}</span>
      {isNew && (
        <span className="ms-auto rounded-full bg-danger-soft px-1.5 py-0.5 text-[10px] font-bold text-danger">
          جديد
        </span>
      )}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="px-2 pb-1 text-xs font-medium text-ink-faint">{title}</h3>
      {children}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-[230px] shrink-0 flex-col gap-5 border-s border-line bg-card px-4 py-4 scroll-thin">
      {/* Monthly usage */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink">الاستخدام الشهري</span>
        <UsageWheel percent={MONTHLY_USAGE_PERCENT} />
      </div>

      {/* New project */}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-line py-2 text-sm font-medium text-ink transition-colors hover:border-line-hover hover:bg-neutrals"
      >
        <Plus className="size-4" strokeWidth={2} />
        مشروع جديد
      </button>

      {/* Tools */}
      <Section title="أدوات">
        {TOOLS.map((tool: ToolItem) => (
          <NavItem key={tool.id} label={tool.label} icon={TOOL_ICONS[tool.icon]} isNew={tool.isNew} />
        ))}
      </Section>

      {/* Projects */}
      <Section title="المشاريع">
        {PROJECTS.map((project) => (
          <NavItem key={project.id} label={project.name} icon={Folder} />
        ))}
      </Section>
    </aside>
  );
}
