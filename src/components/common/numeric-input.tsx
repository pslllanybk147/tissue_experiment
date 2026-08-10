"use client";

import { useState, type InputHTMLAttributes } from "react";

export function parseNumericDraft(raw: string): number {
  return raw.trim() === "" ? Number.NaN : Number(raw);
}

export function displayNumericValue(value: number): string {
  return Number.isFinite(value) ? String(value) : "";
}

type NumericInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> & {
  value: number;
  onChange: (value: number) => void;
};

/** Number input that lets a user clear the draft before entering a replacement. */
export function NumericInput({ value, onChange, ...props }: NumericInputProps) {
  const [draft, setDraft] = useState(() => displayNumericValue(value));

  return (
    <input
      {...props}
      type="number"
      value={draft}
      onChange={(event) => {
        const raw = event.currentTarget.value;
        setDraft(raw);
        onChange(parseNumericDraft(raw));
      }}
    />
  );
}
