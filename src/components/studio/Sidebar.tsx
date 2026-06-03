import { Link2, Plug, Sparkles, Plus, Folder } from "lucide-react";
import { MONTHLY_USAGE_PERCENT, PROJECTS, TOOLS } from "@/lib/mock";
import type { UsageSummary } from "@/lib/api/usage";
import type { Project, ToolItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { UsageWheel } from "./UsageWheel";

const TOOL_ICONS = {
  link: Link2,
  plug: Plug,
  sparkles: Sparkles,
} as const;

function Badge({ kind }: { kind: "new" | "soon" }) {
  const styles =
    kind === "new"
      ? "bg-danger-soft text-danger"
      : "bg-neutrals text-ink-faint";
  return (
    <span className={`ms-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold ${styles}`}>
      {kind === "new" ? "جديد" : "قريباً"}
    </span>
  );
}

function ToolNavItem({
  tool,
  onSelect,
}: {
  tool: ToolItem;
  onSelect?: (id: string) => void;
}) {
  const Icon = TOOL_ICONS[tool.icon];
  return (
    <button
      type="button"
      disabled={tool.disabled}
      onClick={() => onSelect?.(tool.id)}
      className={`flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors ${
        tool.disabled
          ? "cursor-default text-ink-faint"
          : "text-ink hover:bg-neutrals"
      }`}
    >
      <Icon className="size-4 shrink-0 text-ink-faint" strokeWidth={1.75} />
      <span className="truncate">{tool.label}</span>
      {tool.badge && <Badge kind={tool.badge} />}
    </button>
  );
}

function ProjectNavItem({ project }: { project: Project }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-ink transition-colors hover:bg-neutrals"
    >
      <Folder className={`size-4 shrink-0 ${project.color}`} strokeWidth={1.75} />
      <span className="truncate">{project.name}</span>
    </button>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="flex items-center gap-1.5 px-2 pb-1 text-xs font-medium text-ink-faint">
        {title}
        {count !== undefined && (
          <span className="text-ink-faint/70">({count})</span>
        )}
      </h3>
      {children}
    </div>
  );
}

export function Sidebar({
  usage,
  onToolSelect,
}: {
  usage?: UsageSummary | null;
  onToolSelect?: (id: string) => void;
}) {
  const percent = usage?.percentUsed ?? MONTHLY_USAGE_PERCENT;
  return (
    <aside className="flex h-full w-[230px] shrink-0 flex-col border-s border-line bg-card px-4 py-4 scroll-thin">
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
              {usage.remainingTokens.toLocaleString("en-US")}
            </span>{" "}
            من {usage.totalTokens.toLocaleString("en-US")} رمز
          </p>
        )}
      </div>

      {/* New project */}
      <Button variant="outline" className="mt-5 w-full">
        <Plus className="size-4" strokeWidth={2} />
        مشروع جديد
      </Button>

      {/* Tools */}
      <div className="mt-6">
        <Section title="أدوات">
          {TOOLS.map((tool) => (
            <ToolNavItem key={tool.id} tool={tool} onSelect={onToolSelect} />
          ))}
        </Section>
      </div>

      {/* Projects (divider for clearer separation) */}
      <div className="mt-6 border-t border-line pt-5">
        <Section title="المشاريع" count={PROJECTS.length}>
          {PROJECTS.map((project) => (
            <ProjectNavItem key={project.id} project={project} />
          ))}
        </Section>
      </div>
    </aside>
  );
}
