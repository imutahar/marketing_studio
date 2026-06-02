import type { Generation, GenerationRequest } from "@/lib/types";

/** Backend base URL. Override with NEXT_PUBLIC_API_URL; defaults to local dev. */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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
  const created = await fetchJson<Generation>(`${API_BASE}/api/generations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(request)),
    signal,
  });

  return pollUntilDone(created.id, signal);
}

/** Map the composer request to the backend DTO (drops client-only fields). */
function toPayload(request: GenerationRequest) {
  return {
    mode: request.mode,
    prompt: request.prompt,
    options: request.options,
    // NOTE: previewUrl is a local blob URL the backend can't read. We send
    // metadata only for now; a real upload pipeline (file → public URL) is the
    // next step for image-to-image / image-to-video with live providers.
    attachments: request.attachments.map((a) => ({
      slotId: a.slotId,
      kind: a.kind,
      fileName: a.fileName,
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

    const job = await fetchJson<Generation>(
      `${API_BASE}/api/generations/${id}`,
      { signal },
    );
    if (job.status === "succeeded") return job;
    if (job.status === "failed") {
      throw new Error(job.error ?? "فشل إنشاء الإعلان");
    }
    await delay(POLL_INTERVAL_MS, signal);
  }
  throw new Error("انتهت مهلة إنشاء الإعلان");
}

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Backend ${res.status}: ${detail || res.statusText}`);
  }
  return (await res.json()) as T;
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
