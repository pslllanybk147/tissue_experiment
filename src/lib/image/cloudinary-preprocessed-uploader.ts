import type { CloudinaryConfig } from "../cloudinary/config";
import { buildSignedUpload } from "../cloudinary/signature";
import type { PreprocessedImage } from "./image-preprocessor";

export type UploadedPreprocessedImage = { secureUrl: string; publicId: string };

export async function uploadPreprocessedImage(input: { uid: string; lotId: string; observationId: string; datasetItemId: string; image: PreprocessedImage; config: CloudinaryConfig; fetcher?: typeof fetch }): Promise<UploadedPreprocessedImage> {
  const signed = buildSignedUpload({ uid: input.uid, lotId: input.lotId, observationId: input.observationId, timestamp: Math.floor(Date.now() / 1000), apiSecret: input.config.apiSecret, createId: () => `preprocessed-${input.datasetItemId}` });
  const form = new FormData();
  form.set("file", new Blob([new Uint8Array(input.image.buffer)], { type: "image/png" }), `${signed.publicId}.png`);
  form.set("api_key", input.config.apiKey);
  form.set("timestamp", String(signed.timestamp));
  form.set("signature", signed.signature);
  form.set("folder", signed.folder);
  form.set("public_id", signed.publicId);
  const response = await (input.fetcher ?? fetch)(`https://api.cloudinary.com/v1_1/${input.config.cloudName}/image/upload`, { method: "POST", body: form });
  if (!response.ok) throw new Error(`Preprocessed artifact upload failed (${response.status})`);
  const body = await response.json() as { public_id?: string; secure_url?: string };
  if (!body.public_id || !body.secure_url) throw new Error("Cloudinary upload response is incomplete");
  return { publicId: body.public_id, secureUrl: body.secure_url };
}
