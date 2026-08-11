import { describe, expect, it } from "vitest";

const helpers = await import("./lib/ui-verification-helpers.mjs").catch(() => null);

describe("UI verification viewport selection", () => {
  it("uses canonical acceptance names by default without duplicate dimensions", () => {
    expect(helpers).not.toBeNull();
    if (!helpers) return;
    const selected = helpers.selectViewports();
    const names = selected.map((item: { name: string }) => item.name);
    expect(names).toEqual(expect.arrayContaining(["desktop", "tablet-wide", "tablet", "mobile", "minimum-mobile"]));
    expect(names).not.toContain("iphone-12");
    expect(new Set(selected.map((item: { width: number; height: number }) => `${item.width}x${item.height}`)).size).toBe(selected.length);
  });

  it("resolves the legacy iphone-12 alias explicitly", () => {
    expect(helpers).not.toBeNull();
    if (!helpers) return;
    expect(helpers.selectViewports("iphone-12")).toEqual([
      { name: "iphone-12", width: 390, height: 844, aliasFor: "mobile" },
    ]);
  });

  it("preserves the legacy taller tablet coverage", () => {
    expect(helpers).not.toBeNull();
    if (!helpers) return;
    expect(helpers.selectViewports()).toEqual(expect.arrayContaining([
      { name: "ipad-9", width: 768, height: 1024 },
      { name: "ipad-pro-12", width: 1024, height: 1366 },
    ]));
  });

  it("rejects an unknown viewport selector", () => {
    expect(helpers).not.toBeNull();
    if (!helpers) return;
    expect(() => helpers.selectViewports("not-a-viewport")).toThrow("Unknown UI_VIEWPORT: not-a-viewport");
  });
});
