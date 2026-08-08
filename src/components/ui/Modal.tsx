import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/** Accessible dialog with focus trapping via <dialog>. */
export function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onCancel={onClose}
      className="w-[min(92vw,28rem)] rounded-card border border-veil bg-abyss p-6 text-pearl
        backdrop:bg-void/80 backdrop:backdrop-blur-sm"
    >
      <h2 className="mb-4 font-display text-xl">{title}</h2>
      {children}
    </dialog>
  );
}
