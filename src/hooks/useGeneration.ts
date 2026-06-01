"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateAd } from "@/lib/api/generation";
import type { Generation, GenerationRequest, GenerationStatus } from "@/lib/types";

/**
 * Owns the generation job lifecycle (idle → generating → result), abstracted
 * from the UI. Maps cleanly onto a real polling/SSE flow later — only the
 * `generateAd` call inside changes.
 */
export function useGeneration() {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [result, setResult] = useState<Generation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  const start = useCallback(async (request: GenerationRequest) => {
    controller.current?.abort();
    const ac = new AbortController();
    controller.current = ac;

    setStatus("generating");
    setError(null);
    try {
      const generation = await generateAd(request, { signal: ac.signal });
      setResult(generation);
      setStatus("result");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
      setStatus("idle");
    }
  }, []);

  const reset = useCallback(() => {
    controller.current?.abort();
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  useEffect(() => () => controller.current?.abort(), []);

  return { status, result, error, start, reset };
}
