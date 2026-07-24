import { createHash } from "node:crypto";
import sharp from "sharp";
import { IMAGE_PREPROCESSING_CONTRACT, validatePreprocessingMetadata } from "../domain/dataset-preprocessing";
import type { DatasetItem } from "../domain/models";

export type PreprocessedImage = {
  buffer: Buffer;
  format: "png";
  width: 224;
  height: 224;
  bytes: number;
  sha256: string;
};

function assertSafeAssetUrl(assetUrl: string) {
  const url = new URL(assetUrl);
  if (url.protocol !== "https:") throw new Error("Image URL must use HTTPS");
  if (!url.hostname.endsWith("cloudinary.com")) throw new Error("Image host is not allowed");
}

export async function preprocessImageBuffer(input: Buffer): Promise<PreprocessedImage> {
  if (input.byteLength < 1 || input.byteLength > IMAGE_PREPROCESSING_CONTRACT.maxBytes) throw new Error("Image bytes are outside the supported range");
  const buffer = await sharp(input, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize(IMAGE_PREPROCESSING_CONTRACT.targetWidth, IMAGE_PREPROCESSING_CONTRACT.targetHeight, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();
  return { buffer, format: "png", width: 224, height: 224, bytes: buffer.byteLength, sha256: createHash("sha256").update(buffer).digest("hex") };
}

export async function preprocessDatasetItem(item: Pick<DatasetItem, "assetUrl" | "width" | "height" | "format" | "bytes">, fetcher: typeof fetch = fetch): Promise<PreprocessedImage> {
  const validation = validatePreprocessingMetadata(item);
  if (!validation.ready) throw new Error(`Image metadata invalid: ${validation.errors.join("; ")}`);
  assertSafeAssetUrl(item.assetUrl);
  const response = await fetcher(item.assetUrl);
  if (!response.ok) throw new Error(`Image download failed (${response.status})`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return preprocessImageBuffer(buffer);
}
