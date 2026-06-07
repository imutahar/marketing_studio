import { fetchJson } from "./client";
import type { Generation, GenerationRequest } from "@/lib/types";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 12 * 60 * 1000;

/**
 * Start a generation on the backend and poll until it finishes.
 * Throws on failure/timeout; respects an AbortSignal for cancellation.
 */
export async function generateAd(
  request: GenerationRequest,
  { signal }: { signal?: AbortSignal } = {},
): Promise<Generation> {
  const created = await fetchJson<Generation>("/api/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(request)),
    signal,
  });

  return pollUntilDone(created.id, signal);
}

/** Poll an already-created generation (e.g. started by the ad-reference flow). */
export function trackGeneration(
  id: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<Generation> {
  return pollUntilDone(id, signal);
}

/** Map the composer request to the backend DTO. */
function toPayload(request: GenerationRequest) {
  return {
    mode: request.mode,
    prompt: request.prompt,
    projectId: request.projectId,
    negativePrompt: request.negativePrompt,
    seed: request.seed,
    cameraFixed: request.cameraFixed,
    generateAudio: request.generateAudio,
    options: request.options,
    // previewUrl is a base64 data URI of the (downscaled) uploaded image, which
    // the provider can consume directly as the image-to-image/video reference.
    attachments: request.attachments.map((a) => ({
      slotId: a.slotId,
      kind: a.kind,
      fileName: a.fileName,
      url: a.previewUrl,
    })),
  };
}

async function pollUntilDone(
  id: string,
  signal?: AbortSignal,
): Promise<Generation> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const job = await fetchJson<Generation>(`/api/generations/${id}`, { signal });
    if (job.status === "succeeded") return job;
    if (job.status === "failed") {
      throw new Error(job.error ?? "فشل إنشاء الإعلان");
    }
    await delay(POLL_INTERVAL_MS, signal);
  }
  throw new Error("انتهت مهلة إنشاء الإعلان");
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
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
