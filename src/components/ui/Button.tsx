import { forwardRef } from "react";

type Variant = "primary" | "outline" | "ghost" | "mint";
type Size = "sm" | "md" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-card hover:opacity-90",
  outline: "border border-line text-ink hover:border-line-hover hover:bg-neutrals",
  ghost: "text-ink hover:bg-neutrals",
  mint: "border-2 border-secondary bg-secondary text-primary hover:opacity-90",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1 px-2 text-xs",
  md: "gap-2 px-4 py-2 text-sm",
  icon: "size-8",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/** Shared button primitive — single home for button styling across the app. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "outline", size = "md", className = "", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
});
