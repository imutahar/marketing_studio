"use client";

import { useCallback, useMemo, useState } from "react";
import { attachmentsForMode, toolbarOptionsForMode } from "@/lib/mock";
import type {
  AttachmentValue,
  GenerationRequest,
  Preset,
  StudioMode,
} from "@/lib/types";

/**
 * Single source of truth for the composer: mode, prompt, selected toolbar
 * options, and attachments. `buildRequest()` produces the exact payload a
 * generation backend will consume, so the data shape lives in one place.
 */
export function useComposer(initialMode: StudioMode = "video") {
  const [mode, setMode] = useState<StudioMode>(initialMode);
  const [prompt, setPrompt] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<Record<string, AttachmentValue>>({});

  const slots = useMemo(() => attachmentsForMode(mode), [mode]);
  const options = useMemo(() => toolbarOptionsForMode(mode), [mode]);

  const changeMode = useCallback((next: StudioMode) => {
    setMode(next);
    setSelectedOptions([]); // toolbar options differ per mode
  }, []);

  const toggleOption = useCallback((option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    );
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
    setSelectedOptions([]);
  }, []);

  const reset = useCallback(() => {
    setPrompt("");
    setSelectedOptions([]);
    setAttachments({});
  }, []);

  const buildRequest = useCallback(
    (): GenerationRequest => ({
      mode,
      prompt: prompt.trim(),
      options: selectedOptions,
      attachments: Object.values(attachments),
    }),
    [mode, prompt, selectedOptions, attachments],
  );

  const canSubmit = prompt.trim().length > 0;

  return {
    // state
    mode,
    prompt,
    slots,
    options,
    selectedOptions,
    attachments,
    canSubmit,
    // actions
    setPrompt,
    changeMode,
    toggleOption,
    setAttachment,
    applyPreset,
    reset,
    buildRequest,
  };
}

export type ComposerController = ReturnType<typeof useComposer>;
