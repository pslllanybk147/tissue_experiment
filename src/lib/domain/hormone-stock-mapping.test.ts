import { describe, expect, it } from "vitest";
import { stockIdForIngredient } from "./hormone-stock-mapping";

describe("stockIdForIngredient", () => {
  it.each([
    ["BA", "ba"],
    ["6-BA", "ba"],
    ["BAP", "bap"],
    ["6-BA (BAP)", "bap"],
    ["NAA", "naa"],
    ["IBA", "iba"],
  ] as const)("maps %s to %s stock", (name, stock) => {
    expect(stockIdForIngredient(name)).toBe(stock);
  });

  it("does not guess from partial or unrelated names", () => {
    expect(stockIdForIngredient("BAP blend")).toBeNull();
    expect(stockIdForIngredient("IAA")).toBeNull();
  });
});
