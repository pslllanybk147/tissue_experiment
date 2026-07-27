import { afterEach, describe, expect, it, vi } from "vitest";

import { demoStorageKey, readDemoState, writeDemoState } from "./demo-storage";

describe("demo storage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("persists and reloads JSON state when localStorage is available", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
    const key = demoStorageKey("demo-owner", "plants");
    writeDemoState(key, [{ id: "plant-1" }]);
    expect(readDemoState(key, [])).toEqual([{ id: "plant-1" }]);
  });

  it("falls back safely during server rendering", () => {
    vi.stubGlobal("window", undefined);
    expect(readDemoState("missing", ["fallback"])).toEqual(["fallback"]);
  });
});
