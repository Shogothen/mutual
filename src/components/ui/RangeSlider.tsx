import { useId } from "react";
import type { IntensityLevel } from "@/domain/questions/types";

type Props = {
  label: string;
  min: IntensityLevel;
  max: IntensityLevel;
  onChange: (min: IntensityLevel, max: IntensityLevel) => void;
};

const LEVELS: IntensityLevel[] = [1, 2, 3, 4, 5];

/** Intensity range as five toggle steps – clearer and more accessible than a
 *  double-thumb slider on touch devices. */
export function RangeSlider({ label, min, max, onChange }: Props) {
  const id = useId();
  const toggle = (level: IntensityLevel) => {
    if (level < min) onChange(level, max);
    else if (level > max) onChange(min, level);
    else if (level === min && min !== max) onChange((min + 1) as IntensityLevel, max);
    else if (level === max && min !== max) onChange(min, (max - 1) as IntensityLevel);
    else onChange(level, level);
  };
  return (
    <div role="group" aria-labelledby={id}>
      <p id={id} className="mb-2 text-sm text-mist">
        {label}: Stufe {min}{min !== max ? ` bis ${max}` : ""}
      </p>
      <div className="flex gap-1.5">
        {LEVELS.map((l) => {
          const active = l >= min && l <= max;
          return (
            <button
              key={l}
              type="button"
              aria-pressed={active}
              aria-label={`Stufe ${l}${active ? " (ausgewählt)" : ""}`}
              onClick={() => toggle(l)}
              className={`min-h-touch flex-1 rounded-lg border text-sm transition-colors
                ${active ? "border-lavender bg-iris/25 text-pearl" : "border-veil text-mist"}`}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}
