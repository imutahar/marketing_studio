import type {
  AttachmentSlot,
  MockProduct,
  Preset,
  Project,
  StudioMode,
  ToolItem,
} from "./types";
import { PREVIEW_VIDEOS } from "./media";

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
    video: PREVIEW_VIDEOS.tv,
  },
  {
    id: "fast-motion",
    label: "حركة سريعة",
    mode: "video",
    promptScaffold: "لقطة بحركة كاميرا سريعة (crash zoom) حول المنتج بخلفية حيوية.",
    gradient: "from-lime-400 via-green-500 to-emerald-700",
    video: PREVIEW_VIDEOS.fast,
  },
  {
    id: "unboxing",
    label: "فتح العلبة",
    mode: "video",
    promptScaffold: "مشهد فتح علبة المنتج بأيدٍ أنيقة وإضاءة ناعمة وتركيز على التفاصيل.",
    gradient: "from-rose-500 via-red-500 to-rose-700",
    video: PREVIEW_VIDEOS.unboxing,
  },
  {
    id: "influencers",
    label: "مؤثرين",
    mode: "video",
    promptScaffold: "مؤثر يستعرض المنتج بأسلوب UGC طبيعي أمام الكاميرا مع تعليق صوتي.",
    gradient: "from-slate-300 via-slate-400 to-slate-600",
    video: PREVIEW_VIDEOS.influencer,
  },
  {
    id: "explainer",
    label: "شرح",
    mode: "video",
    promptScaffold: "فيديو توضيحي يشرح مميزات المنتج خطوة بخطوة بأسلوب بسيط وجذاب.",
    gradient: "from-teal-300 via-cyan-400 to-sky-500",
    video: PREVIEW_VIDEOS.explainer,
  },
];

/** Saved projects shown in the sidebar (المشاريع). */
export const PROJECTS: Project[] = [
  { id: "shower-gel", name: "شاور جل", color: "text-emerald-500" },
  { id: "shampoo", name: "شامبو", color: "text-amber-500" },
  { id: "travel-bag", name: "شنطة سفر", color: "text-sky-500" },
];

/** Tools shown in the sidebar (أدوات). Ordered: URL→ad, reference ad, MCP. */
export const TOOLS: ToolItem[] = [
  { id: "url-to-ad", label: "من رابط إلى إعلان", icon: "link" },
  { id: "reference-ad", label: "إعلان مرجعي", icon: "sparkles", badge: "new" },
  { id: "mcp", label: "إتصال MCP", icon: "plug", badge: "soon", disabled: true },
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
