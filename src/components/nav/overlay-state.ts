export type CalculatorScreen = "picker" | "medium" | "working-stock" | "haiter";

export type OverlayState = {
  isOpen: boolean;
  screen: CalculatorScreen;
};

export type OverlayAction =
  | { type: "open" }
  | { type: "close" }
  | { type: "select"; screen: Exclude<CalculatorScreen, "picker"> }
  | { type: "back" };

export const initialOverlayState: OverlayState = { isOpen: false, screen: "picker" };

export function overlayReducer(state: OverlayState, action: OverlayAction): OverlayState {
  switch (action.type) {
    case "open":
      return { isOpen: true, screen: "picker" };
    case "close":
      return { isOpen: false, screen: "picker" };
    case "select":
      return { ...state, screen: action.screen };
    case "back":
      return { ...state, screen: "picker" };
    default:
      return state;
  }
}
