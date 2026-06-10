// Store products for the "اختر منتج" picker + the @-mention.
//
// These are REAL products from the merchant's Salla store (سينز / Senz),
// snapshotted for the testing phase so demos use real catalog data + real
// product imagery (Salla CDN URLs are publicly reachable, which also makes them
// good generation references). Replace `getStoreProducts` with a live backend
// call (GET /api/products backed by Salla OAuth) before launch — the shape
// stays the same, so nothing downstream changes.

export interface StoreProduct {
  id: string;
  name: string;
  price: string;
  currency: string;
  image: string;
  category: string;
}

export const PRODUCT_CATEGORIES = [
  "الكل",
  "بكجات العناية للرجال",
  "العناية الحميمة للرجال",
  "شاور جل للرجال",
  "إكسسوارات العناية",
] as const;

const SAR = "ر.س";

const PRODUCTS: StoreProduct[] = [
  { id: "1407343965", name: "مجموعة العناية القصوى للرجال - 11 قطعة | سينز", price: "339", currency: SAR, image: "https://cdn.salla.sa/EZoaVB/products/bvhZthWxgyyUx8btODwSFw2z2ZeJSWYJaT8bCoY2.png", category: "بكجات العناية للرجال" },
  { id: "1970505658", name: "مجموعة سيقنتشر دافئ - بكج عناية رجالي مع شنطة | سينز", price: "222", currency: SAR, image: "https://cdn.salla.sa/EZoaVB/169600fa-e42b-4e6e-b258-a482375f184d-500x500-J44ZDmyrFzmVCA3mqWpwbe3mcXI7QA8lUmFRHFtl.jpg", category: "بكجات العناية للرجال" },
  { id: "125712889", name: "مجموعة سيقنتشر منعش - بكج عناية رجالي مع شنطة | سينز", price: "222", currency: SAR, image: "https://cdn.salla.sa/EZoaVB/5b30261d-bf6a-4d7c-b89d-535cf8726825-500x500-1ZPflQS00jXveEtw8OFR1XMYkPhU2skg3fWDwRkH.jpg", category: "بكجات العناية للرجال" },
  { id: "1772613906", name: "بكج طقوس دافئ - روتين عناية للرجل | سينز", price: "199", currency: SAR, image: "https://cdn.salla.sa/EZoaVB/c3089667-63d6-40f2-91d1-822931e40e5b-500x500-CEA4CpqiKWVXjXFDRyRAidVIQodc5QxYfQI9uuxQ.png", category: "بكجات العناية للرجال" },
  { id: "560662406", name: "بكج طقوس منعش - روتين عناية وانتعاش يومي | سينز", price: "199", currency: SAR, image: "https://cdn.salla.sa/EZoaVB/55030afa-4597-4868-a21d-6b864db231e5-500x500-YiygAJ5xoBWVoa3hNuIgUrlkk5nYFMgC7T64ikA3.png", category: "بكجات العناية للرجال" },
  { id: "418624179", name: "باقة النخبة دافئ - بكج عناية رجالي | سينز", price: "145", currency: SAR, image: "https://cdn.salla.sa/EZoaVB/f5eb4edf-81f7-4d09-9a80-74f34362dad1-500x500-A2ljr7Gq1yzl74ZhjzL5HHf2rHuMzBme79knBieX.png", category: "بكجات العناية للرجال" },
  { id: "822562440", name: "باقة النخبة منعش - بكج عناية رجالي | سينز", price: "145", currency: SAR, image: "https://cdn.salla.sa/EZoaVB/e72b3870-d9dd-4961-b16c-4c429c34de3c-500x500-cdEL3nNxRzaJZRauUFD628AsmSr81P4le3kP7lvm.png", category: "بكجات العناية للرجال" },
  { id: "530449946", name: "حقيبة العناية والسفر - مقاومة للماء | سينز", price: "55", currency: SAR, image: "https://cdn.salla.sa/EZoaVB/68a56166-be6c-40e9-a9ad-76fb3772e5e5-500x500-tZrwRGaVNQFqqAUDvmzuD8oiCMjrjHrgDCkJSwuu.png", category: "إكسسوارات العناية" },
  { id: "1717711313", name: "منشفة العناية بامبو للمناطق الحساسة | سينز", price: "55", currency: SAR, image: "https://cdn.salla.sa/EZoaVB/ba7dc4e8-57dc-42d7-8b93-f4e380de4f91-500x500-gRcAsofxPguvjjTznbk0DHVH7cXTidbsK7AXHtxI.png", category: "العناية الحميمة للرجال" },
  { id: "353449111", name: "ليفة سوفت تاتش للجسم - تقشير لطيف | سينز", price: "52", currency: SAR, image: "https://cdn.salla.sa/EZoaVB/283c4c08-417c-407a-938d-368fcc5d45f4-500x500-DU9JWYDKP9SpQKGYQBNeBagwPZ2dGvyIgFRfA9px.png", category: "شاور جل للرجال" },
  { id: "453790250", name: "مناديل المناطق الحساسة للرجال - سيف تاتش | سينز", price: "26", currency: SAR, image: "https://cdn.salla.sa/EZoaVB/6f013a31-08ef-4109-836c-96191521c6ca-500x500-uCRQ22yLBM9ck7Hg7FjxVt6elYM79uuFzp85D5aB.png", category: "العناية الحميمة للرجال" },
  { id: "1155989800", name: "شاور جل جولدن للرجال - بالعكبر وفيتامين E | سينز", price: "64", currency: SAR, image: "https://cdn.salla.sa/EZoaVB/591c13c2-07cc-4b2d-afb1-a63133705fb1-500x500-5IA0kHhYJAGQIpYl76xFzPw2d4P4EVWAXZ5KKvPg.png", category: "شاور جل للرجال" },
  { id: "745088538", name: "غسول المناطق الحساسة للرجال - وينترفيل | سينز", price: "52", currency: SAR, image: "https://cdn.salla.sa/EZoaVB/92a3e62d-4427-4519-b382-6ceb15719765-500x500-GYQJA1kOURgbO3QYlVFrbnBQccV59EmRQXkAtfEQ.png", category: "العناية الحميمة للرجال" },
  { id: "1727334408", name: "غسول المناطق الحساسة للرجال - اوريون | سينز", price: "52", currency: SAR, image: "https://cdn.salla.sa/EZoaVB/38908aac-9929-4e40-824c-2c22adc017c8-500x500-EonQM1wq89UqTVjt5lY77rUTzaTX3GsTniZrKKnN.png", category: "العناية الحميمة للرجال" },
  { id: "679185583", name: "شاور جل بريز للرجال - منعش بالمنثول | سينز", price: "64", currency: SAR, image: "https://cdn.salla.sa/EZoaVB/8dc68cb3-2821-4cca-a96e-738251d7b259-500x500-YEr5oAAmZ9HuTOJiXg6YNNFKhNcemS7qkjuM2jub.png", category: "شاور جل للرجال" },
];

export async function getStoreProducts(): Promise<StoreProduct[]> {
  return PRODUCTS;
}
