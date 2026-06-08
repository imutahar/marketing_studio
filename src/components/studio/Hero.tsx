import { ProjectSwitcher } from "./ProjectSwitcher";
import type { Project } from "@/lib/api/projects";

interface HeroProps {
  projects: Project[];
  activeId: string | null;
  onSelectProject: (id: string | null) => void;
  onCreateProject: (name: string) => void | Promise<void>;
}

/** Centered hero: the project switcher (switch / clear / create inline) + the
 *  big headline. */
export function Hero({
  projects,
  activeId,
  onSelectProject,
  onCreateProject,
}: HeroProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
      <ProjectSwitcher
        projects={projects}
        activeId={activeId}
        onSelect={onSelectProject}
        onCreate={onCreateProject}
      />
      <h1 className="text-2xl font-bold leading-tight text-ink-strong sm:text-4xl sm:leading-[40px]">
        حوّل أي منتج إلى إعلان فيديو
      </h1>
    </div>
  );
}
