type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (v: T) => void;
};

export function SegmentedControl<T extends string>({ label, options, value, onChange }: Props<T>) {
  return (
    <fieldset className="rounded-pill border border-veil p-1">
      <legend className="sr-only">{label}</legend>
      <div role="radiogroup" aria-label={label} className="flex gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`min-h-touch flex-1 rounded-pill px-3 py-2 text-sm transition-colors
              ${value === o.value ? "bg-iris/30 text-pearl" : "text-mist hover:text-pearl"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
