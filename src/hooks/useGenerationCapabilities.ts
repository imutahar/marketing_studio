"use client";

import { useEffect, useState } from "react";
import { getGenerationCapabilities } from "@/lib/api/generation";

/**
 * Composer-facing provider capabilities. `draftSupported` defaults to false
 * (hidden) until confirmed, so the draft toggle never flashes on a model that
 * doesn't support it (e.g. Seedance 2.0) and a failed probe simply hides an
 * optional feature rather than showing a no-op.
 */
export function useGenerationCapabilities() {
  const [draftSupported, setDraftSupported] = useState(false);

  useEffect(() => {
    let active = true;
    getGenerationCapabilities()
      .then((c) => active && setDraftSupported(!!c.draft))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return { draftSupported };
}
