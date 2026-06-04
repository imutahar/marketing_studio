"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateAd, trackGeneration } from "@/lib/api/generation";
import type { Generation, GenerationRequest, GenerationStatus } from "@/lib/types";

/**
 * Owns the generation job lifecycle (idle → generating → result).
 * `start` creates + tracks a job; `track` follows a job created elsewhere
 * (e.g. the ad-reference flow).
 */
export function useGeneration() {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [result, setResult] = useState<Generation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  const run = useCallback(
    async (work: (signal: AbortSignal) => Promise<Generation>) => {
      controller.current?.abort();
      const ac = new AbortController();
      controller.current = ac;

      setStatus("generating");
      setError(null);
      try {
        const generation = await work(ac.signal);
        setResult(generation);
        setStatus("result");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
        setStatus("idle");
      }
    },
    [],
  );

  const start = useCallback(
    (request: GenerationRequest) => run((signal) => generateAd(request, { signal })),
    [run],
  );

  const track = useCallback(
    (id: string) => run((signal) => trackGeneration(id, { signal })),
    [run],
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  useEffect(() => () => controller.current?.abort(), []);

  return { status, result, error, start, track, reset };
}
