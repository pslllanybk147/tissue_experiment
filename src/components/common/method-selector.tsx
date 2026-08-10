"use client";

import type { ReactNode } from "react";

export type MethodOption = {
  value: string;
  label: ReactNode;
  description: ReactNode;
  status?: ReactNode;
  disabled?: boolean;
  disabledReason?: ReactNode;
};

export type MethodSelectorProps = {
  legend?: ReactNode;
  name: string;
  value: string | null;
  options: MethodOption[];
  onChange: (value: string) => void;
};

export function MethodSelector({ legend = "เลือกวิธี", name, value, options, onChange }: MethodSelectorProps) {
  return (
    <fieldset className="cl-method-selector">
      <legend>{legend}</legend>
      <div className="cl-method-options">
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          const selected = value === option.value;
          return (
            <label className="cl-method-option" data-selected={selected ? "true" : undefined} data-disabled={option.disabled ? "true" : undefined} htmlFor={id} key={option.value}>
              <input
                checked={selected}
                disabled={option.disabled}
                id={id}
                name={name}
                onChange={() => onChange(option.value)}
                type="radio"
                value={option.value}
              />
              <span className="cl-method-copy">
                <strong>{option.label}</strong>
                <span>{option.description}</span>
                {option.status ? <small>{option.status}</small> : null}
                {option.disabledReason ? <small className="cl-method-disabled-reason">ใช้ไม่ได้: {option.disabledReason}</small> : null}
              </span>
              {selected ? <span className="cl-method-selected" aria-hidden="true">✓ เลือกแล้ว</span> : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
