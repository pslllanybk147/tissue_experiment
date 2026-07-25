import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("baseline training run list route", () => {
  it("requires authentication", async () => {
    const response = await GET(new Request("http://localhost/api/dataset/baseline?limit=10"));
    expect(response.status).toBe(401);
  });
});
