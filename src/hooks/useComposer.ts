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
  }, [mode]);

  const buildRequest = useCallback(
    (): GenerationRequest => ({
      mode,
      prompt: prompt.trim(),
      options: Object.values(selections),
      attachments: Object.values(attachments),
    }),
    [mode, prompt, selections, attachments],
  );

  const canSubmit = prompt.trim().length > 0;

  return {
    // state
    mode,
    prompt,
    slots,
    selects,
    selections,
    attachments,
    canSubmit,
    // actions
    setPrompt,
    changeMode,
    setSelection,
    setAttachment,
    applyPreset,
    applyProduct,
    reset,
    buildRequest,
  };
}

export type ComposerController = ReturnType<typeof useComposer>;
