import { create } from "zustand";

type ToastState = {
  message: string | null;
  show: (message: string) => void;
  clear: () => void;
};

export const useToast = create<ToastState>((set) => ({
  message: null,
  show: (message) => {
    set({ message });
    window.setTimeout(() => set({ message: null }), 4200);
  },
  clear: () => set({ message: null })
}));

export function ToastViewport() {
  const message = useToast((s) => s.message);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
      {message ? (
        <p className="rounded-pill border border-veil bg-abyss px-5 py-3 text-sm text-pearl shadow-lg">
          {message}
        </p>
      ) : null}
    </div>
  );
}
