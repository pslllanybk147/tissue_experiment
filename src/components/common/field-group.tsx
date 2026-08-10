import { cloneElement, type ReactElement, type ReactNode } from "react";

type DescribedControlProps = {
  "aria-describedby"?: string;
};

export type FieldGroupProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  unit?: ReactNode;
  children: ReactElement<DescribedControlProps>;
};

export function FieldGroup({ id, label, hint, error, unit, children }: FieldGroupProps) {
  const descriptions = [children.props["aria-describedby"], hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");
  const control = cloneElement(children, descriptions ? { "aria-describedby": descriptions } : {});

  return (
    <div className="cl-field-group" data-invalid={error ? "true" : undefined}>
      <label className="cl-field-label" htmlFor={id}>{label}</label>
      {hint ? <p className="cl-field-hint" id={`${id}-hint`}>{hint}</p> : null}
      <div className="cl-field-control">
        {control}
        {unit ? <span className="cl-field-unit">{unit}</span> : null}
      </div>
      {error ? <p className="cl-field-error" id={`${id}-error`} role="alert">{error}</p> : null}
    </div>
  );
}
