import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean };

export function Chip({ selected = false, className = "", ...rest }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`min-h-touch rounded-pill border px-4 py-2 text-sm transition-colors
        ${selected ? "border-lavender bg-iris/25 text-pearl" : "border-veil text-mist hover:border-mist"}
        ${className}`}
      {...rest}
    />
  );
}
