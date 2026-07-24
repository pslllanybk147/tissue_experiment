import { describe, expect, it } from "vitest";
import type { CloudinaryConfig } from "../cloudinary/config";
import { uploadPreprocessedImage } from "./cloudinary-preprocessed-uploader";

describe("preprocessed Cloudinary uploader", () => {
  it("uploads PNG bytes with a server-side signature", async () => {
    const config: CloudinaryConfig = { cloudName: "demo-cloud", apiKey: "demo-key", apiSecret: "demo-secret" };
    const calls: Request[] = [];
    const result = await uploadPreprocessedImage({ uid: "u1", lotId: "l1", observationId: "o1", datasetItemId: "d1", image: { buffer: Buffer.from("png"), format: "png", width: 224, height: 224, bytes: 3, sha256: "hash" }, config, fetcher: async (input, init) => { calls.push(new Request(input, init)); return new Response(JSON.stringify({ public_id: "preprocessed-d1", secure_url: "https://res.cloudinary.com/demo/image/upload/preprocessed-d1.png" }), { status: 200 }); } });
    expect(result.secureUrl).toContain("preprocessed-d1");
    expect(calls[0].url).toContain("api.cloudinary.com");
    expect(calls[0].method).toBe("POST");
  });
});
