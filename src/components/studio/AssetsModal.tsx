"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Play, Download } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { useHoverVideo } from "@/hooks/useHoverVideo";
import { getAssets, type Asset } from "@/lib/api/assets";

type Filter = "all" | "video" | "image";
const FILTER_LABELS: Record<Filter, string> = { all: "الكل", video: "فيديو", image: "صورة" };
const FILTERS: Filter[] = ["all", "video", "image"];

interface AssetsModalProps {
  open: boolean;
  onClose: () => void;
  onView: (asset: Asset) => void;
}

function AssetCard({ asset, onView }: { asset: Asset; onView: () => void }) {
  const { videoRef, hoverHandlers } = useHoverVideo();
  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutrals">
      <button
        type="button"
        onClick={onView}
        {...(asset.type === "video" ? hoverHandlers : {})}
        className="absolute inset-0"
        aria-label="عرض"
      >
        {asset.type === "video" ? (
          <>
            <video
              ref={videoRef}
              src={asset.url}
              muted
              loop
              playsInline
              preload="metadata"
              className="pointer-events-none absolute inset-0 size-full object-cover"
            />
            <span className="absolute inset-0 grid place-items-center bg-black/10">
              <Play className="size-6 text-card/90" />
            </span>
          </>
        ) : (
          <Image src={asset.url} alt="" fill className="object-cover" unoptimized />
        )}
      </button>
      <a
        href={asset.url}
        download
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        aria-label="تنزيل"
        className="absolute end-2 top-2 hidden size-7 place-items-center rounded-lg bg-card/95 text-ink shadow group-hover:grid"
      >
        <Download className="size-4" strokeWidth={2} />
      </a>
    </div>
  );
}

export function AssetsModal({ open, onClose, onView }: AssetsModalProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!open) return;
    let active = true;
    getAssets()
      .then((a) => {
        if (active) {
          setAssets(a);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [open, attempt]);

  const results = useMemo(
    () => assets.filter((a) => filter === "all" || a.type === filter),
    [assets, filter],
  );

  function handleClose() {
    setFilter("all");
    onClose();
  }

  function retry() {
    setError(false);
    setLoaded(false);
    setAttempt((a) => a + 1);
  }

  const loading = !loaded && !error;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      ariaLabel="الأصول"
      title="الأصول"
      subtitle="كل الأصول التي أنشأتها عبر مشاريعك."
      widthClass="max-w-[900px]"
    >
      <div className="flex shrink-0 items-center justify-end px-6 pb-4">
        <SelectDropdown value={filter} options={FILTERS} labels={FILTER_LABELS} onChange={setFilter} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 scroll-thin">
        {error ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <p className="text-sm text-ink-muted">تعذّر تحميل الأصول.</p>
            <button
              type="button"
              onClick={retry}
              className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-neutrals"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-neutrals" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-muted">
            لا توجد أصول بعد — أنشئ أول إعلان!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((asset) => (
              <AssetCard key={asset.id} asset={asset} onView={() => onView(asset)} />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
