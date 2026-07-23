export type ImageAnalysisResult = {
  variegationPercentage: number;
  dominantColors: string[];
};

export function isVariegatedPixel(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  // White / Off-white / Cream
  if (r > 200 && g > 200 && b > 190) {
    return true;
  }

  // Pink / Magenta variegation (high red & blue compared to green)
  if (r > 180 && r > g + 40 && b > 120) {
    return true;
  }

  // Yellow / Mustard variegation (high red & green, low blue)
  if (r > 180 && g > 170 && b < 140) {
    return true;
  }

  // Pale / Chlorotic variegation (high overall brightness, low saturation)
  if (max > 180 && (max - min) < 40) {
    return true;
  }

  return false;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => Math.min(255, Math.max(0, Math.round(c))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function analyzeImageFeature(pixels: [number, number, number][]): ImageAnalysisResult {
  if (!pixels.length) {
    return { variegationPercentage: 0, dominantColors: ["#000000"] };
  }

  let variegatedCount = 0;
  const colorBuckets: Record<string, number> = {};

  for (const [r, g, b] of pixels) {
    if (isVariegatedPixel(r, g, b)) {
      variegatedCount++;
    }

    // Bucket into 32-level color step for dominant color calculation
    const qr = Math.floor(r / 32) * 32 + 16;
    const qg = Math.floor(g / 32) * 32 + 16;
    const qb = Math.floor(b / 32) * 32 + 16;
    const hex = rgbToHex(qr, qg, qb);

    colorBuckets[hex] = (colorBuckets[hex] || 0) + 1;
  }

  const variegationPercentage = Math.round((variegatedCount / pixels.length) * 100);

  const dominantColors = Object.entries(colorBuckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([hex]) => hex);

  return {
    variegationPercentage,
    dominantColors: dominantColors.length > 0 ? dominantColors : ["#1b4332"]
  };
}
