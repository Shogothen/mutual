import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  icon?: ReactNode;
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-iris text-void hover:bg-lavender disabled:bg-veil disabled:text-mist",
  secondary:
    "bg-transparent border border-veil text-pearl hover:border-lavender disabled:text-mist",
  ghost: "bg-transparent text-mist hover:text-pearl disabled:text-veil",
  danger: "bg-transparent border border-danger/50 text-danger hover:bg-danger/10"
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", loading = false, icon, children, className = "", disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex min-h-touch min-w-touch items-center justify-center gap-2 rounded-pill
        px-5 py-3 text-sm font-medium transition-colors duration-150
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-lavender
        ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
});
