// Product extraction for the "Url to Ad" flow.
//
// MVP: mocked (no real scraping yet). Swap the body of `extractProduct` for a
// call to the backend `POST /api/extract` (JSON-LD + OpenGraph scraping) later
// — the ProductInfo shape stays the same.

export interface ProductInfo {
  title: string;
  description?: string;
  price?: string;
  image: string;
  sourceUrl: string;
}

export async function extractProduct(url: string): Promise<ProductInfo> {
  await new Promise((r) => setTimeout(r, 1200)); // fake scrape latency

  const clean = url
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\?.*$/, "")
    .replace(/\/+$/, "");
  const lastSegment = clean.split("/").filter(Boolean).pop() ?? "";
  const guessed = decodeURIComponent(lastSegment).replace(/[-_]+/g, " ").trim();
  const seed = encodeURIComponent(clean).slice(0, 24) || "product";

  return {
    title: guessed.length > 2 ? guessed : "منتج من المتجر",
    description: "منتج مميز من متجرك، جاهز للتحويل إلى إعلان فيديو.",
    price: "١٢٩ ر.س",
    image: `https://picsum.photos/seed/${seed}/640/640`,
    sourceUrl: url,
  };
}
