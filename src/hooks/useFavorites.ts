"use client";

import { useCallback, useEffect, useState } from "react";

/** localStorage key for favorited generation ids. */
const KEY = "ms.favorites";

function read(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/**
 * Favorited generations, persisted in localStorage. Per-browser for the testing
 * phase; moves to the backend (a `favorite` flag) once there's real merchant
 * auth — the hook's shape can stay the same.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => read());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...favorites]));
    } catch {
      // ignore quota / privacy-mode failures
    }
  }, [favorites]);

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { favorites, isFavorite, toggle };
}
