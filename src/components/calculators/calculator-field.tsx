export const calculatorInputStyle = {
  width: "100%",
  padding: "9px 11px",
  border: "1.5px solid var(--pl-line-soft)",
  borderRadius: "12px",
  background: "var(--pl-card)",
  color: "var(--pl-ink)",
  fontSize: "16px",
} as const;

export function CalculatorField({
  id,
  label,
  value,
  onChange,
  hint,
  step = "any",
}: {
  id: string;
  label: string;
  value: number;
  onChange: (next: number) => void;
  hint?: string;
  step?: string;
}) {
  return (
    <p style={{ margin: 0 }}>
      <label htmlFor={id} style={{ display: "block", fontWeight: 600, marginBottom: "5px", fontSize: "14px" }}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        step={step}
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={calculatorInputStyle}
      />
      {hint ? <span className="pl-meta" style={{ display: "block", marginTop: "4px" }}>{hint}</span> : null}
    </p>
  );
}
