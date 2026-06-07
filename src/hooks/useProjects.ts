"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  type Project,
  type ProjectInput,
} from "@/lib/api/projects";

const ACTIVE_KEY = "activeProjectId";

/** Manages the project list + the active project (persisted in localStorage). */
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setProjects(await getProjects());
    } catch {
      // keep last known
    }
  }, []);

  useEffect(() => {
    let active = true;
    getProjects()
      .then((list) => {
        if (!active) return;
        setProjects(list);
        const stored =
          typeof localStorage !== "undefined"
            ? localStorage.getItem(ACTIVE_KEY)
            : null;
        const valid = list.find((p) => p.id === stored)?.id ?? list[0]?.id ?? null;
        setActiveId(valid);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const setActive = useCallback((id: string) => {
    setActiveId(id);
    localStorage.setItem(ACTIVE_KEY, id);
  }, []);

  const create = useCallback(
    async (body: ProjectInput) => {
      const project = await createProject(body);
      await refresh();
      setActive(project.id);
      return project;
    },
    [refresh, setActive],
  );

  const update = useCallback(
    async (id: string, patch: Partial<ProjectInput>) => {
      await updateProject(id, patch);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== id);
      setActiveId((cur) => (cur === id ? (next[0]?.id ?? null) : cur));
      return next;
    });
  }, []);

  const activeProject = projects.find((p) => p.id === activeId) ?? null;

  return { projects, activeId, activeProject, setActive, create, update, remove, refresh };
}
