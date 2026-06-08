/** Backend base URL. Override with NEXT_PUBLIC_API_URL; defaults to local dev. */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** localStorage key for the shared access password (sent as x-app-password). */
const APP_PASSWORD_KEY = "ms.appPassword";

/** Read the stored shared password, or null. SSR-safe. */
export function getAppPassword(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(APP_PASSWORD_KEY);
}

/** Persist the shared password for subsequent requests. SSR-safe. */
export function setAppPassword(password: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(APP_PASSWORD_KEY, password);
}

/** Remove the stored shared password. SSR-safe. */
export function clearAppPassword(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(APP_PASSWORD_KEY);
}

/** Merge the x-app-password header into init.headers without clobbering others. */
function withAppPasswordHeader(init?: RequestInit): RequestInit | undefined {
  const password = getAppPassword();
  if (!password) return init;
  const headers = new Headers(init?.headers);
  headers.set("x-app-password", password);
  return { ...init, headers };
}

/** Fetch JSON from the backend, throwing a readable error on non-2xx. */
export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, withAppPasswordHeader(init));
  if (!res.ok) {
    // A 401 means the stored password is missing/wrong — drop it so the next
    // app load re-prompts via the access gate (which re-probes on mount).
    if (res.status === 401) clearAppPassword();
    const detail = await res.text().catch(() => "");
    throw new Error(`Backend ${res.status}: ${detail || res.statusText}`);
  }
  // 204 No Content or an empty body (e.g. DELETE) — nothing to parse.
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
