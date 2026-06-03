"use client";

import { useCallback, useEffect, useState } from "react";
import { getUsage, type UsageSummary } from "@/lib/api/usage";

/** Fetches the monthly token usage; `refresh` re-fetches (e.g. after a job). */
export function useUsage() {
  const [usage, setUsage] = useState<UsageSummary | null>(null);

  const refresh = useCallback(async () => {
    try {
      setUsage(await getUsage());
    } catch {
      // Keep the last known value if the backend is unreachable.
    }
  }, []);

  useEffect(() => {
    let active = true;
    getUsage()
      .then((u) => {
        if (active) setUsage(u);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return { usage, refresh };
}
