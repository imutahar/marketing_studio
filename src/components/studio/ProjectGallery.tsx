"use client";

import { useEffect, useState } from "react";
import { getProjectGenerations } from "@/lib/api/projects";
import { GenerationGrid } from "./GenerationGrid";
import type { Generation } from "@/lib/types";

interface ProjectGalleryProps {
  projectId: string | null;
  /** Bump to re-fetch (e.g. after a new generation). */
  refreshKey: number;
  onView: (generation: Generation) => void;
  onRecreate: (generation: Generation) => void;
  onReuse: (generation: Generation) => void;
  onUseAsReference: (generation: Generation) => void;
}

/** The active project's generated ads. Renders nothing when the project is empty. */
export function ProjectGallery({
  projectId,
  refreshKey,
  onView,
  onRecreate,
  onReuse,
  onUseAsReference,
}: ProjectGalleryProps) {
  const [works, setWorks] = useState<Generation[]>([]);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    getProjectGenerations(projectId)
      .then((list) => {
        if (active) {
          setWorks(list.filter((g) => g.status === "succeeded" && g.outputs.length > 0));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [projectId, refreshKey]);

  if (!projectId || works.length === 0) return null;

  return (
    <GenerationGrid
      title="أعمال المشروع"
      generations={works}
      onView={onView}
      onRecreate={onRecreate}
      onReuse={onReuse}
      onUseAsReference={onUseAsReference}
      onDeleted={(id) => setWorks((prev) => prev.filter((w) => w.id !== id))}
    />
  );
}
