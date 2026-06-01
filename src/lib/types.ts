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
}

/** A saved project in the sidebar. */
export interface Project {
  id: string;
  name: string;
}

/** A tool entry in the sidebar (URL→ad, MCP connection, reference ad…). */
export interface ToolItem {
  id: string;
  label: string;
  icon: "link" | "plug" | "sparkles";
  isNew?: boolean;
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
export type GenerationStatus = "idle" | "generating" | "result";

/** A value attached to a composer slot (MVP: a locally-uploaded image). */
export interface AttachmentValue {
  slotId: string;
  kind: AttachmentSlot["kind"];
  fileName: string;
  previewUrl: string;
}

/**
 * Everything the composer collects, ready to hand to a generation backend.
 * This is the single source of truth for "what the user wants generated".
 */
export interface GenerationRequest {
  mode: StudioMode;
  prompt: string;
  /** Selected toolbar option labels (duration, ratio, platform, …). */
  options: string[];
  attachments: AttachmentValue[];
}

/** Result of a generation job (mocked for now). */
export interface Generation {
  id: string;
  request: GenerationRequest;
  output: { type: StudioMode };
  createdAt: number;
}
