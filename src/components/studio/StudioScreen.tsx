"use client";

import { useEffect, useRef, useState } from "react";
import type { GenerationStatus, Preset, StudioMode } from "@/lib/types";
import { Sidebar } from "./Sidebar";
import { Hero } from "./Hero";
import { Composer } from "./Composer";
import { PresetGallery } from "./PresetGallery";
import { ResultPanel } from "./ResultPanel";

export function StudioScreen() {
  const [mode, setMode] = useState<StudioMode>("video");
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function handleSubmit() {
    if (!prompt.trim() || status === "generating") return;
    setStatus("generating");
    // Mock generation latency — no backend yet.
    timer.current = setTimeout(() => setStatus("result"), 2500);
  }

  function handlePickPreset(preset: Preset) {
    setMode(preset.mode);
    setPrompt(preset.promptScaffold);
    setStatus("idle");
  }

  function handleReset() {
    setStatus("idle");
    setPrompt("");
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
            mode={mode}
            onModeChange={setMode}
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={handleSubmit}
            isGenerating={status === "generating"}
          />

          <div className="w-full pt-2">
            {status === "idle" ? (
              <PresetGallery onPick={handlePickPreset} />
            ) : (
              <ResultPanel status={status} mode={mode} prompt={prompt} onReset={handleReset} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
