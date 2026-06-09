"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { attachmentsForMode } from "@/lib/mock";
import { toolbarSelectsForMode } from "@/lib/toolbar";
import type {
  AttachmentValue,
  GenerationRequest,
  Preset,
  StudioMode,
} from "@/lib/types";

export interface AdvancedSettings {
  /** Comma-joined "things to avoid" terms (from the avoid chips). */
  negativePrompt: string;
  cameraFixed: boolean;
  /** Video only: generate synced audio (voice/SFX/music). Default off. */
  generateAudio: boolean;
  /** Video only: generate a cheap 480p draft preview first. Remembered preference. */
  draft: boolean;
}

const DEFAULT_SETTINGS: AdvancedSettings = {
  negativePrompt: "",
  cameraFixed: false,
  generateAudio: false,
  draft: false,
};

/** localStorage key for the remembered "draft mode" preference. */
const DRAFT_PREF_KEY = "ms.draftMode";

/** Read the persisted draft-mode preference (SSR-safe). */
function readDraftPref(): boolean {
  if (typeof window === "undefined") return DEFAULT_SETTINGS.draft;
  try {
    return window.localStorage.getItem(DRAFT_PREF_KEY) === "1";
  } catch {
    return DEFAULT_SETTINGS.draft;
  }
}

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
  const [settings, setSettings] = useState<AdvancedSettings>(() => ({
    ...DEFAULT_SETTINGS,
    draft: readDraftPref(),
  }));

  // Persist the draft-mode preference whenever it changes (SSR-safe).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(DRAFT_PREF_KEY, settings.draft ? "1" : "0");
    } catch {
      // ignore quota / privacy-mode failures
    }
  }, [settings.draft]);

  const slots = useMemo(() => attachmentsForMode(mode), [mode]);
  const selects = useMemo(() => toolbarSelectsForMode(mode), [mode]);

  const changeMode = useCallback((next: StudioMode) => {
    setMode(next);
    setSelections(defaultSelections(next)); // selectors differ per mode
    // Slot sets differ per mode, so drop fixed-slot attachments that don't
    // belong to the next mode (e.g. a "character" carried over into image mode
    // would be invisible, un-removable, and shipped as a wrong-kind payload).
    // Keep extra references (ref-*) and any slot valid for the next mode.
    const validSlotIds = new Set(attachmentsForMode(next).map((s) => s.id));
    setAttachments((prev) => {
      const next: Record<string, AttachmentValue> = {};
      for (const [id, value] of Object.entries(prev)) {
        if (id.startsWith("ref-") || validSlotIds.has(id)) next[id] = value;
      }
      return next;
    });
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
    setAttachments((prev) => {
      // Dedupe: selecting the same media-library item twice shouldn't add a
      // duplicate attachment. Match on previewUrl (the stable identity here).
      if (Object.values(prev).some((a) => a.previewUrl === previewUrl)) return prev;
      const id = `ref-${crypto.randomUUID().slice(0, 8)}`;
      return {
        ...prev,
        [id]: { slotId: id, kind: "image", fileName, previewUrl },
      };
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
    // Keep the remembered draft-mode preference across resets.
    setSettings((prev) => ({ ...DEFAULT_SETTINGS, draft: prev.draft }));
  }, [mode]);

  const buildRequest = useCallback((): GenerationRequest => {
    return {
      mode,
      prompt: prompt.trim(),
      options: selections,
      attachments: Object.values(attachments),
      negativePrompt: settings.negativePrompt.trim() || undefined,
      cameraFixed: mode === "video" && settings.cameraFixed ? true : undefined,
      generateAudio: mode === "video" && settings.generateAudio ? true : undefined,
      draft: mode === "video" && settings.draft ? true : undefined,
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
