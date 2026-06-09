"use client";

import { useCallback, useEffect, useState } from "react";
import { enhancePrompt, getEnhanceStatus, type EnhancePayload } from "@/lib/api/enhance";

/**
 * Prompt-enhancer state for the composer. Probes availability once (the button
 * stays hidden when the backend has no LLM key), runs the rewrite, and holds
 * the result as a *suggestion* so the user accepts it explicitly — the live
 * prompt is never overwritten behind their back.
 */
export function useEnhance() {
  const [available, setAvailable] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getEnhanceStatus()
      .then((s) => active && setAvailable(s.available))
      .catch(() => active && setAvailable(false));
    return () => {
      active = false;
    };
  }, []);

  const enhance = useCallback(async (payload: EnhancePayload) => {
    setError(false);
    setSuggestion(null);
    setEnhancing(true);
    try {
      const { prompt } = await enhancePrompt(payload);
      setSuggestion(prompt);
    } catch {
      setError(true);
    } finally {
      setEnhancing(false);
    }
  }, []);

  /** Clear the suggestion + any error (on accept or dismiss). */
  const dismiss = useCallback(() => {
    setSuggestion(null);
    setError(false);
  }, []);

  return { available, enhancing, suggestion, error, enhance, dismiss };
}
