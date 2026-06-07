import {
  Clock,
  Monitor,
  RectangleVertical,
  Film,
  Type,
  Crop,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import type { StudioMode } from "./types";
import { PREVIEW_VIDEOS } from "./media";

interface BaseSelect {
  id: string;
  icon: LucideIcon;
  /** Shown when nothing is selected (e.g. "نوع الفيديو"). */
  placeholder: string;
  defaultValue?: string;
}

/** A list dropdown (resolution, ratio, language, …). */
export interface DropdownSelect extends BaseSelect {
  control: "dropdown";
  options: string[];
}

/** A numeric slider (duration). Value is stored as "{n} {unit}". */
export interface SliderSelect extends BaseSelect {
  control: "slider";
  min: number;
  max: number;
  step?: number;
  unit: string;
}

export interface SheetCard {
  id: string;
  label: string;
  gradient: string;
  video?: string;
}

/** A modal "popup sheet" with a card grid (نوع الفيديو). */
export interface SheetSelect extends BaseSelect {
  control: "sheet";
  title: string;
  subtitle: string;
  cards: SheetCard[];
}

export type ToolbarSelectConfig = DropdownSelect | SliderSelect | SheetSelect;

const VIDEO_TYPE_CARDS: SheetCard[] = [
  { id: "unboxing", label: "فتح علبة", gradient: "from-rose-500 via-red-500 to-rose-700", video: PREVIEW_VIDEOS.unboxing },
  { id: "explainer", label: "شرح", gradient: "from-teal-300 via-cyan-400 to-sky-500", video: PREVIEW_VIDEOS.explainer },
  { id: "influencer", label: "محتوى مؤثرين", gradient: "from-slate-300 via-slate-400 to-slate-600", video: PREVIEW_VIDEOS.influencer },
  { id: "review", label: "مراجعة", gradient: "from-amber-200 via-orange-300 to-amber-400" },
  { id: "tv", label: "إعلان تلفزيوني", gradient: "from-amber-900 via-stone-800 to-neutral-900", video: PREVIEW_VIDEOS.tv },
  { id: "fast", label: "حركة سريعة", gradient: "from-lime-400 via-green-500 to-emerald-700", video: PREVIEW_VIDEOS.fast },
];

const VIDEO_SELECTS: ToolbarSelectConfig[] = [
  { id: "duration", control: "slider", icon: Clock, placeholder: "المدة", min: 6, max: 12, step: 1, unit: "ث", defaultValue: "12 ث" },
  { id: "resolution", control: "dropdown", icon: Monitor, placeholder: "الدقة", options: ["480p", "720p", "1080p"], defaultValue: "1080p" },
  { id: "ratio", control: "dropdown", icon: RectangleVertical, placeholder: "الأبعاد", options: ["9:16", "16:9", "1:1", "4:3", "3:4", "2:1"], defaultValue: "9:16" },
  {
    id: "videoType",
    control: "sheet",
    icon: Film,
    placeholder: "نوع الفيديو",
    title: "اختر نوع الفيديو",
    subtitle: "اختر صيغة الفيديو الأنسب للإعلان.",
    cards: VIDEO_TYPE_CARDS,
  },
];

const IMAGE_SELECTS: ToolbarSelectConfig[] = [
  { id: "language", control: "dropdown", icon: Type, placeholder: "نص عربي", options: ["نص عربي", "نص إنجليزي"], defaultValue: "نص عربي" },
  { id: "format", control: "dropdown", icon: Crop, placeholder: "صورة انستجرام", options: ["صورة انستجرام", "ستوري انستجرام", "منشور فيسبوك", "بنر إعلاني"], defaultValue: "صورة انستجرام" },
  { id: "imageType", control: "dropdown", icon: ImageIcon, placeholder: "نوع الصورة", options: ["تلقائي", "واقعي", "ثلاثي الأبعاد", "رسومي"] },
];

/** Toolbar selectors differ by mode (matches the two Figma frames). */
export function toolbarSelectsForMode(mode: StudioMode): ToolbarSelectConfig[] {
  return mode === "video" ? VIDEO_SELECTS : IMAGE_SELECTS;
}
