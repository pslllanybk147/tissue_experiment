import { FieldGroup } from "@/components/common/field-group";

export function CalculatorField({
  id,
  label,
  value,
  onChange,
  hint,
  step = "any",
  allowZero = false,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (next: number) => void;
  hint?: string;
  step?: string;
  allowZero?: boolean;
}) {
  const invalid = !Number.isFinite(value) || (allowZero ? value < 0 : value <= 0);
  return (
    <FieldGroup id={id} label={label} hint={hint} error={invalid ? "ต้องมากกว่าศูนย์" : undefined}>
      <input
        aria-invalid={invalid}
        id={id}
        type="number"
        min="0"
        step={step}
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </FieldGroup>
  );
}
