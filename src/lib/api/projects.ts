import { API_BASE, fetchJson } from "./client";
import type { Generation } from "@/lib/types";

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  generationCount: number;
  thumbnail?: string;
}

export function getProjects(): Promise<Project[]> {
  return fetchJson<Project[]>("/api/projects");
}

export function createProject(name: string): Promise<Project> {
  return fetchJson<Project>("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export function renameProject(id: string, name: string): Promise<Project> {
  return fetchJson<Project>(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Backend ${res.status}`);
}

export function getProjectGenerations(id: string): Promise<Generation[]> {
  return fetchJson<Generation[]>(`/api/projects/${id}/generations`);
}
