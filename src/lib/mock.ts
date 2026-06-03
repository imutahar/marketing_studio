import type {
  AttachmentSlot,
  MockProduct,
  Preset,
  Project,
  StudioMode,
  ToolItem,
} from "./types";

/** Monthly usage quota (the 25% wheel in the sidebar). */
export const MONTHLY_USAGE_PERCENT = 25;

/** Preset gallery cards — the primary "start here" entry points. */
export const PRESETS: Preset[] = [
  {
    id: "tv-ad",
    label: "إعلان تلفزيوني",
    mode: "video",
    promptScaffold: "إعلان تلفزيوني سينمائي يبرز المنتج بإضاءة احترافية ولقطات واسعة.",
    gradient: "from-amber-900 via-stone-800 to-neutral-900",
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_3CIjqzTsrKEUr8OzFBaYO4ux3nG/hf_20260413_121933_7dfa9582-a536-4a83-9041-ee5aa102ff8c.mp4",
  },
  {
    id: "fast-motion",
    label: "حركة سريعة",
    mode: "video",
    promptScaffold: "لقطة بحركة كاميرا سريعة (crash zoom) حول المنتج بخلفية حيوية.",
    gradient: "from-lime-400 via-green-500 to-emerald-700",
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_34hPp7fXOu4gkTrKKk2ESqFSfG1/hf_20260413_124545_9ae0acdc-4d0e-4c03-a065-b572bf9c66cf.mp4",
  },
  {
    id: "unboxing",
    label: "فتح العلبة",
    mode: "video",
    promptScaffold: "مشهد فتح علبة المنتج بأيدٍ أنيقة وإضاءة ناعمة وتركيز على التفاصيل.",
    gradient: "from-rose-500 via-red-500 to-rose-700",
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/hf_20260414_230955_d7382d46-8c96-4e25-8a5f-1785ed64b886.mp4",
  },
  {
    id: "influencers",
    label: "مؤثرين",
    mode: "video",
    promptScaffold: "مؤثر يستعرض المنتج بأسلوب UGC طبيعي أمام الكاميرا مع تعليق صوتي.",
    gradient: "from-slate-300 via-slate-400 to-slate-600",
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_3BtuMjeO56IlCCzTiD419c4NiyM/hf_20260415_011357_9dd4f822-d35c-4a43-9102-61ad0bb14331.mp4",
  },
  {
    id: "explainer",
    label: "شرح",
    mode: "video",
    promptScaffold: "فيديو توضيحي يشرح مميزات المنتج خطوة بخطوة بأسلوب بسيط وجذاب.",
    gradient: "from-teal-300 via-cyan-400 to-sky-500",
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_3Bu8kApHUBmQcoBNUYoyCcOGJne/hf_20260414_232148_e856f696-c60e-4c40-921e-3fc3ac60224f.mp4",
  },
];

/** Saved projects shown in the sidebar (المشاريع). */
export const PROJECTS: Project[] = [
  { id: "shower-gel", name: "شاور جل" },
  { id: "shampoo", name: "شامبو" },
  { id: "travel-bag", name: "شنطة سفر" },
];

/** Tools shown in the sidebar (أدوات). */
export const TOOLS: ToolItem[] = [
  { id: "url-to-ad", label: "من رابط إلى إعلان", icon: "link" },
  { id: "mcp", label: "إتصال MCP", icon: "plug" },
  { id: "reference-ad", label: "إعلان مرجعي", icon: "sparkles", isNew: true },
];

/** Sample store products for the (mocked) product picker. */
export const MOCK_PRODUCTS: MockProduct[] = [
  { id: "p1", name: "شاور جل بالألوفيرا", price: "٣٥ ر.س", gradient: "from-emerald-200 to-teal-300" },
  { id: "p2", name: "شامبو طبيعي", price: "٤٢ ر.س", gradient: "from-amber-200 to-orange-300" },
  { id: "p3", name: "شنطة سفر مقاومة للماء", price: "١٩٩ ر.س", gradient: "from-slate-200 to-slate-400" },
  { id: "p4", name: "عطر فاخر", price: "٢٨٠ ر.س", gradient: "from-rose-200 to-pink-300" },
];

/**
 * Attachment slots differ by mode (matches the two Figma frames). Product is
 * required and sits first so it renders on the right (nearest the prompt).
 */
export function attachmentsForMode(mode: StudioMode): AttachmentSlot[] {
  if (mode === "video") {
    return [
      { id: "product", kind: "product", label: "المنتج", required: true },
      { id: "character", kind: "character", label: "الشخصية" },
    ];
  }
  // Image mode: required product + an images slot.
  return [
    { id: "product", kind: "product", label: "المنتج", required: true },
    { id: "image", kind: "image", label: "صور" },
  ];
}
