import { fetchJson } from "./client";

/** Product info as returned by the backend extractor. */
interface ExtractResponse {
  title: string;
  description?: string;
  price?: string;
  currency?: string;
  images: string[];
  sourceUrl: string;
}

/** Flattened shape the UI consumes (single primary image). */
export interface ProductInfo {
  title: string;
  description?: string;
  price?: string;
  image: string;
  sourceUrl: string;
}

const FALLBACK_IMAGE = "https://picsum.photos/seed/product/640/640";

/** Extract product details from a URL via the backend (JSON-LD + OpenGraph). */
export async function extractProduct(url: string): Promise<ProductInfo> {
  const res = await fetchJson<ExtractResponse>("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const price =
    res.price && res.currency ? `${res.price} ${res.currency}` : res.price;

  return {
    title: res.title,
    description: res.description,
    price,
    image: res.images[0] ?? FALLBACK_IMAGE,
    sourceUrl: res.sourceUrl,
  };
}
