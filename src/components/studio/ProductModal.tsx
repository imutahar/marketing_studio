"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Search, Check, Upload } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { fileToDownscaledDataUrl } from "@/lib/image";
import {
  getStoreProducts,
  PRODUCT_CATEGORIES,
  type StoreProduct,
} from "@/lib/api/products";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (product: StoreProduct) => void;
  /** Use a custom uploaded image instead of a catalog product. */
  onUpload: (dataUrl: string, fileName: string) => void;
  /** Image URL of the currently-attached product (to show the check). */
  selectedImage?: string;
}

export function ProductModal({
  open,
  onClose,
  onSelect,
  onUpload,
  selectedImage,
}: ProductModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("الكل");

  function handleClose() {
    setQuery("");
    setCategory("الكل");
    onClose();
  }

  // Fetch the catalog the first time the picker opens (and on retry).
  useEffect(() => {
    if (!open || products.length > 0) return;
    let active = true;
    getStoreProducts()
      .then((p) => {
        if (active) setProducts(p);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [open, attempt, products.length]);

  const results = useMemo(() => {
    const q = query.trim();
    return products.filter(
      (p) =>
        (category === "الكل" || p.category === category) &&
        (q === "" || p.name.includes(q)),
    );
  }, [products, query, category]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDownscaledDataUrl(file);
    onUpload(dataUrl, file.name);
  }

  function retry() {
    setError(false);
    setAttempt((a) => a + 1);
  }

  const loading = !error && products.length === 0;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      ariaLabel="اختر منتج"
      title="اختر منتج"
      subtitle="اختر منتجًا من متجرك لربط إعلانك به."
    >
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-3 px-6 pb-4">
        <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-line px-3 focus-within:border-line-hover">
          <Search className="size-4 shrink-0 text-ink-faint" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم المنتج"
            aria-label="ابحث باسم المنتج"
            className="h-full flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
          />
        </div>
        <SelectDropdown value={category} options={PRODUCT_CATEGORIES} onChange={setCategory} />
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 scroll-thin">
        {error ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <p className="text-sm text-ink-muted">تعذّر تحميل المنتجات.</p>
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
              <div key={i} className="animate-pulse rounded-2xl border border-line p-3">
                <div className="aspect-square rounded-xl bg-neutrals" />
                <div className="mt-3 h-3 w-2/3 rounded bg-neutrals" />
                <div className="mt-2 h-3 w-1/3 rounded bg-neutrals" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {/* Upload tile */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-hover text-ink-muted transition-colors hover:bg-neutrals"
            >
              <Upload className="size-6" strokeWidth={1.75} />
              <span className="text-xs font-medium">ارفع صورة</span>
            </button>

            {results.map((product) => {
              const selected = product.image === selectedImage;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onSelect(product)}
                  aria-pressed={selected}
                  className={`relative rounded-2xl border p-3 text-start transition-colors ${
                    selected ? "border-secondary-dark" : "border-line hover:border-line-hover"
                  }`}
                >
                  <span className="relative block aspect-square overflow-hidden rounded-xl bg-neutrals">
                    <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
                  </span>
                  {selected && (
                    <span className="absolute end-4 top-4 grid size-6 place-items-center rounded-full bg-primary text-card shadow">
                      <Check className="size-4" strokeWidth={2.5} />
                    </span>
                  )}
                  <p className="mt-2.5 truncate text-sm font-medium text-ink">{product.name}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {product.price} {product.currency}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleUpload} />
    </Modal>
  );
}
