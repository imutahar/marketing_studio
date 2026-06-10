// Domain types for the Marketing Studio MVP.
// Kept intentionally small — the studio home screen only needs these.

export type StudioMode = "image" | "video";

/** A preset / template card in the gallery (the Higgsfield-style entry points). */
export interface Preset {
  id: string;
  /** Arabic label shown on the card badge, e.g. "إعلان تلفزيوني". */
  label: string;
  /** Which mode the preset produces. */
  mode: StudioMode;
  /** Prompt scaffold pre-filled into the composer when picked. */
  promptScaffold: string;
  /** Tailwind gradient classes used for the placeholder thumbnail. */
  gradient: string;
  /** Optional preview video that autoplays in the card. */
  video?: string;
}

/** A saved project in the sidebar. */
export interface Project {
  id: string;
  name: string;
  /** Tailwind text-color class used to tint the project's folder icon. */
  color: string;
}

/** A tool entry in the sidebar (URL→ad, reference ad, MCP connection). */
export interface ToolItem {
  id: string;
  label: string;
  icon: "link" | "plug" | "sparkles";
  /** Optional status badge: new feature, or coming soon (disabled). */
  badge?: "new" | "soon";
  disabled?: boolean;
}

/** A mock store product used by the (future) product picker. */
export interface MockProduct {
  id: string;
  name: string;
  price: string;
  gradient: string;
}

/** An attachment slot inside the composer. */
export interface AttachmentSlot {
  id: string;
  kind: "product" | "character" | "image";
  label: string;
  required?: boolean;
}

/** Generation lifecycle for the in-place result experience. */
export type GenerationStatus = "idle" | "generating" | "draft" | "result";

/** A value attached to a composer slot (a locally-uploaded image). */
export interface AttachmentValue {
  slotId: string;
  kind: AttachmentSlot["kind"];
  fileName: string;
  /** Base64 data URI of the downscaled image — used for preview and as input. */
  previewUrl: string;
}

/**
 * Everything the composer collects, ready to hand to a generation backend.
 * This is the single source of truth for "what the user wants generated".
 */
export interface GenerationRequest {
  mode: StudioMode;
  prompt: string;
  /**
   * Selected toolbar options, keyed by the toolbar select id (e.g.
   * `{ duration: "12 ث", ratio: "9:16", resolution: "1080p", videoType: "…" }`).
   * The backend reads `duration`/`ratio`/`resolution` as params; other entries
   * are prompt descriptors. Keyed so settings can't shift when chips reorder.
   */
  options: Record<string, string>;
  attachments: AttachmentValue[];
  /** Owning project, if any. */
  projectId?: string;
  /** Advanced settings. */
  negativePrompt?: string;
  seed?: number;
  cameraFixed?: boolean;
  /** Video only: generate synced audio (voice/SFX/music). */
  generateAudio?: boolean;
  /** Video only: generate a cheap 480p draft preview before the full render. */
  draft?: boolean;
  /** Video only: use the faster, cheaper model variant (lower fidelity). */
  fast?: boolean;
}

/** A single generated asset returned by the backend. */
export interface GenerationOutput {
  type: StudioMode;
  url: string;
}

/** A generation job as returned by the backend. */
export interface Generation {
  id: string;
  status: "queued" | "processing" | "succeeded" | "failed" | "draft_ready" | "cancelled";
  request: GenerationRequest;
  outputs: GenerationOutput[];
  capability?: string;
  provider?: string;
  error?: string;
  /** Draft mode: 480p preview video URL, present when status is "draft_ready". */
  draftPreviewUrl?: string;
  /** Draft mode: provider task id for the draft preview. */
  draftTaskId?: string;
  createdAt: string;
  updatedAt?: string;
}
