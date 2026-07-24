import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("dataset export route", () => {
  it("requires authentication", async () => {
    const response = await GET(new Request("http://localhost/api/dataset/export"));
    expect(response.status).toBe(401);
  });
});
