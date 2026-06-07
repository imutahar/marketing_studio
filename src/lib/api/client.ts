/** Backend base URL. Override with NEXT_PUBLIC_API_URL; defaults to local dev. */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** Fetch JSON from the backend, throwing a readable error on non-2xx. */
export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Backend ${res.status}: ${detail || res.statusText}`);
  }
  return (await res.json()) as T;
}
