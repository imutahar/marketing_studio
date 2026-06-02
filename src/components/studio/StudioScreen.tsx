"use client";

import { useComposer } from "@/hooks/useComposer";
import { useGeneration } from "@/hooks/useGeneration";
import type { Preset } from "@/lib/types";
import { Sidebar } from "./Sidebar";
import { Hero } from "./Hero";
import { Composer } from "./Composer";
import { PresetGallery } from "./PresetGallery";
import { ResultPanel } from "./ResultPanel";

export function StudioScreen() {
  const composer = useComposer("video");
  const { status, result, error, start, reset: resetGeneration } = useGeneration();

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
      <Sidebar />

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
    </div>
  );
}
