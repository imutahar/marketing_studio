import { PREVIEW_VIDEOS } from "./media";

export interface ReferenceVideo {
  id: string;
  title: string;
  video: string;
}

/** Mock "Uploads" library for the reference-video picker. */
export const REFERENCE_UPLOADS: ReferenceVideo[] = [
  { id: "u1", title: "إعلان UGC", video: PREVIEW_VIDEOS.influencer },
  { id: "u2", title: "فتح علبة", video: PREVIEW_VIDEOS.unboxing },
  { id: "u3", title: "شرح المنتج", video: PREVIEW_VIDEOS.explainer },
  { id: "u4", title: "إعلان تلفزيوني", video: PREVIEW_VIDEOS.tv },
  { id: "u5", title: "حركة سريعة", video: PREVIEW_VIDEOS.fast },
];

/** Mock "Video Generations" library. */
export const REFERENCE_GENERATIONS: ReferenceVideo[] = [
  { id: "g1", title: "إنشاء ١", video: PREVIEW_VIDEOS.fast },
  { id: "g2", title: "إنشاء ٢", video: PREVIEW_VIDEOS.tv },
  { id: "g3", title: "إنشاء ٣", video: PREVIEW_VIDEOS.unboxing },
  { id: "g4", title: "إنشاء ٤", video: PREVIEW_VIDEOS.influencer },
];
