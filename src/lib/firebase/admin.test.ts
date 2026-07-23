import { describe, expect, it } from "vitest";
import { formatPrivateKey } from "./admin";

describe("formatPrivateKey", () => {
  it("formats single line private key without newlines into standard PEM format", () => {
    const singleLine = "-----BEGIN PRIVATE KEY-----MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDb12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345-----END PRIVATE KEY-----";
    const formatted = formatPrivateKey(singleLine);
    expect(formatted).toContain("-----BEGIN PRIVATE KEY-----\n");
    expect(formatted).toContain("\n-----END PRIVATE KEY-----\n");
    expect(formatted.split("\n").length).toBeGreaterThan(3);
  });

  it("handles literal \\n strings", () => {
    const literal = "-----BEGIN PRIVATE KEY-----\\nABCDEF\\n-----END PRIVATE KEY-----";
    const formatted = formatPrivateKey(literal);
    expect(formatted).toBe("-----BEGIN PRIVATE KEY-----\nABCDEF\n-----END PRIVATE KEY-----\n");
  });

  it("handles quotes around key string", () => {
    const quoted = '"-----BEGIN PRIVATE KEY-----\\nXYZ\\n-----END PRIVATE KEY-----"';
    const formatted = formatPrivateKey(quoted);
    expect(formatted).toBe("-----BEGIN PRIVATE KEY-----\nXYZ\n-----END PRIVATE KEY-----\n");
  });
});
