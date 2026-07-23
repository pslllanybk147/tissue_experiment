import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("dataset intake route", () => {
  it("requires authentication before inspecting a media target", async () => {
    const response = await POST(new Request("http://localhost/api/dataset/intake", { method: "POST", body: JSON.stringify({ lotId: "LOT-1", observationId: "OBS-1", mediaId: "MEDIA-1" }) }));
    expect(response.status).toBe(401);
  });

  it("rejects malformed target ids", async () => {
    const response = await POST(new Request("http://localhost/api/dataset/intake", { method: "POST", headers: { authorization: "Bearer invalid" }, body: JSON.stringify({ lotId: "", observationId: "OBS-1", mediaId: "MEDIA-1" }) }));
    expect(response.status).toBe(401);
  });
});
