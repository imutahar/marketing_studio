import { fetchJson } from "./client";
import type { Generation } from "@/lib/types";

export type BrandAssetKind = "logo" | "guideline" | "sheet" | "reference";

export interface BrandAsset {
  id: string;
  kind: BrandAssetKind;
  name: string;
  url: string;
}

/** Lean list item. */
export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  generationCount: number;
  thumbnail?: string;
  hasInstructions: boolean;
  brandAssetCount: number;
}

/** Full project (brand kit) for editing/generation context. */
export interface ProjectDetail {
  id: string;
  name: string;
  instructions?: string;
  brandAssets: BrandAsset[];
  generationCount: number;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInput {
  name: string;
  instructions?: string;
  brandAssets?: BrandAsset[];
}

export function getProjects(): Promise<Project[]> {
  return fetchJson<Project[]>("/api/projects");
}

export function getProject(id: string): Promise<ProjectDetail> {
  return fetchJson<ProjectDetail>(`/api/projects/${id}`);
}

export function createProject(body: ProjectInput): Promise<ProjectDetail> {
  return fetchJson<ProjectDetail>("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function updateProject(id: string, patch: Partial<ProjectInput>): Promise<ProjectDetail> {
  return fetchJson<ProjectDetail>(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

export function deleteProject(id: string): Promise<void> {
  // Routed through fetchJson so it carries the x-app-password header (and 401
  // handling) like every other call. Backend returns 204 (no body).
  return fetchJson<void>(`/api/projects/${id}`, { method: "DELETE" });
}

export function getProjectGenerations(id: string): Promise<Generation[]> {
  return fetchJson<Generation[]>(`/api/projects/${id}/generations`);
}
