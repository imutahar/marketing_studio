import { fetchJson } from "./client";
import type { StudioMode } from "@/lib/types";

export interface EnhancePayload {
  prompt: string;
  mode: StudioMode;
  /** Toolbar selections (format, imageType, ratio, …) — light context. */
  options?: Record<string, string>;
  /** Name of the attached product, so the rewrite is product-specific. */
  productName?: string;
}

/** Whether the backend has the enhancer configured (drives the UI gate). */
export function getEnhanceStatus(): Promise<{ available: boolean }> {
  return fetchJson<{ available: boolean }>("/api/enhance/status");
}

/** Rewrite a rough prompt into a richer ad prompt. */
export function enhancePrompt(payload: EnhancePayload): Promise<{ prompt: string }> {
  return fetchJson<{ prompt: string }>("/api/enhance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
