import { describe, expect, it } from "vitest";
import {
  oppositeTheme,
  resolveInitialTheme,
  themeToggleLabel,
} from "./theme";

describe("theme contract", () => {
  it.each([
    ["dark", false, "dark"],
    ["light", true, "light"],
    [null, true, "dark"],
    [null, false, "light"],
    ["invalid", true, "dark"],
  ] as const)("resolves stored=%s systemDark=%s", (stored, systemDark, expected) => {
    expect(resolveInitialTheme(stored, systemDark)).toBe(expected);
  });

  it.each([
    ["light", "dark"],
    ["dark", "light"],
  ] as const)("returns the opposite of %s", (theme, expected) => {
    expect(oppositeTheme(theme)).toBe(expected);
  });

  it.each([
    ["light", "เปลี่ยนเป็นโหมดมืด"],
    ["dark", "เปลี่ยนเป็นโหมดสว่าง"],
  ] as const)("labels the action from %s mode", (theme, expected) => {
    expect(themeToggleLabel(theme)).toBe(expected);
  });
});
