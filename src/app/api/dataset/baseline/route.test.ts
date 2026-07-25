import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("baseline training route", () => {
  it("requires authentication", async () => {
    const response = await POST(new Request("http://localhost/api/dataset/baseline", { method: "POST", body: JSON.stringify({ jobId: "job-1" }) }));
    expect(response.status).toBe(401);
  });
});
