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

/**
 * Approve a draft preview and render it at full resolution.
 * POSTs to the approve endpoint, then polls until the job resolves
 * (succeeded/failed) — it will not return to draft_ready after approval.
 */
export async function approveGeneration(
  id: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<Generation> {
  await fetchJson<unknown>(`/api/generations/${id}/approve`, {
    method: "POST",
    signal,
  });
  return pollUntilDone(id, signal);
}

/**
 * Provider capabilities for the composer (e.g. whether the active video model
 * supports the 480p draft preview — Seedance 2.0 doesn't).
 */
export function getGenerationCapabilities(): Promise<{ draft: boolean }> {
  return fetchJson<{ draft: boolean }>("/api/generations/capabilities");
}

/** File a finished generation into a project (or move it between projects). */
export function assignGenerationProject(id: string, projectId: string): Promise<Generation> {
  return fetchJson<Generation>(`/api/generations/${id}/project`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  });
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
    draft: request.draft,
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
    // Terminal stops: succeeded, draft_ready (resolve), failed (throw).
    if (job.status === "succeeded" || job.status === "draft_ready") return job;
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
    const id = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    }
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
