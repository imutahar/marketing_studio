// Store products for the "اختر منتج" picker.
//
// MVP: mocked. Swap `getStoreProducts` for a backend call (e.g. GET
// /api/products backed by the Salla catalog) later — the shape stays the same.

export interface StoreProduct {
  id: string;
  name: string;
  price: string;
  currency: string;
  image: string;
  category: string;
}

export const PRODUCT_CATEGORIES = ["الكل", "العناية", "الجمال", "المنزل"] as const;

const img = (seed: string) => `https://picsum.photos/seed/${seed}/400/400`;

const PRODUCTS: StoreProduct[] = [
  { id: "p1", name: "غسول الألوفيرا", price: "35", currency: "ر.س", image: img("aloe"), category: "العناية" },
  { id: "p2", name: "شامبو طبيعي", price: "42", currency: "ر.س", image: img("shampoo"), category: "العناية" },
  { id: "p3", name: "كريم مرطب", price: "60", currency: "ر.س", image: img("cream"), category: "العناية" },
  { id: "p4", name: "عطر فاخر", price: "280", currency: "ر.س", image: img("perfume"), category: "الجمال" },
  { id: "p5", name: "سيروم فيتامين سي", price: "120", currency: "ر.س", image: img("serum"), category: "الجمال" },
  { id: "p6", name: "زيت الأرغان", price: "75", currency: "ر.س", image: img("argan"), category: "العناية" },
  { id: "p7", name: "ماسك الوجه", price: "48", currency: "ر.س", image: img("mask"), category: "الجمال" },
  { id: "p8", name: "غسول الجسم", price: "39", currency: "ر.س", image: img("bodywash"), category: "العناية" },
  { id: "p9", name: "بلسم الشعر", price: "45", currency: "ر.س", image: img("conditioner"), category: "العناية" },
  { id: "p10", name: "مزيل العرق", price: "29", currency: "ر.س", image: img("deo"), category: "العناية" },
  { id: "p11", name: "واقي الشمس", price: "89", currency: "ر.س", image: img("sunscreen"), category: "الجمال" },
  { id: "p12", name: "تونر منعش", price: "55", currency: "ر.س", image: img("toner"), category: "الجمال" },
  { id: "p13", name: "شمعة معطرة", price: "65", currency: "ر.س", image: img("candle"), category: "المنزل" },
  { id: "p14", name: "صابون طبيعي", price: "22", currency: "ر.س", image: img("soap"), category: "العناية" },
  { id: "p15", name: "بخاخ غرفة", price: "70", currency: "ر.س", image: img("roomspray"), category: "المنزل" },
  { id: "p16", name: "كريم اليدين", price: "33", currency: "ر.س", image: img("handcream"), category: "العناية" },
];

export async function getStoreProducts(): Promise<StoreProduct[]> {
  await new Promise((r) => setTimeout(r, 600)); // fake fetch latency
  return PRODUCTS;
}
