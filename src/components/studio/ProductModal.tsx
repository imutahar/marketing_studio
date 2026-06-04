"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { X, Search, ChevronDown, Check } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { usePopover } from "@/hooks/usePopover";
import {
  getStoreProducts,
  PRODUCT_CATEGORIES,
  type StoreProduct,
} from "@/lib/api/products";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (product: StoreProduct) => void;
  /** Image URL of the currently-attached product (to show the check). */
  selectedImage?: string;
}

function CategoryDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { open, setOpen, ref } = usePopover();
  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-11 items-center gap-1 rounded-xl border border-line px-3 text-sm font-medium text-ink transition-colors hover:border-line-hover"
      >
        {value}
        <ChevronDown className={`size-4 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.75} />
      </button>
      {open && (
        <ul className="absolute top-full z-10 mt-1 min-w-[120px] overflow-hidden rounded-xl border border-line bg-card py-1 shadow-[0px_6px_14px_0px_rgba(0,0,0,0.1)]">
          {PRODUCT_CATEGORIES.map((cat) => (
            <li key={cat}>
              <button
                type="button"
                onClick={() => {
                  onChange(cat);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3 py-1.5 text-sm transition-colors hover:bg-neutrals ${
                  cat === value ? "font-medium text-primary" : "text-ink"
                }`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ProductModal({
  open,
  onClose,
  onSelect,
  selectedImage,
}: ProductModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("الكل");

  const close = useCallback(() => {
    onClose();
    setQuery("");
    setCategory("الكل");
  }, [onClose]);

  useFocusTrap(dialogRef, open, close);

  // Fetch the catalog once, the first time the picker is opened.
  useEffect(() => {
    if (!open || products.length > 0) return;
    let active = true;
    getStoreProducts()
      .then((p) => {
        if (active) setProducts(p);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [open, products.length]);

  const results = useMemo(() => {
    const q = query.trim();
    return products.filter(
      (p) =>
        (category === "الكل" || p.category === category) &&
        (q === "" || p.name.includes(q)),
    );
  }, [products, query, category]);

  if (!open) return null;

  const loading = products.length === 0;

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
        aria-label="اختر منتج"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-[820px] flex-col overflow-hidden rounded-2xl bg-card shadow-[0px_1px_4px_0px_rgba(0,0,0,0.2)]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 py-5">
          <div className="text-right">
            <h3 className="text-md font-bold text-ink">اختر منتج</h3>
            <p className="mt-1.5 text-xs text-ink-muted">
              اختر منتجًا من متجرك لربط إعلانك به.
            </p>
          </div>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={close}
            className="grid size-8 shrink-0 place-items-center rounded-xl border border-line text-ink transition-colors hover:bg-neutrals"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>

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
          <CategoryDropdown value={category} onChange={setCategory} />
        </div>

        {/* Product grid */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 scroll-thin">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-line p-3">
                  <div className="aspect-square rounded-xl bg-neutrals" />
                  <div className="mt-3 h-3 w-2/3 rounded bg-neutrals" />
                  <div className="mt-2 h-3 w-1/3 rounded bg-neutrals" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink-muted">
              لا توجد منتجات مطابقة.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((product) => {
                const selected = product.image === selectedImage;
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => onSelect(product)}
                    className={`relative rounded-2xl border p-3 text-start transition-colors ${
                      selected
                        ? "border-secondary-dark"
                        : "border-line hover:border-line-hover"
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
                    <p className="mt-2.5 truncate text-sm font-medium text-ink">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {product.price} {product.currency}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
