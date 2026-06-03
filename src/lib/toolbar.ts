import {
  Clock,
  Monitor,
  RectangleVertical,
  Film,
  Share2,
  Image as ImageIcon,
  Languages,
  type LucideIcon,
} from "lucide-react";
import type { StudioMode } from "./types";

/** A dropdown selector shown in the composer toolbar. */
export interface ToolbarSelectConfig {
  id: string;
  icon: LucideIcon;
  /** Shown when nothing is selected (e.g. "نوع الفيديو"). */
  placeholder: string;
  options: string[];
  defaultValue?: string;
}

const VIDEO_SELECTS: ToolbarSelectConfig[] = [
  { id: "duration", icon: Clock, placeholder: "المدة", options: ["5 ث", "10 ث", "12 ث"], defaultValue: "12 ث" },
  { id: "resolution", icon: Monitor, placeholder: "الدقة", options: ["480p", "720p", "1080p"], defaultValue: "720p" },
  { id: "ratio", icon: RectangleVertical, placeholder: "الأبعاد", options: ["9:16", "1:1", "16:9"], defaultValue: "9:16" },
  { id: "videoType", icon: Film, placeholder: "نوع الفيديو", options: ["تلقائي", "سينمائي", "UGC", "عرض منتج"] },
];

const IMAGE_SELECTS: ToolbarSelectConfig[] = [
  { id: "platform", icon: Share2, placeholder: "منصة إجتماعية", options: ["انستجرام", "تيك توك", "سناب شات", "فيسبوك", "اكس"] },
  { id: "format", icon: ImageIcon, placeholder: "صورة انستجرام", options: ["صورة انستجرام", "ستوري انستجرام", "منشور فيسبوك", "بنر إعلاني"] },
  { id: "language", icon: Languages, placeholder: "نص عربي", options: ["نص عربي", "نص إنجليزي"] },
];

/** Toolbar selectors differ by mode (matches the two Figma frames). */
export function toolbarSelectsForMode(mode: StudioMode): ToolbarSelectConfig[] {
  return mode === "video" ? VIDEO_SELECTS : IMAGE_SELECTS;
}
