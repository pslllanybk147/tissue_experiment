import type { ReactNode } from "react";

export type ActionBarProps = {
  primary: ReactNode;
  secondary?: ReactNode;
  sticky?: boolean;
};

export function ActionBar({ primary, secondary, sticky = false }: ActionBarProps) {
  return (
    <div className="cl-action-bar" data-sticky={sticky ? "true" : undefined}>
      {secondary ? <div className="cl-action-secondary">{secondary}</div> : null}
      <div className="cl-action-primary">{primary}</div>
    </div>
  );
}
