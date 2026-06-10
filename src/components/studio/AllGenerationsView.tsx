"use client";

import { useEffect, useState } from "react";
import { getAllGenerations } from "@/lib/api/generation";
import { GenerationGrid } from "./GenerationGrid";
import type { Generation } from "@/lib/types";

interface AllGenerationsViewProps {
  /** Bump to re-fetch (e.g. after a new generation finishes). */
  refreshKey: number;
  onView: (generation: Generation) => void;
  onRecreate: (generation: Generation) => void;
  onReuse: (generation: Generation) => void;
  onUseAsReference: (generation: Generation) => void;
}

/** Full-page feed of every generated ad across all projects. */
export function AllGenerationsView({
  refreshKey,
  onView,
  onRecreate,
  onReuse,
  onUseAsReference,
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

  if (!loaded) return null;

  return (
    <GenerationGrid
      title="كل الأعمال"
      generations={items}
      onView={onView}
      onRecreate={onRecreate}
      onReuse={onReuse}
      onUseAsReference={onUseAsReference}
      onDeleted={(id) => setItems((prev) => prev.filter((g) => g.id !== id))}
      emptyHint="لم تنشئ أي إعلانات بعد. ابدأ من المحرّر بالأعلى."
    />
  );
}
