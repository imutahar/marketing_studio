/**
 * Reliably download a (possibly cross-origin) media URL. The HTML `download`
 * attribute is ignored for cross-origin links — the browser navigates/opens
 * instead — so fetch the bytes as a blob and save those. Falls back to opening
 * the URL in a new tab if the fetch is blocked (e.g. CORS).
 */
export async function downloadUrl(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener");
  }
}
