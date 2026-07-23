import { describe, expect, it } from "vitest";
import { GET, POST } from "./route";

describe("dataset preprocessing route", () => {
  it("requires authentication", async () => {
    const response = await POST(new Request("http://localhost/api/dataset/preprocess", { method: "POST", body: JSON.stringify({ exportId: "export-1" }) }));
    expect(response.status).toBe(401);
  });

  it("requires authentication when listing jobs", async () => {
    const response = await GET(new Request("http://localhost/api/dataset/preprocess?limit=20"));
    expect(response.status).toBe(401);
  });
});
