"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type AccessibleActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  intent?: "primary" | "secondary" | "danger" | "photo";
};

export function AccessibleAction({
  children,
  className = "",
  intent = "secondary",
  type = "button",
  ...buttonProps
}: AccessibleActionProps) {
  return (
    <button
      className={`accessible-action accessible-action-${intent} ${className}`.trim()}
      data-intent={intent}
      type={type}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
