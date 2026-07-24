import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { preprocessDatasetItem, preprocessImageBuffer } from "./image-preprocessor";

async function sampleBuffer() {
  return sharp({ create: { width: 480, height: 320, channels: 3, background: { r: 20, g: 140, b: 80 } } }).jpeg().toBuffer();
}

describe("image preprocessor", () => {
  it("decodes and normalizes an image to the contract size", async () => {
    const result = await preprocessImageBuffer(await sampleBuffer());
    expect(result).toMatchObject({ format: "png", width: 224, height: 224 });
    expect(result.bytes).toBeGreaterThan(0);
    expect(result.sha256).toHaveLength(64);
  });

  it("rejects non-Cloudinary URLs before download", async () => {
    await expect(preprocessDatasetItem({ assetUrl: "https://example.com/image.jpg", width: 480, height: 320, format: "jpg", bytes: 1000 }, async () => { throw new Error("must not fetch"); })).rejects.toThrow("host is not allowed");
  });

  it("downloads and preprocesses an approved image URL", async () => {
    const source = await sampleBuffer();
    const result = await preprocessDatasetItem({ assetUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg", width: 480, height: 320, format: "jpg", bytes: source.byteLength }, async () => new Response(source, { status: 200 }));
    expect(result.width).toBe(224);
  });
});
