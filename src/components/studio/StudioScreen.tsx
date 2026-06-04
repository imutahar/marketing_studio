"use client";

import { useEffect, useState } from "react";
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
import { NewProjectModal } from "./NewProjectModal";

export function StudioScreen() {
  const composer = useComposer("video");
  const { status, result, error, start, track, show, reset: resetGeneration } = useGeneration();
  const { usage, refresh: refreshUsage } = useUsage();
  const {
    projects,
    activeId,
    activeProject,
    setActive,
    create: createProject,
    rename: renameProject,
    remove: removeProject,
    refresh: refreshProjects,
  } = useProjects();

  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [adRefModalOpen, setAdRefModalOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [galleryKey, setGalleryKey] = useState(0);

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
    if (!composer.canSubmit || status === "generating") return;
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-card">
      {/* Sidebar first in DOM → pinned to the right in RTL */}
      <Sidebar
        usage={usage}
        onToolSelect={handleToolSelect}
        projects={projects}
        activeId={activeId}
        onSelectProject={setActive}
        onNewProject={() => setNewProjectOpen(true)}
        onRenameProject={(id, name) => void renameProject(id, name)}
        onDeleteProject={(id) => void removeProject(id)}
      />

      {/* Main canvas */}
      <main className="studio-backdrop relative flex-1 overflow-y-auto scroll-thin">
        <div className="mx-auto flex min-h-full max-w-[1210px] flex-col items-center gap-10 px-8 py-16">
          <Hero projectName={activeProject?.name} />

          <Composer
            composer={composer}
            onSubmit={handleSubmit}
            isGenerating={status === "generating"}
          />

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-2 text-sm text-danger"
            >
              {error}
            </p>
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
                mode={result?.request.mode ?? composer.mode}
                prompt={result?.request.prompt ?? composer.prompt}
                result={result}
                onReset={handleReset}
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
        onGenerate={(generationId) => {
          setAdRefModalOpen(false);
          track(generationId);
        }}
      />

      <NewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onCreate={createProject}
      />
    </div>
  );
}
