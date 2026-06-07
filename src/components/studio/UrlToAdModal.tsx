"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Link2, MousePointerClick, Loader2, Sparkles, Clock, Monitor } from "lucide-react";
import { useHoverVideo } from "@/hooks/useHoverVideo";
import { extractProduct, type ProductInfo } from "@/lib/api/extract";
import { AD_STYLES, type AdStyle } from "@/lib/styles";
import { PREVIEW_VIDEOS } from "@/lib/media";
import type { DropdownSelect } from "@/lib/toolbar";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ToolbarSelect } from "./ToolbarSelect";

export interface UrlToAdResult {
  product: ProductInfo;
  style: AdStyle;
  duration: string;
  resolution: string;
}

interface UrlToAdModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (result: UrlToAdResult) => void;
}

const DURATION_SELECT: DropdownSelect = {
  id: "duration",
  control: "dropdown",
  icon: Clock,
  placeholder: "المدة",
  options: ["6 ث", "8 ث", "10 ث", "12 ث"],
};
const RESOLUTION_SELECT: DropdownSelect = {
  id: "resolution",
  control: "dropdown",
  icon: Monitor,
  placeholder: "الدقة",
  options: ["480p", "720p", "1080p"],
};

function StyleCard({
  style,
  selected,
  onSelect,
}: {
  style: AdStyle;
  selected: boolean;
  onSelect: () => void;
}) {
  const { videoRef, hoverHandlers } = useHoverVideo();
  return (
    <button type="button" onClick={onSelect} {...hoverHandlers} className="text-start">
      <div
        className={`relative aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br ${style.gradient} transition ${
          selected ? "ring-2 ring-primary ring-offset-2" : "hover:-translate-y-1"
        }`}
      >
        {style.video && (
          <video
            ref={videoRef}
            src={style.video}
            muted
            loop
            playsInline
            preload="metadata"
            className="pointer-events-none absolute inset-0 size-full object-cover"
          />
        )}
      </div>
      <p className="mt-2 text-sm font-medium text-ink">{style.label}</p>
      <p className="truncate text-xs text-ink-muted">{style.description}</p>
    </button>
  );
}

export function UrlToAdModal({ open, onClose, onGenerate }: UrlToAdModalProps) {
  const [step, setStep] = useState<"url" | "style">("url");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [styleId, setStyleId] = useState<string | null>(null);
  const [duration, setDuration] = useState("8 ث");
  const [resolution, setResolution] = useState("720p");

  const close = useCallback(() => {
    onClose();
    setStep("url");
    setUrl("");
    setProduct(null);
    setStyleId(null);
    setError(null);
    setLoading(false);
  }, [onClose]);

  async function handleContinue() {
    if (!url.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      setProduct(await extractProduct(url.trim()));
      setStep("style");
    } catch {
      setError("تعذّر قراءة الرابط. تأكد من رابط صفحة المنتج وحاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  function handleGenerate() {
    const style = AD_STYLES.find((s) => s.id === styleId);
    if (!product || !style) return;
    onGenerate({ product, style, duration, resolution });
    close();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      ariaLabel="من رابط إلى إعلان"
      title="من رابط إلى إعلان"
      widthClass="max-w-[980px]"
    >
      {step === "url" ? (
        <div className="grid gap-6 px-6 pb-6 md:grid-cols-2">
          <div className="flex flex-col">
            <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-400 to-fuchsia-500 text-card">
              <MousePointerClick className="size-6" strokeWidth={2} />
            </span>
            <h2 className="mt-4 text-2xl font-bold leading-snug text-ink-strong">
              حوّل رابط منتجك إلى إعلان فيديو
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              الصق رابط صفحة المنتج لإنشاء إعلان جاهز لتيك توك وريلز وشورتس —
              بدون تصوير ولا مونتاج.
            </p>

            <div className="mt-auto flex flex-col gap-3 pt-6">
              <div className="flex items-center gap-2 rounded-xl border border-line px-3 focus-within:border-line-hover">
                <Link2 className="size-4 shrink-0 text-ink-faint" strokeWidth={1.75} />
                <input
                  type="url"
                  dir="ltr"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                  placeholder="www.yourproduct.com"
                  className="h-11 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
                  aria-label="رابط صفحة المنتج"
                />
              </div>
              {error && <p className="text-xs text-danger">{error}</p>}
              <Button
                variant="primary"
                className="w-full bg-gradient-to-br from-rose-400 to-fuchsia-500"
                onClick={handleContinue}
                disabled={!url.trim() || loading}
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : "متابعة"}
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
      ) : (
        <>
          <div className="shrink-0 px-6">
            <h2 className="text-2xl font-bold text-ink-strong">اختر أسلوبًا وابدأ</h2>
            <p className="mt-1 text-sm text-ink-muted">اختر ما يناسب منتجك.</p>
            {product && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-line p-1.5 pe-3">
                <span className="relative size-8 shrink-0 overflow-hidden rounded-lg bg-neutrals">
                  <Image src={product.image} alt={product.title} fill className="object-cover" unoptimized />
                </span>
                <span className="max-w-[240px] truncate text-xs font-medium text-ink">
                  {product.title}
                </span>
              </div>
            )}
          </div>

          {/* Style grid (scrollable) */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 scroll-thin">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {AD_STYLES.map((style) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  selected={style.id === styleId}
                  onSelect={() => setStyleId(style.id)}
                />
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-line px-6 py-4">
            <ToolbarSelect config={RESOLUTION_SELECT} value={resolution} onSelect={setResolution} />
            <ToolbarSelect config={DURATION_SELECT} value={duration} onSelect={setDuration} />
            <span className="flex h-8 items-center gap-1 rounded-xl border border-line px-2 text-xs font-medium text-ink-muted">
              <Link2 className="size-4 text-ink-faint" strokeWidth={1.75} />
              رابط المنتج
            </span>
            <Button
              variant="primary"
              className="ms-auto bg-gradient-to-br from-rose-400 to-fuchsia-500"
              onClick={handleGenerate}
              disabled={!styleId}
            >
              <Sparkles className="size-4" strokeWidth={2} />
              إنشاء الفيديو
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
