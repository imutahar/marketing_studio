// Client-side image helpers. We downscale uploaded images and encode them as
// base64 data URIs so they can travel in the generation request (a data URI
// works even when the backend isn't publicly reachable, unlike a local URL).

const DEFAULT_MAX_DIM = 1280;
const DEFAULT_QUALITY = 0.9;

/**
 * Read a File, downscale it so its longest edge ≤ maxDim, and return a JPEG
 * data URI. Small images are returned as-is.
 */
export async function fileToDownscaledDataUrl(
  file: File,
  maxDim = DEFAULT_MAX_DIM,
  quality = DEFAULT_QUALITY,
): Promise<string> {
  const original = await readAsDataUrl(file);
  const img = await loadImage(original);

  const longest = Math.max(img.width, img.height);
  const scale = Math.min(1, maxDim / longest);
  if (scale === 1) return original;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) return original;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", quality);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image decode failed"));
    img.src = src;
  });
}
