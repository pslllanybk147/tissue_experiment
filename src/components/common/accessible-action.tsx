"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type AccessibleActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  intent?: "primary" | "secondary" | "danger" | "photo";
};

const classByIntent = {
  primary: "cl-button-primary",
  secondary: "cl-button-secondary",
  danger: "cl-button-danger",
  photo: "cl-button-secondary",
} as const;

export function AccessibleAction({
  children,
  className = "",
  intent = "secondary",
  type = "button",
  ...buttonProps
}: AccessibleActionProps) {
  return (
    <button
      className={`${classByIntent[intent]} ${className}`.trim()}
      data-intent={intent}
      type={type}
      {...buttonProps}
    >
      {children}
      {buttonProps.disabled && buttonProps["aria-busy"] === true ? <span className="accessible-action-spinner" aria-hidden="true" /> : null}
    </button>
  );
}
