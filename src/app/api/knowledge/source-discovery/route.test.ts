import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("source discovery route", () => {
  it("requires authentication before external lookup", async () => {
    const response = await POST(new Request("http://localhost/api/knowledge/source-discovery", { method: "POST", body: JSON.stringify({ identifier: "10.1000/example" }) }));
    expect(response.status).toBe(401);
  });
});
