"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { X, Link2, MousePointerClick, Loader2, ArrowLeft } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { extractProduct, type ProductInfo } from "@/lib/api/extract";
import { PREVIEW_VIDEOS } from "@/lib/media";
import { Button } from "@/components/ui/Button";

interface UrlToAdModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (product: ProductInfo) => void;
}

export function UrlToAdModal({ open, onClose, onApply }: UrlToAdModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductInfo | null>(null);

  const close = useCallback(() => {
    onClose();
    // reset for next open
    setUrl("");
    setProduct(null);
    setError(null);
    setLoading(false);
  }, [onClose]);

  useFocusTrap(dialogRef, open, close);

  if (!open) return null;

  async function handleExtract() {
    if (!url.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      setProduct(await extractProduct(url.trim()));
    } catch {
      setError("تعذّر قراءة الرابط. تأكد من رابط صفحة المنتج وحاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  function handleUse() {
    if (!product) return;
    onApply(product);
    close();
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={close}
    >
      <div
        ref={dialogRef}
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label="من رابط إلى إعلان"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-[880px] flex-col overflow-hidden rounded-2xl bg-card shadow-[0px_1px_4px_0px_rgba(0,0,0,0.2)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-md font-bold text-ink">من رابط إلى إعلان</h3>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={close}
            className="grid size-8 place-items-center rounded-xl border border-line text-ink transition-colors hover:bg-neutrals"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="grid gap-6 px-6 pb-6 md:grid-cols-2">
          {/* Form / preview */}
          <div className="flex flex-col">
            <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-400 to-fuchsia-500 text-card">
              <MousePointerClick className="size-6" strokeWidth={2} />
            </span>
            <h2 className="mt-4 text-2xl font-bold leading-snug text-ink-strong">
              حوّل رابط منتجك إلى إعلان فيديو
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              الصق رابط صفحة المنتج لإنشاء إعلان جاهز لتيك توك وريلز وشورتس — بدون
              تصوير ولا مونتاج.
            </p>

            <div className="mt-auto pt-6">
              {product ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-line p-3">
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-neutrals">
                      <Image src={product.image} alt={product.title} fill className="object-cover" unoptimized />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{product.title}</p>
                      {product.price && (
                        <p className="mt-0.5 text-xs text-ink-muted">{product.price}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="primary" className="flex-1 bg-gradient-to-br from-rose-400 to-fuchsia-500" onClick={handleUse}>
                      إنشاء الإعلان
                    </Button>
                    <Button variant="outline" onClick={() => setProduct(null)} aria-label="رجوع">
                      <ArrowLeft className="size-4" strokeWidth={2} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-line px-3 focus-within:border-line-hover">
                    <Link2 className="size-4 shrink-0 text-ink-faint" strokeWidth={1.75} />
                    <input
                      type="url"
                      dir="ltr"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                      placeholder="www.yourproduct.com"
                      className="h-11 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
                      aria-label="رابط صفحة المنتج"
                    />
                  </div>
                  {error && <p className="text-xs text-danger">{error}</p>}
                  <Button
                    variant="primary"
                    className="w-full bg-gradient-to-br from-rose-400 to-fuchsia-500"
                    onClick={handleExtract}
                    disabled={!url.trim() || loading}
                  >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : "متابعة"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sample preview */}
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
      </div>
    </div>
  );
}
