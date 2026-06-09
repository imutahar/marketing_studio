"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getStoreProducts, type StoreProduct } from "@/lib/api/products";

interface MentionState {
  open: boolean;
  query: string;
  /** Index of the triggering '@' in the textarea value. */
  atIndex: number;
  /** Cursor index (end of the query) when the mention was detected. */
  caret: number;
  results: StoreProduct[];
  activeIndex: number;
}

const CLOSED: MentionState = {
  open: false,
  query: "",
  atIndex: -1,
  caret: 0,
  results: [],
  activeIndex: 0,
};

const MAX_RESULTS = 6;

function filterProducts(products: StoreProduct[], query: string): StoreProduct[] {
  const q = query.trim().toLowerCase();
  const list = q
    ? products.filter((p) => p.name.toLowerCase().includes(q))
    : products;
  return list.slice(0, MAX_RESULTS);
}

/**
 * `@`-mention product picker for the composer textarea. Typing `@` (at the
 * start of a word) opens an inline list filtered by the text after it.
 * Selecting a product inserts its name as plain text AND calls `onSelect` so
 * the caller can attach it (image reference + productName) — no fragile inline
 * token rendering, which keeps it robust in RTL Arabic.
 *
 * Data comes from {@link getStoreProducts} (mock today); when that's swapped for
 * the real Salla catalog, the picker uses real products with no changes here.
 */
export function useProductMention(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  setPrompt: (value: string) => void,
  onSelect: (product: StoreProduct) => void,
) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [state, setState] = useState<MentionState>(CLOSED);
  // Caret position to restore after a controlled value update (insert).
  const pendingCaret = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    getStoreProducts()
      .then((p) => active && setProducts(p))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // After we programmatically rewrite the value, restore the caret + focus.
  useEffect(() => {
    if (pendingCaret.current != null && textareaRef.current) {
      const pos = pendingCaret.current;
      pendingCaret.current = null;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(pos, pos);
    }
  });

  /** Re-evaluate whether an `@`-mention is active for (value, caret). */
  const onInput = useCallback(
    (value: string) => {
      const el = textareaRef.current;
      const caret = el?.selectionStart ?? value.length;
      const upto = value.slice(0, caret);
      const at = upto.lastIndexOf("@");
      // No '@', or whitespace between '@' and the caret → not a mention.
      if (at === -1 || /\s/.test(upto.slice(at + 1))) {
        setState(CLOSED);
        return;
      }
      // '@' must begin a word (start of text or after whitespace) — skips emails.
      const before = at > 0 ? value[at - 1] : "";
      if (before && !/\s/.test(before)) {
        setState(CLOSED);
        return;
      }
      const query = upto.slice(at + 1);
      const results = filterProducts(products, query);
      setState({
        open: results.length > 0,
        query,
        atIndex: at,
        caret,
        results,
        activeIndex: 0,
      });
    },
    [products, textareaRef],
  );

  const close = useCallback(() => setState(CLOSED), []);

  const choose = useCallback(
    (product: StoreProduct) => {
      const value = textareaRef.current?.value ?? "";
      setState((s) => {
        if (s.atIndex < 0) return CLOSED;
        const insert = `${product.name} `;
        const next = value.slice(0, s.atIndex) + insert + value.slice(s.caret);
        pendingCaret.current = s.atIndex + insert.length;
        setPrompt(next);
        return CLOSED;
      });
      onSelect(product);
    },
    [setPrompt, onSelect, textareaRef],
  );

  /** Handle nav keys while open. Returns true if the key was consumed. */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>): boolean => {
      if (!state.open || state.results.length === 0) return false;
      switch (e.key) {
        case "ArrowDown":
          setState((s) => ({
            ...s,
            activeIndex: (s.activeIndex + 1) % s.results.length,
          }));
          return true;
        case "ArrowUp":
          setState((s) => ({
            ...s,
            activeIndex:
              (s.activeIndex - 1 + s.results.length) % s.results.length,
          }));
          return true;
        case "Enter":
        case "Tab":
          choose(state.results[state.activeIndex]);
          return true;
        case "Escape":
          close();
          return true;
        default:
          return false;
      }
    },
    [state, choose, close],
  );

  const setActive = useCallback(
    (i: number) => setState((s) => ({ ...s, activeIndex: i })),
    [],
  );

  return { mention: state, onInput, onKeyDown, choose, close, setActive };
}
