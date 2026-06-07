"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { approveGeneration, generateAd, trackGeneration } from "@/lib/api/generation";
import type { Generation, GenerationRequest, GenerationStatus } from "@/lib/types";

/**
 * Owns the generation job lifecycle (idle → generating → [draft] → result).
 * `start` creates + tracks a job; `track` follows a job created elsewhere
 * (e.g. the ad-reference flow). When a job comes back as `draft_ready` it
 * parks in the `draft` state until the user `approve()`s or resets.
 */
export function useGeneration() {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [result, setResult] = useState<Generation | null>(null);
  const [draft, setDraft] = useState<Generation | null>(null);
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
        // Guard against a stale job resolving after a newer run/abort started.
        if (ac.signal.aborted || controller.current !== ac) return;
        if (generation.status === "draft_ready") {
          setDraft(generation);
          setStatus("draft");
        } else {
          setResult(generation);
          setStatus("result");
        }
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

  /** Approve the current draft → render full-resolution, then show the result. */
  const approve = useCallback(() => {
    const id = draft?.id;
    if (!id) return;
    void run((signal) => approveGeneration(id, { signal }));
  }, [draft, run]);

  /** Show an existing generation (e.g. opening one from the project gallery). */
  const show = useCallback((generation: Generation) => {
    controller.current?.abort();
    setDraft(null);
    setResult(generation);
    setStatus("result");
    setError(null);
  }, []);

  const reset = useCallback(() => {
    controller.current?.abort();
    setStatus("idle");
    setResult(null);
    setDraft(null);
    setError(null);
  }, []);

  useEffect(() => () => controller.current?.abort(), []);

  return { status, result, draft, error, start, track, approve, show, reset };
}
