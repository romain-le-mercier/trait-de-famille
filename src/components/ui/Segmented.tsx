"use client";

import { cx } from "@/lib/cx";

interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  name: string;
}

/** Boutons segmentés (réglages de l'aperçu), accessibles au clavier. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
  name,
}: SegmentedProps<T>) {
  const active = options.find((option) => option.value === value);
  return (
    <fieldset disabled={disabled} className="disabled:opacity-60">
      <legend className="mb-2 text-sm font-bold">{label}</legend>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex rounded-full border-2 border-ink bg-white p-1"
      >
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              name={name}
              onClick={() => onChange(option.value)}
              className={cx(
                "flex-1 rounded-full px-2 py-2 text-sm font-bold transition-colors",
                isActive
                  ? "bg-grape text-white"
                  : "text-muted hover:bg-grape-soft hover:text-ink",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {active?.hint && (
        <p className="mt-2 text-xs text-muted">{active.hint}</p>
      )}
    </fieldset>
  );
}
