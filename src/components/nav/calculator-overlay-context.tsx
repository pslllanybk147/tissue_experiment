"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import {
  initialOverlayState,
  overlayReducer,
  type CalculatorScreen,
  type OverlayState,
} from "./overlay-state";

type CalculatorOverlayValue = {
  state: OverlayState;
  open: () => void;
  close: () => void;
  select: (screen: Exclude<CalculatorScreen, "picker">) => void;
  back: () => void;
};

const CalculatorOverlayContext = createContext<CalculatorOverlayValue | null>(null);

export function CalculatorOverlayProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  /** ใช้ในเทสต์ (และใน CalculatorOverlay เอง) เพื่อ render จอใดจอหนึ่งตรง ๆ โดยไม่ต้องจำลองคลิก */
  initialState?: OverlayState;
}) {
  const [state, dispatch] = useReducer(overlayReducer, initialState ?? initialOverlayState);

  const value: CalculatorOverlayValue = {
    state,
    open: () => dispatch({ type: "open" }),
    close: () => dispatch({ type: "close" }),
    select: (screen) => dispatch({ type: "select", screen }),
    back: () => dispatch({ type: "back" }),
  };

  return <CalculatorOverlayContext.Provider value={value}>{children}</CalculatorOverlayContext.Provider>;
}

export function useCalculatorOverlay(): CalculatorOverlayValue {
  const value = useContext(CalculatorOverlayContext);
  if (!value) throw new Error("useCalculatorOverlay must be used within CalculatorOverlayProvider");
  return value;
}
