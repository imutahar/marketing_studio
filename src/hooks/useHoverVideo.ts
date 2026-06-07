"use client";

import { useRef } from "react";

/**
 * Plays a video on hover and pauses/rewinds on leave — so preview clips don't
 * all stream at once on load. Spread `hoverHandlers` on the hovered element and
 * attach `videoRef` to the <video>.
 */
export function useHoverVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const hoverHandlers = {
    onMouseEnter: () => {
      videoRef.current?.play().catch(() => {});
    },
    onMouseLeave: () => {
      const v = videoRef.current;
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
    },
  };

  return { videoRef, hoverHandlers };
}
