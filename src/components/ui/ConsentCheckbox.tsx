import { useId } from "react";

type Props = { label: string; checked: boolean; onChange: (v: boolean) => void };

export function ConsentCheckbox({ label, checked, onChange }: Props) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex min-h-touch cursor-pointer items-start gap-3 py-1">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-[rgb(var(--c-iris))]"
      />
      <span className="text-sm leading-relaxed text-pearl">{label}</span>
    </label>
  );
}
