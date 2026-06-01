import type { Generation, GenerationRequest } from "@/lib/types";

/**
 * Generation service.
 *
 * MVP: mocked with a delay and no real output. When the backend is ready,
 * replace the body of `generateAd` with the real call (e.g. POST to the
 * provider-orchestration endpoint, then poll job status) — the signature and
 * the rest of the app stay the same.
 */
export async function generateAd(
  request: GenerationRequest,
  { signal }: { signal?: AbortSignal } = {},
): Promise<Generation> {
  await delay(2500, signal);

  return {
    id: crypto.randomUUID(),
    request,
    output: { type: request.mode },
    createdAt: Date.now(),
  };
}

/** Abortable delay used to fake network latency. */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}
