import { fetchJson } from "./client";

/** Monthly token quota for the subscription plan. */
export interface UsageSummary {
  plan: string;
  totalTokens: number;
  usedTokens: number;
  remainingTokens: number;
  /** 0–100, used / total. */
  percentUsed: number;
}

export function getUsage(): Promise<UsageSummary> {
  return fetchJson<UsageSummary>("/api/usage");
}
