"use client";

import { useEffect, useState } from "react";
import { useComposer } from "@/hooks/useComposer";
import { useGeneration } from "@/hooks/useGeneration";
import { useUsage } from "@/hooks/useUsage";
import type { Preset } from "@/lib/types";
import type { UrlToAdResult } from "./UrlToAdModal";
import { Sidebar } from "./Sidebar";
import { Hero } from "./Hero";
import { Composer } from "./Composer";
import { PresetGallery } from "./PresetGallery";
import { ResultPanel } from "./ResultPanel";
import { UrlToAdModal } from "./UrlToAdModal";

export function StudioScreen() {
  const composer = useComposer("video");
  const { status, result, error, start, reset: resetGeneration } = useGeneration();
  const { usage, refresh: refreshUsage } = useUsage();
  const [urlModalOpen, setUrlModalOpen] = useState(false);

  // A finished job consumes tokens — refresh the monthly usage.
  useEffect(() => {
    if (status === "result") void refreshUsage();
  }, [status, refreshUsage]);

  function handleToolSelect(id: string) {
    if (id === "url-to-ad") setUrlModalOpen(true);
  }

  function handleGenerateFromUrl({ product, style, duration, resolution }: UrlToAdResult) {
    // Use the scraped content (title + description) to seed a richer prompt.
    const base = `إعلان فيديو احترافي بأسلوب ${style.label} يبرز ${product.title}`;
    const description = product.description?.trim().slice(0, 220);
    const prompt = description ? `${base}. ${description}` : `${base}.`;
    const selections = { videoType: style.label, duration, resolution };
    // Reflect the choice in the composer UI...
    composer.applyProduct({ prompt, imageUrl: product.image, fileName: product.title, selections });
    setUrlModalOpen(false);
    // ...and kick off generation immediately (one-click).
    resetGeneration();
    start({
      mode: "video",
      prompt,
      options: Object.values(selections),
      attachments: [
        {
          slotId: "product",
          kind: "product",
          fileName: product.title,
          previewUrl: product.image,
        },
      ],
    });
  }

  function handleSubmit() {
    if (!composer.canSubmit || status === "generating") return;
    start(composer.buildRequest());
  }

  function handlePickPreset(preset: Preset) {
    resetGeneration();
    composer.applyPreset(preset);
  }

  function handleReset() {
    resetGeneration();
    composer.reset();
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-card">
      {/* Sidebar first in DOM → pinned to the right in RTL */}
      <Sidebar usage={usage} onToolSelect={handleToolSelect} />

      {/* Main canvas */}
      <main className="studio-backdrop relative flex-1 overflow-y-auto scroll-thin">
        <div className="mx-auto flex min-h-full max-w-[1210px] flex-col items-center gap-10 px-8 py-16">
          <Hero />

          <Composer
            composer={composer}
            onSubmit={handleSubmit}
            isGenerating={status === "generating"}
          />

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-2 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <div className="w-full pt-2">
            {status === "idle" ? (
              <PresetGallery onPick={handlePickPreset} />
            ) : (
              <ResultPanel
                status={status}
                mode={result?.request.mode ?? composer.mode}
                prompt={result?.request.prompt ?? composer.prompt}
                result={result}
                onReset={handleReset}
              />
            )}
          </div>
        </div>
      </main>

      <UrlToAdModal
        open={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
        onGenerate={handleGenerateFromUrl}
      />
    </div>
  );
}
