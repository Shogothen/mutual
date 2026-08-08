import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      <div aria-hidden className="mx-auto mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-iris/30 to-coral/10 blur-[1px]" />
      <h2 className="font-display text-lg text-pearl">{title}</h2>
      {children ? <p className="mt-2 text-sm leading-relaxed text-mist">{children}</p> : null}
    </div>
  );
}
