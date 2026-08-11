import { FieldGroup } from "@/components/common/field-group";
import { NumericInput } from "@/components/common/numeric-input";

export function CalculatorField({
  id,
  label,
  value,
  onChange,
  hint,
  unit,
  step = "any",
  allowZero = false,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (next: number) => void;
  hint?: string;
  unit?: string;
  step?: string;
  allowZero?: boolean;
}) {
  const invalid = !Number.isFinite(value) || (allowZero ? value < 0 : value <= 0);
  return (
    <FieldGroup id={id} label={label} hint={hint} unit={unit} error={invalid ? "ต้องมากกว่าศูนย์" : undefined}>
      <NumericInput
        aria-invalid={invalid}
        id={id}
        min="0"
        step={step}
        inputMode="decimal"
        value={value}
        onChange={onChange}
      />
    </FieldGroup>
  );
}
