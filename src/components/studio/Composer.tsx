"use client";

import { useState } from "react";
import { ArrowUp, Eye, Plus, Images, Sparkles, Check, X, Loader2 } from "lucide-react";
import { useEnhance } from "@/hooks/useEnhance";
import type { ComposerController } from "@/hooks/useComposer";
import type { AttachmentSlot as Slot } from "@/lib/types";
import type { UsageSummary } from "@/lib/api/usage";
import { estimateCost, parseDurationSeconds, parseImageVariations } from "@/lib/cost";
import { Button } from "@/components/ui/Button";
import { AttachmentSlot } from "./AttachmentSlot";
import { ModeToggle } from "./ModeToggle";
import { ToolbarSelect } from "./ToolbarSelect";
import { ToolbarSlider } from "./ToolbarSlider";
import { ToolbarSheet } from "./ToolbarSheet";
import { ToolbarSettings } from "./ToolbarSettings";
import { CharacterModal } from "./CharacterModal";
import { ProductModal } from "./ProductModal";
import { MediaLibraryModal } from "./MediaLibraryModal";

interface ComposerProps {
  composer: ComposerController;
  onSubmit: () => void;
  /** Submit is blocked while a job is in flight OR a draft preview awaits approval. */
  isBusy: boolean;
  /** Monthly token quota; drives the live cost estimate. `null` while unknown. */
  usage: UsageSummary | null;
}

const MAX_REFS = 6;

