import { Sparkles } from "lucide-react";

/** Centered hero: the "Marketing Studio" tag chip + the big headline. */
export function Hero() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink">
        <Sparkles className="size-4 text-primary" strokeWidth={1.75} />
        استوديو التسويق
      </span>
      <h1 className="text-4xl font-bold leading-[40px] text-ink-strong">
        حوّل أي منتج إلى إعلان فيديو
      </h1>
    </div>
  );
}
