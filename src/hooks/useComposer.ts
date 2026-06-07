"use client";

import { useCallback, useMemo, useState } from "react";
import { attachmentsForMode } from "@/lib/mock";
import { toolbarSelectsForMode } from "@/lib/toolbar";
import type {
  AttachmentValue,
  GenerationRequest,
  Preset,
  StudioMode,
} from "@/lib/types";

export interface AdvancedSettings {
  negativePrompt: string;
  /** Numeric string ("" = random). */
  seed: string;
  cameraFixed: boolean;
  /** Video only: generate synced audio (voice/SFX/music). Default off. */
  generateAudio: boolean;
}

const DEFAULT_SETTINGS: AdvancedSettings = {
  negativePrompt: "",
  seed: "",
  cameraFixed: false,
  generateAudio: false,
};

/** Default selected value for each toolbar selector in a mode. */
function defaultSelections(mode: StudioMode): Record<string, string> {
  const out: Record<string, string> = {};
  for (const select of toolbarSelectsForMode(mode)) {
    if (select.defaultValue) out[select.id] = select.defaultValue;
  }
  return out;
}

/**
 * Single source of truth for the composer: mode, prompt, toolbar selector
 * values, and attachments. `buildRequest()` produces the exact payload a
 * generation backend will consume.
 */
export function useComposer(initialMode: StudioMode = "video") {
  const [mode, setMode] = useState<StudioMode>(initialMode);
  const [prompt, setPrompt] = useState("");
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    defaultSelections(initialMode),
  );
  const [attachments, setAttachments] = useState<Record<string, AttachmentValue>>({});
  const [settings, setSettings] = useState<AdvancedSettings>(DEFAULT_SETTINGS);

  const slots = useMemo(() => attachmentsForMode(mode), [mode]);
  const selects = useMemo(() => toolbarSelectsForMode(mode), [mode]);

  const changeMode = useCallback((next: StudioMode) => {
    setMode(next);
    setSelections(defaultSelections(next)); // selectors differ per mode
  }, []);

  const setSelection = useCallback((id: string, value: string) => {
    setSelections((prev) => ({ ...prev, [id]: value }));
  }, []);

  const setAttachment = useCallback((slotId: string, value: AttachmentValue | null) => {
    setAttachments((prev) => {
      const next = { ...prev };
      if (value) next[slotId] = value;
      else delete next[slotId];
      return next;
    });
  }, []);

  /** Add an extra reference image (the ➕ button). */
  const addReferenceImage = useCallback((previewUrl: string, fileName: string) => {
    const id = `ref-${crypto.randomUUID().slice(0, 8)}`;
    setAttachments((prev) => ({
      ...prev,
      [id]: { slotId: id, kind: "image", fileName, previewUrl },
    }));
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setMode(preset.mode);
    setPrompt(preset.promptScaffold);
    setSelections(defaultSelections(preset.mode));
  }, []);

  /** Seed the composer from an extracted product (Url-to-Ad flow). */
  const applyProduct = useCallback(
    (product: {
      prompt: string;
      imageUrl: string;
      fileName?: string;
      selections?: Record<string, string>;
    }) => {
      setMode("video");
      setSelections({ ...defaultSelections("video"), ...(product.selections ?? {}) });
      setPrompt(product.prompt);
      setAttachments({
        product: {
          slotId: "product",
          kind: "product",
          fileName: product.fileName ?? "product",
          previewUrl: product.imageUrl,
        },
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setPrompt("");
    setSelections(defaultSelections(mode));
    setAttachments({});
    setSettings(DEFAULT_SETTINGS);
  }, [mode]);

  const buildRequest = useCallback((): GenerationRequest => {
    const seedNum = Number.parseInt(settings.seed, 10);
    return {
      mode,
      prompt: prompt.trim(),
      options: Object.values(selections),
      attachments: Object.values(attachments),
      negativePrompt: settings.negativePrompt.trim() || undefined,
      seed: Number.isFinite(seedNum) ? seedNum : undefined,
      cameraFixed: mode === "video" && settings.cameraFixed ? true : undefined,
      generateAudio: mode === "video" && settings.generateAudio ? true : undefined,
    };
  }, [mode, prompt, selections, attachments, settings]);

  const canSubmit = prompt.trim().length > 0;

  return {
    // state
    mode,
    prompt,
    slots,
    selects,
    selections,
    attachments,
    settings,
    canSubmit,
    // actions
    setPrompt,
    changeMode,
    setSelection,
    setAttachment,
    addReferenceImage,
    setSettings,
    applyPreset,
    applyProduct,
    reset,
    buildRequest,
  };
}

export type ComposerController = ReturnType<typeof useComposer>;
