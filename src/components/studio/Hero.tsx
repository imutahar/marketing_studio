import { Sparkles, Folder } from "lucide-react";

/** Centered hero: the tag chip (or active project) + the big headline. */
export function Hero({ projectName }: { projectName?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
      <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink">
        {projectName ? (
          <>
            <Folder className="size-4 text-primary" strokeWidth={1.75} />
            {projectName}
          </>
        ) : (
          <>
            <Sparkles className="size-4 text-primary" strokeWidth={1.75} />
            استوديو التسويق
          </>
        )}
      </span>
      <h1 className="text-2xl font-bold leading-tight text-ink-strong sm:text-4xl sm:leading-[40px]">
        حوّل أي منتج إلى إعلان فيديو
      </h1>
    </div>
  );
}
