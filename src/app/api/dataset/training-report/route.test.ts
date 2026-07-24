import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("training report route", () => {
  it("requires authentication", async () => {
    const response = await POST(new Request("http://localhost/api/dataset/training-report", { method: "POST", body: JSON.stringify({ jobId: "job-1" }) }));
    expect(response.status).toBe(401);
  });
});
