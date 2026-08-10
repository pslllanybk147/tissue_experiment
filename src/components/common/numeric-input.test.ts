import { describe, expect, it } from "vitest";
import { displayNumericValue, parseNumericDraft } from "./numeric-input";

describe("numeric input draft helpers", () => {
  it("keeps an empty draft empty instead of turning it into zero", () => {
    expect(parseNumericDraft("")).toBeNaN();
    expect(parseNumericDraft("   ")).toBeNaN();
    expect(displayNumericValue(Number.NaN)).toBe("");
  });

  it("preserves valid numeric drafts", () => {
    expect(parseNumericDraft("12.5")).toBe(12.5);
    expect(displayNumericValue(12.5)).toBe("12.5");
  });
});
