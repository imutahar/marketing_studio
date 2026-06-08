"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X, TriangleAlert } from "lucide-react";
import { DIR, formatNumber } from "@/lib/locale";
import { friendlyError } from "@/lib/friendly-error";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useComposer } from "@/hooks/useComposer";
import { useGeneration } from "@/hooks/useGeneration";
import { useUsage } from "@/hooks/useUsage";
import { useProjects } from "@/hooks/useProjects";
import type { Preset } from "@/lib/types";
import type { UrlToAdResult } from "./UrlToAdModal";
import { Sidebar } from "./Sidebar";
import { Hero } from "./Hero";
import { Composer } from "./Composer";
import { PresetGallery } from "./PresetGallery";
import { ProjectGallery } from "./ProjectGallery";
import { ResultPanel } from "./ResultPanel";
import { UrlToAdModal } from "./UrlToAdModal";
import { AdReferenceModal } from "./AdReferenceModal";
import { ProjectModal } from "./ProjectModal";
import { AssetsModal } from "./AssetsModal";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import type { Asset } from "@/lib/api/assets";
import { getProject, type ProjectDetail, type ProjectInput } from "@/lib/api/projects";
import { assignGenerationProject } from "@/lib/api/generation";

export function StudioScreen() {
  const composer = useComposer("video");
  const {
    status,
    result,
    draft,
    error,
    start,
    track,
    approve,
    show,
    reset: resetGeneration,
  } = useGeneration();
  const { usage, refresh: refreshUsage } = useUsage();
  const {
    projects,
    activeId,
    setActive,
    create: createProject,
    update: updateProject,
    remove: removeProject,
    refresh: refreshProjects,
  } = useProjects();

  // Project pending deletion (drives the confirm dialog); null when none.
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [adRefModalOpen, setAdRefModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectDetail | null>(null);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [galleryKey, setGalleryKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(drawerRef, menuOpen, () => setMenuOpen(false));

  function openNewProject() {
    setEditingProject(null);
    setProjectModalOpen(true);
  }

  async function openEditProject(id: string) {
    try {
      const detail = await getProject(id);
      setEditingProject(detail);
      setProjectModalOpen(true);
    } catch {
      // ignore
    }
  }

  function submitProject(body: ProjectInput) {
    return editingProject ? updateProject(editingProject.id, body) : createProject(body);
  }

  function viewAsset(asset: Asset) {
    setAssetsOpen(false);
    show({
      id: asset.id,
      status: "succeeded",
      request: { mode: asset.type, prompt: asset.prompt ?? "", options: [], attachments: [] },
      outputs: [{ type: asset.type, url: asset.url }],
      createdAt: asset.createdAt,
    });
  }

  // After a finished job: refresh usage + the active project's summary.
  useEffect(() => {
    if (status !== "result") return;
    void refreshUsage();
    void refreshProjects();
  }, [status, refreshUsage, refreshProjects]);

  function handleToolSelect(id: string) {
    if (id === "url-to-ad") setUrlModalOpen(true);
    else if (id === "reference-ad") setAdRefModalOpen(true);
  }

  function handleGenerateFromUrl({ product, style, duration, resolution }: UrlToAdResult) {
    const base = `إعلان فيديو احترافي بأسلوب ${style.label} يبرز ${product.title}`;
    const description = product.description?.trim().slice(0, 220);
    const prompt = description ? `${base}. ${description}` : `${base}.`;
    const selections = { videoType: style.label, duration, resolution };
    composer.applyProduct({ prompt, imageUrl: product.image, fileName: product.title, selections });
    setUrlModalOpen(false);
    resetGeneration();
    start({
      mode: "video",
      prompt,
      options: Object.values(selections),
      projectId: activeId ?? undefined,
      attachments: [
        { slotId: "product", kind: "product", fileName: product.title, previewUrl: product.image },
      ],
    });
  }

  function handleSubmit() {
    // Block while generating OR while a draft preview is pending approval —
    // submitting again would silently discard the draft and start a new paid job.
    if (!composer.canSubmit || status === "generating" || status === "draft") return;
    start({ ...composer.buildRequest(), projectId: activeId ?? undefined });
  }

  function handlePickPreset(preset: Preset) {
    resetGeneration();
    composer.applyPreset(preset);
  }

  function handleReset() {
    resetGeneration();
    composer.reset();
    setGalleryKey((k) => k + 1); // refetch the project's works (new one added)
  }

  // Shared sidebar props. `onNavigate` only matters for the mobile drawer
  // (closes it after a navigation action); harmless on the desktop aside.
  const sidebarProps = {
    usage,
    onToolSelect: handleToolSelect,
    onOpenAssets: () => setAssetsOpen(true),
    projects,
    activeId,
    onSelectProject: setActive,
    onNewProject: openNewProject,
    onEditProject: (id: string) => void openEditProject(id),
    onDeleteProject: (id: string) => setPendingDeleteId(id),
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-card">
      {/* Persistent sidebar (desktop only). First in DOM → pinned to the right
          in RTL. Hidden below lg, where it becomes the off-canvas drawer. */}
      <aside className="hidden h-full w-[230px] shrink-0 border-s border-line bg-card lg:flex">
        <Sidebar {...sidebarProps} />
      </aside>

      {/* Mobile off-canvas drawer (below lg). Slides from the start edge: in RTL
          that is the right, so it is anchored end-0 and translated off-screen to
          the right (translate-x-full → physical right, since transforms are not
          mirrored by dir) when closed, and to 0 when open. */}
      <div className="lg:hidden" dir={DIR}>
        {/* Scrim — closes on tap */}
        <div
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
            menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="القائمة"
          // When closed the drawer stays mounted (off-screen) for the slide
          // animation; `inert` keeps its controls out of the tab order and the
          // a11y tree so it isn't a hidden keyboard trap.
          inert={!menuOpen}
          // Anchored at the start edge (right in RTL, matching the desktop
          // sidebar + the hamburger); transforms are physical, so closed =
          // translate-x-full pushes it off the right edge, open = 0.
          className={`fixed inset-y-0 start-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-e border-line bg-card shadow-[0px_1px_4px_0px_rgba(0,0,0,0.2)] transition-transform duration-200 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer header with close button */}
          <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
            <span className="text-sm font-bold text-ink">القائمة</span>
            <button
              type="button"
              aria-label="إغلاق"
              onClick={() => setMenuOpen(false)}
              className="grid size-11 place-items-center rounded-xl text-ink transition-colors hover:bg-neutrals"
            >
              <X className="size-5" strokeWidth={1.75} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">
            <Sidebar {...sidebarProps} onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      </div>

      {/* Main canvas */}
      <main className="studio-backdrop relative flex-1 overflow-y-auto scroll-thin">
        {/* Mobile top bar (below lg): hamburger on the start/right edge + credits pill. */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-card/95 px-4 py-2 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label="فتح القائمة"
            onClick={() => setMenuOpen(true)}
            className="grid size-11 place-items-center rounded-xl text-ink transition-colors hover:bg-neutrals"
          >
            <Menu className="size-5" strokeWidth={1.75} />
          </button>
          {usage && (
            <span className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs text-ink">
              <span className="text-ink-faint">رصيد</span>
              <span className="font-bold">{formatNumber(usage.remainingTokens)}</span>
            </span>
          )}
        </div>

        <div className="mx-auto flex min-h-full max-w-[1210px] flex-col items-center gap-10 px-4 py-8 sm:px-8 sm:py-16">
          <Hero
            projects={projects}
            activeId={activeId}
            onSelectProject={setActive}
            onCreateProject={(name) => void createProject({ name })}
          />

          <Composer
            composer={composer}
            onSubmit={handleSubmit}
            isBusy={status === "generating" || status === "draft"}
            usage={usage}
          />

          {error && (
            <div
              role="alert"
              className="flex w-full max-w-[640px] items-start gap-3 rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-start"
            >
              <TriangleAlert
                className="mt-0.5 size-5 shrink-0 text-danger"
                strokeWidth={1.75}
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-danger">تعذّر إنشاء الإعلان</p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {friendlyError(error)}
                </p>
              </div>
            </div>
          )}

          <div className="w-full pt-2">
            {status === "idle" ? (
              <div className="flex w-full flex-col gap-10">
                <ProjectGallery projectId={activeId} refreshKey={galleryKey} onView={show} />
                <PresetGallery onPick={handlePickPreset} />
              </div>
            ) : (
              <ResultPanel
                status={status}
                mode={result?.request.mode ?? draft?.request.mode ?? composer.mode}
                prompt={result?.request.prompt ?? draft?.request.prompt ?? composer.prompt}
                result={result}
                draft={draft}
                onApprove={approve}
                onReset={handleReset}
                projects={projects}
                onSaveToProject={async (projectId) => {
                  if (!result) return;
                  await assignGenerationProject(result.id, projectId);
                  await refreshProjects();
                }}
                onCreateProjectAndSave={async (name) => {
                  if (!result) return;
                  const p = await createProject({ name });
                  await assignGenerationProject(result.id, p.id);
                }}
              />
            )}
          </div>
        </div>
      </main>

      <UrlToAdModal
        open={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
        onGenerate={handleGenerateFromUrl}
      />

      <AdReferenceModal
        open={adRefModalOpen}
        onClose={() => setAdRefModalOpen(false)}
        projectId={activeId}
        onGenerate={(generationId) => {
          setAdRefModalOpen(false);
          track(generationId);
        }}
      />

      <ProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        project={editingProject}
        onSubmit={submitProject}
      />

      <AssetsModal
        open={assetsOpen}
        onClose={() => setAssetsOpen(false)}
        onView={viewAsset}
      />

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="حذف المشروع"
        message={
          (() => {
            const name = projects.find((p) => p.id === pendingDeleteId)?.name;
            return name
              ? `سيتم حذف مشروع "${name}" نهائيًا. لا يمكن التراجع عن هذا الإجراء.`
              : "سيتم حذف المشروع نهائيًا. لا يمكن التراجع عن هذا الإجراء.";
          })()
        }
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        danger
        onConfirm={() => {
          if (pendingDeleteId) void removeProject(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
