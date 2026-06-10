"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Clapperboard,
  Plus,
  Loader2,
  Sparkles,
  Monitor,
  RectangleVertical,
  Film,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatPercent } from "@/lib/locale";
import type { DropdownSelect } from "@/lib/toolbar";
import { PREVIEW_VIDEOS } from "@/lib/media";
import {
  createAdReference,
  getAdReference,
  updateAdScript,
  generateFromReference,
  type AdScript,
} from "@/lib/api/ad-reference";
import { ToolbarSelect } from "./ToolbarSelect";
import { ProductModal } from "./ProductModal";
import { CharacterModal } from "./CharacterModal";
import { ReferenceVideoModal } from "./ReferenceVideoModal";

interface AdReferenceModalProps {
  open: boolean;
  onClose: () => void;
  /** Active project the generation should belong to. */
  projectId?: string | null;
  /** Called with the generation id once a video is kicked off. */
  onGenerate: (generationId: string) => void;
  /** Pre-load a reference video (from "استخدم كمرجع" on a result). */
  initialReferenceUrl?: string;
}

const RES_SELECT: DropdownSelect = {
  id: "resolution",
  control: "dropdown",
  icon: Monitor,
  placeholder: "الدقة",
  options: ["480p", "720p", "1080p"],
};
const RATIO_SELECT: DropdownSelect = {
  id: "ratio",
  control: "dropdown",
  icon: RectangleVertical,
  placeholder: "الأبعاد",
  options: ["9:16", "1:1", "16:9"],
};

/** Small product/avatar attachment tile used in the intro step. */
function MiniSlot({
  label,
  image,
  onClick,
}: {
  label: string;
  image?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-line bg-card transition-colors hover:border-line-hover"
    >
      {image ? (
        <Image src={image} alt={label} fill className="object-cover" unoptimized />
      ) : (
        <Plus className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-ink-faint" strokeWidth={2} />
      )}
      <span className="absolute bottom-1.5 end-2 text-[10px] font-bold text-ink">
        {label}
      </span>
    </button>
  );
}

