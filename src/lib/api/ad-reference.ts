import { fetchJson } from "./client";

export interface AdShot {
  index: number;
  start: number;
  end: number;
  type: string;
  visual: string;
  spoken: string;
  onScreenText: string;
}

export interface AdScript {
  durationSec: number;
  aspectRatio: string;
  shots: AdShot[];
}

export interface AdReference {
  id: string;
  status: "analyzing" | "ready" | "failed";
  progress: number;
  referenceVideoUrl: string;
  productImage?: string;
  avatarImage?: string;
  avatarName?: string;
  script?: AdScript;
  generationId?: string;
  error?: string;
}

export interface CreateAdReferenceBody {
  referenceVideoUrl: string;
  productImage?: string;
  avatarImage?: string;
  avatarName?: string;
}

export function createAdReference(body: CreateAdReferenceBody): Promise<AdReference> {
  return fetchJson<AdReference>("/api/ad-references", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function getAdReference(id: string): Promise<AdReference> {
  return fetchJson<AdReference>(`/api/ad-references/${id}`);
}

export function updateAdScript(id: string, script: AdScript): Promise<AdReference> {
  return fetchJson<AdReference>(`/api/ad-references/${id}/script`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(script),
  });
}

export interface GenerateReferenceParams {
  resolution?: string;
  aspectRatio?: string;
  variations?: number;
}

export function generateFromReference(
  id: string,
  params: GenerateReferenceParams,
): Promise<{ generationId: string }> {
  return fetchJson<{ generationId: string }>(`/api/ad-references/${id}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}
