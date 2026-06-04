"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { useHoverVideo } from "@/hooks/useHoverVideo";
import { getProjectGenerations } from "@/lib/api/projects";
import type { Generation } from "@/lib/types";

function WorkCard({ gen, onView }: { gen: Generation; onView: () => void }) {
  const { videoRef, hoverHandlers } = useHoverVideo();
  const out = gen.outputs[0];

  return (
    <button
      type="button"
      onClick={onView}
      {...(out.type === "video" ? hoverHandlers : {})}
      className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutrals transition hover:-translate-y-1"
    >
      {out.type === "video" ? (
        <>
          <video
            ref={videoRef}
            src={out.url}
            muted
            loop
            playsInline
            preload="metadata"
            className="pointer-events-none absolute inset-0 size-full object-cover"
          />
          <span className="absolute inset-0 grid place-items-center bg-black/10">
            <Play className="size-6 text-card/90" />
          </span>
        </>
      ) : (
        <Image src={out.url} alt="" fill className="object-cover" unoptimized />
      )}
    </button>
  );
}

interface ProjectGalleryProps {
  projectId: string | null;
  /** Bump to re-fetch (e.g. after a new generation). */
  refreshKey: number;
  onView: (generation: Generation) => void;
}

/** Shows the active project's generated ads. Renders nothing if empty. */
export function ProjectGallery({ projectId, refreshKey, onView }: ProjectGalleryProps) {
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
    <div className="w-full">
      <h3 className="mb-3 text-sm font-medium text-ink">أعمال المشروع</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
        {works.map((gen) => (
          <WorkCard key={gen.id} gen={gen} onView={() => onView(gen)} />
        ))}
      </div>
    </div>
  );
}