export function AdReferenceModal({ open, onClose, projectId, onGenerate, initialReferenceUrl }: AdReferenceModalProps) {
  const [step, setStep] = useState<"intro" | "analyzing" | "review">("intro");
  const [referenceVideo, setReferenceVideo] = useState<string | null>(null);

  // When opened from "استخدم كمرجع", pre-select the passed video so the user
  // lands on the intro step with the reference ready. Adjusting state during the
  // open transition (React-recommended) avoids a cascading effect re-render.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open && initialReferenceUrl) setReferenceVideo(initialReferenceUrl);
  }
  const [productImage, setProductImage] = useState<string>();
  const [avatarImage, setAvatarImage] = useState<string>();
  const [avatarName, setAvatarName] = useState<string>();
  const [refId, setRefId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [script, setScript] = useState<AdScript | null>(null);
  const [resolution, setResolution] = useState("1080p");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  // NOTE(multi-output): no `variations` state — capped at 1 (see handleGenerate).
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // sub-pickers
  const [refPickerOpen, setRefPickerOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const close = useCallback(() => {
    onClose();
    setStep("intro");
    setReferenceVideo(null);
    setProductImage(undefined);
    setAvatarImage(undefined);
    setAvatarName(undefined);
    setRefId(null);
    setProgress(0);
    setScript(null);
    setBusy(false);
    setError(null);
  }, [onClose]);

  // Poll analysis progress.
  useEffect(() => {
    if (step !== "analyzing" || !refId) return;
    let active = true;
    // Holder so `fail` (defined before setInterval runs) can clear the timer.
    const timer: { id?: ReturnType<typeof setInterval> } = {};
    // Mirror the main generation flow's 12-minute deadline (src/lib/api/generation.ts).
    // Without it the poll can spin forever if the backend never reaches ready/failed.
    const deadline = Date.now() + 12 * 60 * 1000;
    // Surface failures the same way a backend `failed` status does: show an error
    // and send the user back to the intro step so they can retry.
    const fail = (message: string) => {
      if (!active) return;
      active = false;
      if (timer.id) clearInterval(timer.id);
      setError(message);
      setStep("intro");
    };
    const tick = () => {
      if (Date.now() > deadline) {
        fail("انتهت مهلة تحليل الفيديو. حاول مرة أخرى.");
        return;
      }
      getAdReference(refId)
        .then((ref) => {
          if (!active) return;
          setProgress(ref.progress);
          if (ref.status === "ready" && ref.script) {
            const ready = ref.script;
            setScript(ready);
            setAspectRatio(ready.aspectRatio);
            setStep("review");
          } else if (ref.status === "failed") {
            setError(ref.error ?? "فشل تحليل الفيديو.");
            setStep("intro");
          }
        })
        .catch(() => {
          // Don't swallow network errors silently — surface them instead of
          // spinning forever on a dead backend.
          fail("تعذّر الوصول إلى الخادم أثناء التحليل. تأكد من تشغيل الخادم.");
        });
    };
    timer.id = setInterval(tick, 800);
    tick();
    return () => {
      active = false;
      if (timer.id) clearInterval(timer.id);
    };
  }, [step, refId]);

  async function handleContinue() {
    if (!referenceVideo || busy) return;
    setBusy(true);
    setError(null);
    try {
      const ref = await createAdReference({
        referenceVideoUrl: referenceVideo,
        productImage,
        avatarImage,
        avatarName,
      });
      setRefId(ref.id);
      setProgress(0);
      setStep("analyzing");
    } catch {
      setError("تعذّر بدء التحليل. تأكد من تشغيل الخادم.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerate() {
    if (!refId || !script || busy) return;
    setBusy(true);
    setError(null);
    try {
      await updateAdScript(refId, script);
      const { generationId } = await generateFromReference(refId, {
        resolution,
        aspectRatio,
        // TODO(multi-output): capped at 1 until the UI can track/render multiple
        // outputs. `variations` state is forced to 1; sending it literally here so
        // the user can never trigger >1 even if the state plumbing changes.
        variations: 1,
        projectId: projectId ?? undefined,
      });
      onGenerate(generationId);
      close();
    } catch {
      setError("تعذّر إنشاء الفيديو.");
      setBusy(false);
    }
  }

  function updateShot(index: number, field: "visual" | "spoken" | "onScreenText", value: string) {
    setScript((s) =>
      s ? { ...s, shots: s.shots.map((sh, i) => (i === index ? { ...sh, [field]: value } : sh)) } : s,
    );
  }

  return (
    <>
      <Modal
        open={open}
        onClose={close}
        ariaLabel="إعلان مرجعي"
        title="إعلان مرجعي"
        widthClass="max-w-[980px]"
      >
        {step === "intro" && (
          <div className="grid gap-6 px-6 pb-6 md:grid-cols-2">
            <div className="flex flex-col">
              <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-400 to-fuchsia-500 text-card">
                <Clapperboard className="size-6" strokeWidth={2} />
              </span>
              <h2 className="mt-4 text-2xl font-bold leading-snug text-ink-strong">
                احصل على إلهام من الإعلانات الرائجة
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                الصق إعلانًا رائجًا وحوّله إلى إعلانك — نفس الفكرة، نفس الطاقة،
                يبيع منتجك.
              </p>

              <div className="mt-auto flex flex-col gap-3 pt-6">
                <p className="text-xs font-medium text-ink-faint">الإعلان المرجعي</p>
                <div className="flex items-center gap-2">
                  {referenceVideo ? (
                    <button
                      type="button"
                      onClick={() => setRefPickerOpen(true)}
                      className="relative h-20 flex-1 overflow-hidden rounded-2xl bg-neutrals"
                    >
                      <video src={referenceVideo} muted className="size-full object-cover" />
                      <span className="absolute inset-0 grid place-items-center bg-black/20 text-xs font-medium text-card">
                        تغيير
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRefPickerOpen(true)}
                      className="flex h-20 flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line-hover text-ink-muted transition-colors hover:bg-neutrals"
                    >
                      <Film className="size-5" strokeWidth={1.75} />
                      <span className="text-xs font-medium">اختر فيديو مرجعي</span>
                    </button>
                  )}
                  <MiniSlot label="المنتج" image={productImage} onClick={() => setProductOpen(true)} />
                  <MiniSlot label="الشخصية" image={avatarImage} onClick={() => setAvatarOpen(true)} />
                </div>
                {error && <p className="text-xs text-danger">{error}</p>}
                <Button
                  variant="primary"
                  className="w-full bg-gradient-to-br from-rose-400 to-fuchsia-500"
                  onClick={handleContinue}
                  disabled={!referenceVideo || busy}
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : "متابعة"}
                </Button>
              </div>
            </div>

            <div className="relative hidden aspect-[3/4] overflow-hidden rounded-2xl bg-neutrals md:block">
              <video
                src={PREVIEW_VIDEOS.influencer}
                autoPlay
                muted
                loop
                playsInline
                className="size-full object-cover"
              />
            </div>
          </div>
        )}

        {step === "analyzing" && (
          <div className="flex flex-col items-center gap-3 px-6 py-16">
            <Loader2 className="size-8 animate-spin text-primary" />
            <h2 className="text-lg font-bold text-ink-strong">جاري تحليل الفيديو</h2>
            <p className="text-sm font-bold text-primary">{formatPercent(progress)}</p>
            <div className="mt-2 h-1.5 w-64 overflow-hidden rounded-full bg-neutrals">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {step === "review" && script && (
          <>
            <div className="shrink-0 px-6">
              <h2 className="text-lg font-bold text-ink-strong">راجع النص وعدّله</h2>
              <p className="mt-1 text-xs text-ink-muted">
                عدّل اللقطات قبل إنشاء الفيديو — {script.shots.length} لقطات،{" "}
                {script.durationSec} ثانية.
              </p>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-4 scroll-thin">
              {script.shots.map((shot, i) => (
                <div key={shot.index} className="rounded-2xl border border-line p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-neutrals px-2 py-0.5 text-[10px] font-bold text-ink">
                      {shot.type}
                    </span>
                    <span className="text-[10px] text-ink-faint">
                      {shot.start}s – {shot.end}s
                    </span>
                  </div>
                  <label className="block text-[10px] text-ink-faint">المشهد</label>
                  <textarea
                    value={shot.visual}
                    onChange={(e) => updateShot(i, "visual", e.target.value)}
                    rows={2}
                    className="mt-0.5 w-full resize-none rounded-lg border border-line bg-transparent p-2 text-xs text-ink outline-none focus:border-line-hover"
                  />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-ink-faint">التعليق الصوتي</label>
                      <input
                        value={shot.spoken}
                        onChange={(e) => updateShot(i, "spoken", e.target.value)}
                        className="mt-0.5 w-full rounded-lg border border-line bg-transparent p-2 text-xs text-ink outline-none focus:border-line-hover"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-ink-faint">نص على الشاشة</label>
                      <input
                        value={shot.onScreenText}
                        onChange={(e) => updateShot(i, "onScreenText", e.target.value)}
                        className="mt-0.5 w-full rounded-lg border border-line bg-transparent p-2 text-xs text-ink outline-none focus:border-line-hover"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-line px-6 py-4">
              <ToolbarSelect config={RES_SELECT} value={resolution} onSelect={setResolution} />
              <ToolbarSelect config={RATIO_SELECT} value={aspectRatio} onSelect={setAspectRatio} />
              {/*
                TODO(multi-output): the variations selector (1–4) is temporarily
                disabled. The backend can generate up to 4, but the UI only tracks
                one generationId and renders outputs[0], so picking >1 just burns
                quota. Re-enable once the multi-output gallery lands (track
                generationIds[] + render all outputs). Until then `variations` is
                forced to 1 and the request sends variations: 1.
              */}
              <div
                className="flex h-8 items-center gap-2 rounded-xl border border-line px-2 text-xs font-medium text-ink-faint opacity-60"
                title="إنشاء عدة نسخ قريبًا"
              >
                <span>نسخة واحدة</span>
              </div>
              {error && <p className="text-xs text-danger">{error}</p>}
              <Button
                variant="primary"
                className="ms-auto bg-gradient-to-br from-rose-400 to-fuchsia-500"
                onClick={handleGenerate}
                disabled={busy}
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" strokeWidth={2} />}
                إنشاء الفيديو
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Sub-pickers */}
      <ReferenceVideoModal
        open={refPickerOpen}
        onClose={() => setRefPickerOpen(false)}
        onSelect={(url) => {
          setReferenceVideo(url);
          setRefPickerOpen(false);
        }}
      />
      <ProductModal
        open={productOpen}
        onClose={() => setProductOpen(false)}
        selectedImage={productImage}
        onSelect={(p) => {
          setProductImage(p.image);
          setProductOpen(false);
        }}
        onUpload={(dataUrl) => {
          setProductImage(dataUrl);
          setProductOpen(false);
        }}
      />
      <CharacterModal
        open={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        selectedImage={avatarImage}
        onSelect={(a) => {
          setAvatarImage(a.image);
          setAvatarName(a.name);
          setAvatarOpen(false);
        }}
      />
    </>
  );
}
