import { describe, expect, it } from "vitest";
import { analyzeImageFeature, isVariegatedPixel } from "./image-analyzer";

describe("Image Analyzer", () => {
  it("detects variegated pixels correctly (white, cream, pink)", () => {
    // Pure green leaf pixel
    expect(isVariegatedPixel(30, 100, 30)).toBe(false);

    // Pink variegation pixel (high red, low green)
    expect(isVariegatedPixel(240, 150, 180)).toBe(true);

    // White variegation pixel (high brightness across RGB)
    expect(isVariegatedPixel(240, 240, 235)).toBe(true);

    // Yellow variegation pixel (high red and green, low blue)
    expect(isVariegatedPixel(230, 220, 90)).toBe(true);
  });

  it("calculates variegation percentage and dominant colors from pixel array", () => {
    const greenPixel: [number, number, number] = [30, 120, 30];
    const pinkPixel: [number, number, number] = [240, 150, 180];
    const whitePixel: [number, number, number] = [245, 245, 240];

    // 1 green, 1 pink, 2 white -> 3/4 variegated = 75%
    const pixels = [greenPixel, pinkPixel, whitePixel, whitePixel];
    const result = analyzeImageFeature(pixels);

    expect(result.variegationPercentage).toBe(75);
    expect(result.dominantColors.length).toBeGreaterThan(0);
    expect(result.dominantColors[0]).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});
