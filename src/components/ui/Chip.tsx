export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/** Small selectable pill used for the composer toolbar options. */
export function Chip({ active = false, className = "", children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`flex h-8 items-center gap-1 rounded-xl border px-2 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary/5 text-primary"
          : "border-line text-ink hover:border-line-hover"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
