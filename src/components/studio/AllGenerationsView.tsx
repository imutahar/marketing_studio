"use client";

import { useEffect, useState } from "react";
import { getAllGenerations } from "@/lib/api/generation";
import { GenerationGrid } from "./GenerationGrid";
import type { PendingJob } from "@/hooks/useGenerationQueue";
import type { Generation } from "@/lib/types";

interface AllGenerationsViewProps {
  /** Bump to re-fetch (e.g. after a new generation finishes). */
  refreshKey: number;
  onView: (generation: Generation) => void;
  onRecreate: (generation: Generation) => void;
  onReuse: (generation: Generation) => void;
  onUseAsReference: (generation: Generation) => void;
  /** Live in-flight generations + cancel. */
  pending?: PendingJob[];
  onCancel?: (id: string) => void;
}

/** Full-page feed of every generated ad across all projects. */
export function AllGenerationsView({
  refreshKey,
  onView,
  onRecreate,
  onReuse,
  onUseAsReference,
  pending,
  onCancel,
}: AllGenerationsViewProps) {
  const [items, setItems] = useState<Generation[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    getAllGenerations()
      .then((list) => {
        if (!active) return;
        setItems(list.filter((g) => g.status === "succeeded" && g.outputs.length > 0));
        setLoaded(true);
      })
      .catch(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, [refreshKey]);

  // Wait for the first load only when there's nothing live to show yet.
  if (!loaded && (!pending || pending.length === 0)) return null;

  return (
    <GenerationGrid
      title="كل الأعمال"
      generations={items}
      pending={pending}
      onCancel={onCancel}
      onView={onView}
      onRecreate={onRecreate}
      onReuse={onReuse}
      onUseAsReference={onUseAsReference}
      onDeleted={(id) => setItems((prev) => prev.filter((g) => g.id !== id))}
      emptyHint="لم تنشئ أي إعلانات بعد. ابدأ من المحرّر بالأعلى."
    />
  );
}
