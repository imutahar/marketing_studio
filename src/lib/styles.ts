import { PREVIEW_VIDEOS } from "./media";

/** A video ad style shown in the Url-to-Ad "choose a style" step. */
export interface AdStyle {
  id: string;
  /** Arabic label; also used as the videoType option fed to generation. */
  label: string;
  description: string;
  gradient: string;
  video?: string;
}

export const AD_STYLES: AdStyle[] = [
  { id: "ugc", label: "UGC", description: "محتوى واقعي لوسائل التواصل", gradient: "from-rose-300 to-pink-400", video: PREVIEW_VIDEOS.influencer },
  { id: "tutorial", label: "شرح", description: "شرح خطوة بخطوة", gradient: "from-teal-300 to-cyan-400", video: PREVIEW_VIDEOS.explainer },
  { id: "unboxing", label: "فتح العلبة", description: "فتح علبة احترافي", gradient: "from-rose-400 to-red-500", video: PREVIEW_VIDEOS.unboxing },
  { id: "hyper", label: "حركة سريعة", description: "إبراز المنتج بحركة سريعة", gradient: "from-lime-400 to-emerald-600", video: PREVIEW_VIDEOS.fast },
  { id: "review", label: "مراجعة", description: "مراجعة حقيقية للمنتج", gradient: "from-amber-300 to-orange-500", video: PREVIEW_VIDEOS.tv },
  { id: "tv", label: "إعلان تلفزيوني", description: "قصص مؤثرة ومضخّمة", gradient: "from-amber-900 to-neutral-900" },
  { id: "wild", label: "إبداعي", description: "فيديو فريد ومبتكر", gradient: "from-fuchsia-400 to-violet-600" },
  { id: "ugc-tryon", label: "تجربة افتراضية", description: "جرّب قبل الشراء", gradient: "from-sky-300 to-blue-500" },
  { id: "pro-tryon", label: "تجربة احترافية", description: "تجربة افتراضية متقدمة", gradient: "from-slate-400 to-slate-700" },
];
