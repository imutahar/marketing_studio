import { fetchJson } from "./client";
import type { StudioMode } from "@/lib/types";

export interface Asset {
  id: string;
  type: StudioMode;
  url: string;
  prompt?: string;
  projectId?: string;
  createdAt: string;
}

export function getAssets(): Promise<Asset[]> {
  return fetchJson<Asset[]>("/api/assets");
}
