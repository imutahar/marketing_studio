"use client";

import { useCallback, useState } from "react";

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  createdAt: string;
}

const KEY = "mediaLibrary";

function load(): MediaItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as MediaItem[];
  } catch {
    return [];
  }
}

function persist(items: MediaItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // quota exceeded — keep in memory only
  }
}

/**
 * The user's uploaded media library (reference images), persisted in the
 * browser so it's reusable across projects/campaigns. Swap for a backend
 * media store later.
 */
export function useMediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>(load);

  const add = useCallback((url: string, name: string): MediaItem => {
    const item: MediaItem = {
      id: crypto.randomUUID(),
      url,
      name,
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => {
      const next = [item, ...prev];
      persist(next);
      return next;
    });
    return item;
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return { items, add, remove };
}
