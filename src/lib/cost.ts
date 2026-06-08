// Client-side credit-cost estimate for the composer. Mirrors the BACKEND
// formula EXACTLY (generation.service.ts tokenCost + common/duration.ts) so the
// "~N رصيد" hint by the send button matches what's actually deducted. Audio and
// resolution do NOT affect the internal token cost today, so they're ignored
// here too — keep this in lockstep with the backend if those rules change.

import type { StudioMode } from "./types";

/** Flat token cost of an image generation. */
export const IMAGE_COST = 20;
/** Token cost per second of video. */
export const VIDEO_COST_PER_SECOND = 10;
/** Fallback video length when the duration selection can't be parsed. */
export const DEFAULT_VIDEO_SECONDS = 10;
/** Drafts run a cheap 480p preview, so they cost a fraction of the full job. */
export const DRAFT_MULTIPLIER = 0.6;

/** Matches a duration option like "12s" or "12 ث" (Arabic seconds). */
const DURATION_PATTERN = /^(\d+)\s*(?:s|ث)$/;

/**
 * Extract the selected video duration (in seconds) from a selection string like
 * "12 ث". Returns `DEFAULT_VIDEO_SECONDS` when the string can't be parsed.
 */
export function parseDurationSeconds(selection: string | undefined): number {
  if (!selection) return DEFAULT_VIDEO_SECONDS;
  const match = selection.trim().match(DURATION_PATTERN);
  return match ? Number(match[1]) : DEFAULT_VIDEO_SECONDS;
}

export interface CostEstimate {
  /** Credits charged for the full-quality render. */
  full: number;
  /** Credits charged now for the 480p draft preview (video drafts only). */
  preview?: number;
}

/**
 * Estimate the credit cost of the current composer settings.
 * - image → flat {@link IMAGE_COST}.
 * - video → `seconds * VIDEO_COST_PER_SECOND`; with `draft` on, also a reduced
 *   `preview` charge (the full charge lands on approval).
 */
export function estimateCost({
  mode,
  durationSeconds,
  draft,
}: {
  mode: StudioMode;
  durationSeconds?: number;
  draft?: boolean;
}): CostEstimate {
  if (mode === "image") return { full: IMAGE_COST };

  const full = (durationSeconds ?? DEFAULT_VIDEO_SECONDS) * VIDEO_COST_PER_SECOND;
  if (draft) return { full, preview: Math.round(full * DRAFT_MULTIPLIER) };
  return { full };
}
