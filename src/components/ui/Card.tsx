import type { HTMLAttributes } from "react";

export function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-card border border-veil/60 bg-smoke/80 p-6 backdrop-blur-sm ${className}`}
      {...rest}
    />
  );
}