export function Composer({ composer, onSubmit, isBusy, usage }: ComposerProps) {
  const {
    mode,
    prompt,
    slots,
    selects,
    selections,
    attachments,
    settings,
    canSubmit,
    setPrompt,
    changeMode,
    setSelection,
    setAttachment,
    addReferenceImage,
    setSettings,
  } = composer;

  const [characterOpen, setCharacterOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  // ✨ Prompt enhancer. Hidden unless the backend has an LLM key configured.
  const { available: enhanceAvailable, enhancing, suggestion, error: enhanceError, enhance, dismiss } = useEnhance();
  // Enhance needs something to work with: typed text or an attached product.
  const canEnhance = prompt.trim().length > 0 || !!attachments.product;

  function handleEnhance() {
    if (!canEnhance || enhancing) return;
    enhance({
      prompt,
      mode,
      options: selections,
      productName: attachments.product?.fileName,
    });
  }

  function acceptSuggestion() {
    if (suggestion) setPrompt(suggestion);
    dismiss();
  }

  // Live credit estimate from mode + duration selection + draft. Recomputes on
  // every render (cheap, pure) so the hint by the send button always matches the
  // current settings — and the backend deduction.
  const isVideo = mode === "video";
  const estimate = estimateCost({
    mode,
    durationSeconds: isVideo ? parseDurationSeconds(selections.duration) : undefined,
    draft: settings.draft,
    imageCount: isVideo ? undefined : parseImageVariations(selections.variations),
  });
  // Block submit only when usage is known AND the full job exceeds the balance.
  const insufficientCredit = usage != null && estimate.full > usage.remainingTokens;

  // Extra reference images added via the ➕ button (not part of the fixed slots).
  const extraRefs = Object.values(attachments).filter(
    (a) => !slots.some((s) => s.id === a.slotId),
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="relative flex w-full flex-col items-stretch justify-center gap-3 px-4 sm:flex-row sm:items-center sm:gap-6 sm:px-0">
      {/* Soft teal glow behind the card */}
      <div className="pointer-events-none absolute inset-x-6 -inset-y-3 -z-10 composer-glow" aria-hidden />

      {/* Mode toggle: above the card on mobile, on the outer (start/right) edge from sm up */}
      <ModeToggle mode={mode} onChange={changeMode} />

      {/* The composer card */}
      <div className="relative flex min-h-[168px] w-full max-w-[946px] flex-col justify-between gap-4 rounded-4xl bg-card p-4 shadow-[0px_0px_0px_1px_rgba(101,101,101,0.06),0px_13px_13px_0px_rgba(0,0,0,0.04),0px_3px_7px_0px_rgba(0,0,0,0.05)]">
        {/* Top: prompt (start/right) + attachments (end/left).
            Stacks on mobile (attachments drop below the prompt), side-by-side from sm up. */}
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            aria-label="وصف الإعلان"
            placeholder="اوصف ما يحدث في إعلانك..."
            className="min-h-[56px] flex-1 resize-none rounded-lg bg-transparent text-md leading-6 text-ink outline-none placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
          />
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            {slots.map((slot) => (
              <AttachmentSlot
                key={slot.id}
                slot={slot}
                value={attachments[slot.id]}
                onChange={setAttachment}
                onPick={
                  slot.kind === "character"
                    ? () => setCharacterOpen(true)
                    : slot.kind === "product"
                      ? () => setProductOpen(true)
                      : undefined
                }
              />
            ))}
            {extraRefs.map((ref) => {
              const refSlot: Slot = { id: ref.slotId, kind: "image", label: "مرجع" };
              return (
                <AttachmentSlot
                  key={ref.slotId}
                  slot={refSlot}
                  value={ref}
                  onChange={setAttachment}
                />
              );
            })}
            {/* Image mode: labeled "صور" add-button opens the multi-select
                library. (Video mode uses the compact "+" in the toolbar.) */}
            {!isVideo && (
              <button
                type="button"
                aria-label="إضافة صور مرجعية"
                disabled={extraRefs.length >= MAX_REFS}
                onClick={() => setMediaOpen(true)}
                className="flex size-20 shrink-0 flex-col items-center justify-center gap-1.5 rounded-3xl bg-card text-ink-faint shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.12)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
              >
                <Images className="size-5" strokeWidth={1.75} />
                <span className="text-xs font-medium text-ink">صور</span>
              </button>
            )}
          </div>
        </div>

        {/* ✨ Enhanced-prompt suggestion — non-destructive: the live prompt is
            untouched until the user taps "استخدم". */}
        {(suggestion || enhanceError) && (
          <div className="rounded-2xl border border-primary/30 bg-secondary/40 p-3" dir="rtl">
            {enhanceError ? (
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-danger">تعذّر تحسين الوصف، حاول مجددًا</p>
                <button
                  type="button"
                  onClick={dismiss}
                  className="text-xs text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" strokeWidth={2} />
                  <span className="text-[11px] font-medium text-primary">اقتراح مُحسّن</span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-ink">{suggestion}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={acceptSuggestion}
                    className="flex h-8 items-center gap-1 rounded-xl bg-primary px-3 text-xs font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
                  >
                    <Check className="size-3.5" strokeWidth={2.5} />
                    استخدم
                  </button>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="flex h-8 items-center gap-1 rounded-xl border border-line px-3 text-xs font-medium text-ink-muted transition-colors hover:border-line-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
                  >
                    <X className="size-3.5" strokeWidth={2} />
                    تجاهل
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Bottom: toolbar + send. On mobile they stack so the toolbar gets the
            full width (no squished half-row); side-by-side from sm. */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          {/* dir=ltr pins the visual order to the design: settings (left) … + (right).
              Stays LTR by design regardless of locale — do not thread through DIR. */}
          <div dir="ltr" className="flex flex-wrap items-center gap-2">
            <ToolbarSettings
              settings={settings}
              onChange={(patch) => setSettings((prev) => ({ ...prev, ...patch }))}
              showCameraFixed={mode === "video"}
            />
            {/* ✨ Rewrite the prompt with AI. Hidden unless the backend has the
                enhancer configured. */}
            {enhanceAvailable && (
              <button
                type="button"
                onClick={handleEnhance}
                disabled={!canEnhance || enhancing || isBusy}
                aria-label="حسّن الوصف"
                className="flex h-8 items-center gap-1 rounded-xl border border-line px-2 text-xs font-medium text-ink-muted transition-colors hover:border-line-hover hover:text-ink disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
              >
                {enhancing ? (
                  <Loader2 className="size-4 animate-spin text-primary" strokeWidth={1.75} />
                ) : (
                  <Sparkles className="size-4 text-primary" strokeWidth={1.75} />
                )}
                <span>حسّن الوصف</span>
              </button>
            )}
            {selects.map((select) => {
              if (select.control === "slider") {
                return (
                  <ToolbarSlider
                    key={select.id}
                    config={select}
                    value={selections[select.id]}
                    onChange={(value) => setSelection(select.id, value)}
                  />
                );
              }
              if (select.control === "sheet") {
                return (
                  <ToolbarSheet
                    key={select.id}
                    config={select}
                    value={selections[select.id]}
                    onSelect={(value) => setSelection(select.id, value)}
                  />
                );
              }
              return (
                <ToolbarSelect
                  key={select.id}
                  config={select}
                  value={selections[select.id]}
                  onSelect={(value) => setSelection(select.id, value)}
                />
              );
            })}
            {/* Add MORE reference images — video only. Image mode uses the
                labeled "صور" add-button in the attachments row above. Both open
                the same multi-select library popup. */}
            {isVideo && (
              <button
                type="button"
                aria-label="إضافة صور مرجعية"
                disabled={extraRefs.length >= MAX_REFS}
                onClick={() => setMediaOpen(true)}
                className="flex h-8 items-center justify-center rounded-xl border border-line px-2 text-ink-faint transition-colors hover:border-line-hover disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
              >
                <Plus className="size-4" strokeWidth={1.75} />
              </button>
            )}

            {/* Draft preview toggle — video only. Promoted out of the ⚙️ popover
                since it changes both cost and flow. Active = engaged styling. */}
            {isVideo && (
              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, draft: !prev.draft }))}
                aria-pressed={settings.draft}
                aria-label="معاينة 480p"
                className={`flex h-8 items-center gap-1 rounded-xl border px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 ${
                  settings.draft
                    ? "border-primary bg-secondary text-primary"
                    : "border-line text-ink-muted hover:border-line-hover hover:text-ink"
                }`}
              >
                <Eye
                  className={`size-4 ${settings.draft ? "text-primary" : "text-ink-faint"}`}
                  strokeWidth={1.75}
                />
                <span>معاينة 480p</span>
              </button>
            )}
          </div>

          {/* Send + live cost estimate (estimate sits before the button in flow;
              dir=rtl keeps it on the start/right of the button per the layout).
              Full-width row on mobile so estimate and send split cleanly. */}
          <div className="flex w-full shrink-0 items-center justify-between gap-2 sm:w-auto sm:justify-end">
            <div className="flex flex-col items-end text-end">
              {estimate.preview != null ? (
                <span className="text-xs text-ink-muted">
                  معاينة ~{estimate.preview} · الكامل ~{estimate.full} رصيد
                </span>
              ) : (
                <span className="text-xs text-ink-muted">~{estimate.full} رصيد</span>
              )}
              {insufficientCredit && (
                <span className="text-xs text-danger">الرصيد غير كافٍ</span>
              )}
            </div>

            <Button
              variant="mint"
              size="icon"
              onClick={onSubmit}
              disabled={isBusy || !canSubmit || insufficientCredit}
              aria-label="إنشاء الإعلان"
              className="size-11 sm:size-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
            >
              <ArrowUp className="size-4" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </div>

      <CharacterModal
        open={characterOpen}
        onClose={() => setCharacterOpen(false)}
        selectedImage={attachments.character?.previewUrl}
        onSelect={(avatar) => {
          setAttachment("character", {
            slotId: "character",
            kind: "character",
            fileName: avatar.name,
            previewUrl: avatar.image,
          });
          setCharacterOpen(false);
        }}
      />

      <ProductModal
        open={productOpen}
        onClose={() => setProductOpen(false)}
        selectedImage={attachments.product?.previewUrl}
        onSelect={(product) => {
          setAttachment("product", {
            slotId: "product",
            kind: "product",
            fileName: product.name,
            previewUrl: product.image,
          });
          setProductOpen(false);
        }}
        onUpload={(dataUrl, fileName) => {
          setAttachment("product", {
            slotId: "product",
            kind: "product",
            fileName,
            previewUrl: dataUrl,
          });
          setProductOpen(false);
        }}
      />

      <MediaLibraryModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        maxSelectable={MAX_REFS - extraRefs.length}
        onSelectMany={(picked) => {
          // Each pick becomes a ref-* image attachment (addReferenceImage
          // dedupes by previewUrl; the cap is enforced via maxSelectable).
          for (const { url, name } of picked) addReferenceImage(url, name);
          setMediaOpen(false);
        }}
      />
    </div>
  );
}
