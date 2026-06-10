"use client";

import { useCallback, useRef, useState } from "react";
import {
  createGeneration,
  getGeneration,
  cancelGeneration,
} from "@/lib/api/generation";
import type { GenerationRequest, StudioMode } from "@/lib/types";

/** An in-flight generation shown as a live card in the feed. */
export interface PendingJob {
  id: string;
  mode: StudioMode;
  prompt: string;
  status: "queued" | "processing";
}

const POLL_MS = 2500;

/**
 * Tracks in-flight generations so several can run at once and each shows as a
 * live card in the feed. `onSettled` fires when a job reaches a terminal state
 * so the caller can refresh the feed + usage (the finished card then appears
 * from the normal fetch). Cancel removes the card and tells the backend not to
 * bill the job.
 */
export function useGenerationQueue(onSettled: () => void) {
  const [pending, setPending] = useState<PendingJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const controllers = useRef<Map<string, AbortController>>(new Map());

  const drop = useCallback((id: string) => {
    setPending((p) => p.filter((j) => j.id !== id));
    controllers.current.get(id)?.abort();
    controllers.current.delete(id);
  }, []);

  const poll = useCallback(
    (id: string) => {
      const ctrl = new AbortController();
      controllers.current.set(id, ctrl);
      (async () => {
        try {
          while (!ctrl.signal.aborted) {
            const job = await getGeneration(id);
            if (job.status === "succeeded" || job.status === "draft_ready") {
              drop(id);
              onSettled();
              return;
            }
            if (job.status === "failed") {
              setError(job.error ?? "فشل إنشاء الإعلان");
              drop(id);
              return;
            }
            if (job.status === "cancelled") {
              drop(id);
              return;
            }
            setPending((p) =>
              p.map((j) =>
                j.id === id ? { ...j, status: job.status as "queued" | "processing" } : j,
              ),
            );
            await new Promise((r) => setTimeout(r, POLL_MS));
          }
        } catch {
          // network error / aborted — drop the card quietly.
          drop(id);
        }
      })();
    },
    [drop, onSettled],
  );

  /** Start a new generation and track it. */
  const start = useCallback(
    async (request: GenerationRequest) => {
      setError(null);
      try {
        const created = await createGeneration(request);
        setPending((p) => [
          { id: created.id, mode: request.mode, prompt: request.prompt, status: "queued" },
          ...p,
        ]);
        poll(created.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "تعذّر بدء الإنشاء");
      }
    },
    [poll],
  );

  /** Track an already-created generation (e.g. the ad-reference flow). */
  const track = useCallback(
    (id: string, mode: StudioMode, prompt: string) => {
      setPending((p) =>
        p.some((j) => j.id === id) ? p : [{ id, mode, prompt, status: "queued" }, ...p],
      );
      poll(id);
    },
    [poll],
  );

  const cancel = useCallback(
    (id: string) => {
      drop(id);
      void cancelGeneration(id).catch(() => {}); // best-effort
    },
    [drop],
  );

  return { pending, error, clearError: () => setError(null), start, track, cancel };
}
