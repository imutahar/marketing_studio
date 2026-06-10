import type { Generation, GenerationRequest } from "./types";

/**
 * Build a clean {@link GenerationRequest} from a finished generation, for the
 * "أعد الإنشاء" (recreate, re-run as-is) and "عدّل الوصف" (reuse prompt, load
 * into the composer) actions.
 *
 * The important bit is attachment normalization: a freshly-built request carries
 * `previewUrl`, but a generation fetched from the API carries `url` (the
 * backend's AttachmentInput shape). We map either onto `previewUrl` so the
 * product/reference image survives the round-trip instead of being silently
 * dropped. The old `projectId` is intentionally omitted — the caller assigns the
 * currently-active project.
 */
export function requestForReuse(gen: Generation): GenerationRequest {
  const r = gen.request;
  return {
    mode: r.mode,
    prompt: r.prompt,
    options: { ...r.options },
    attachments: (r.attachments ?? [])
      .map((a) => ({
        slotId: a.slotId,
        kind: a.kind,
        fileName: a.fileName,
        // Fetched generations carry `url`; freshly-built ones carry `previewUrl`.
        previewUrl: a.previewUrl ?? (a as { url?: string }).url ?? "",
      }))
      .filter((a) => a.previewUrl),
    negativePrompt: r.negativePrompt,
    seed: r.seed,
    cameraFixed: r.cameraFixed,
    generateAudio: r.generateAudio,
    draft: r.draft,
    fast: r.fast,
  };
}
