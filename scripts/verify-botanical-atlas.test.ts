import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";

const runnerModule = await import("./lib/run-browser-verification.mjs").catch(() => null);

function lifecycle(ownsServer = true) {
  let stopped = 0;
  return {
    ensureServer: async () => {},
    ownsServer: () => ownsServer,
    stopOwnedServer: async () => { stopped += 1; },
    stopped: () => stopped,
  };
}

describe("shared browser verification runner", () => {
  it("short-circuits UI verification when protocol verification fails", async () => {
    expect(runnerModule).not.toBeNull();
    if (!runnerModule) return;
    const calls: string[] = [];
    const server = lifecycle();
    const exitCode = await runnerModule.runBrowserVerification({
      scripts: ["protocol", "ui"],
      baseUrl: "http://example.test",
      lifecycle: server,
      childRunner: (script: string) => {
        calls.push(script);
        return { status: script === "protocol" ? 7 : 0, signal: null };
      },
      installHandlers: () => () => {},
    });

    expect(exitCode).toBe(7);
    expect(calls).toEqual(["protocol"]);
    expect(server.stopped()).toBe(1);
  });

  it.each([
    [{ status: 9, signal: null }, 9],
    [{ status: null, signal: null }, 1],
    [{ status: null, signal: "SIGTERM" }, 1],
  ])("propagates failed UI child results %#", async (result, expected) => {
    expect(runnerModule).not.toBeNull();
    if (!runnerModule) return;
    const server = lifecycle();
    const exitCode = await runnerModule.runBrowserVerification({
      scripts: ["protocol", "ui"],
      baseUrl: "http://example.test",
      lifecycle: server,
      childRunner: (script: string) => script === "protocol"
        ? { status: 0, signal: null }
        : result,
      installHandlers: () => () => {},
    });

    expect(exitCode).toBe(expected);
    expect(server.stopped()).toBe(1);
  });

  it("does not stop an externally owned server", async () => {
    expect(runnerModule).not.toBeNull();
    if (!runnerModule) return;
    const server = lifecycle(false);
    const exitCode = await runnerModule.runBrowserVerification({
      scripts: ["protocol", "ui"],
      baseUrl: "http://external.test",
      lifecycle: server,
      childRunner: () => ({ status: 0, signal: null }),
      installHandlers: () => () => {},
    });

    expect(exitCode).toBe(0);
    expect(server.stopped()).toBe(0);
  });

  it("accepts an available explicit external target without spawning", async () => {
    expect(runnerModule).not.toBeNull();
    if (!runnerModule) return;
    const spawnImpl = vi.fn();
    const server = runnerModule.createServerLifecycle({
      baseUrl: "https://external.test/base",
      externalTarget: true,
      fetchImpl: async () => ({ ok: true, text: async () => "external" }),
      spawnImpl,
    });

    await server.ensureServer();
    expect(spawnImpl).not.toHaveBeenCalled();
    expect(server.ownsServer()).toBe(false);
  });

  it("rejects an unavailable explicit external target without spawning", async () => {
    expect(runnerModule).not.toBeNull();
    if (!runnerModule) return;
    const spawnImpl = vi.fn();
    const server = runnerModule.createServerLifecycle({
      baseUrl: "https://external.test/base",
      externalTarget: true,
      fetchImpl: async () => ({ ok: false, text: async () => "" }),
      spawnImpl,
    });

    await expect(server.ensureServer()).rejects.toThrow("External UI target unavailable: https://external.test/base");
    expect(spawnImpl).not.toHaveBeenCalled();
  });

  it("does not signal a POSIX child that has already exited by signal", async () => {
    expect(runnerModule).not.toBeNull();
    if (!runnerModule) return;
    const child = Object.assign(new EventEmitter(), {
      pid: 4321,
      exitCode: null,
      signalCode: "SIGTERM",
      stdout: new EventEmitter(),
      stderr: new EventEmitter(),
    });
    let fetchCount = 0;
    const kill = vi.fn();
    const server = runnerModule.createServerLifecycle({
      baseUrl: "http://localhost:3100",
      fetchImpl: async () => ({
        ok: ++fetchCount > 1,
        text: async () => '<html lang="th">Plantlover Lab</html>',
      }),
      spawnImpl: () => child,
      processRef: { platform: "linux", cwd: () => process.cwd(), kill },
    });

    await server.ensureServer();
    await server.stopOwnedServer();
    expect(kill).not.toHaveBeenCalled();
  });

  it("rejects immediately when the dev server exits by signal before readiness", async () => {
    expect(runnerModule).not.toBeNull();
    if (!runnerModule) return;
    const child = Object.assign(new EventEmitter(), {
      pid: 4321,
      exitCode: null,
      signalCode: "SIGTERM",
      stdout: new EventEmitter(),
      stderr: new EventEmitter(),
    });
    let fetchCount = 0;
    const server = runnerModule.createServerLifecycle({
      baseUrl: "http://localhost:3100",
      fetchImpl: async () => ({
        ok: ++fetchCount > 2,
        text: async () => '<html lang="th">Plantlover Lab</html>',
      }),
      spawnImpl: () => child,
      processRef: { platform: "linux", cwd: () => process.cwd(), kill: vi.fn() },
    });

    await expect(server.ensureServer()).rejects.toThrow("exitCode=null, signalCode=SIGTERM");
    expect(fetchCount).toBe(2);
  });

  it("targets the negative process group only for its detached POSIX child", async () => {
    expect(runnerModule).not.toBeNull();
    if (!runnerModule) return;
    const child = Object.assign(new EventEmitter(), {
      pid: 4321,
      exitCode: null,
      signalCode: null,
      stdout: new EventEmitter(),
      stderr: new EventEmitter(),
    });
    let fetchCount = 0;
    let spawnOptions: { detached?: boolean } | undefined;
    const kill = vi.fn((target: number, signal: string) => {
      child.signalCode = signal;
      child.emit("exit");
    });
    const server = runnerModule.createServerLifecycle({
      baseUrl: "http://localhost:3100",
      fetchImpl: async () => ({
        ok: ++fetchCount > 1,
        text: async () => '<html lang="th">Plantlover Lab</html>',
      }),
      spawnImpl: (_command: string, _args: string[], options: { detached?: boolean }) => {
        spawnOptions = options;
        return child;
      },
      processRef: { platform: "linux", cwd: () => process.cwd(), kill },
    });

    await server.ensureServer();
    await server.stopOwnedServer();
    expect(spawnOptions?.detached).toBe(true);
    expect(kill).toHaveBeenCalledTimes(1);
    expect(kill).toHaveBeenCalledWith(-4321, "SIGTERM");
  });

  it("keeps cleanup handlers installed until owned cleanup resolves", async () => {
    expect(runnerModule).not.toBeNull();
    if (!runnerModule) return;
    const events: string[] = [];
    let releaseStop = () => {};
    const stopGate = new Promise<void>((resolve) => { releaseStop = resolve; });
    const server = {
      ensureServer: async () => {},
      ownsServer: () => true,
      stopOwnedServer: async () => {
        events.push("stop:start");
        await stopGate;
        events.push("stop:end");
      },
    };
    const runPromise = runnerModule.runBrowserVerification({
      scripts: ["protocol"],
      lifecycle: server,
      childRunner: () => ({ status: 0, signal: null }),
      installHandlers: () => () => { events.push("handlers:removed"); },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(events).toEqual(["stop:start"]);
    releaseStop();
    await runPromise;
    expect(events).toEqual(["stop:start", "stop:end", "handlers:removed"]);
  });

  it("recognizes only the Plantlover Lab HTML sentinel", () => {
    expect(runnerModule).not.toBeNull();
    if (!runnerModule) return;
    expect(runnerModule.isPlantloverLabHtml('<html lang="th"><title>Plantlover Lab</title></html>')).toBe(true);
    expect(runnerModule.isPlantloverLabHtml('<html lang="en"><title>Plantlover Lab</title></html>')).toBe(false);
    expect(runnerModule.isPlantloverLabHtml('<html lang="th"><title>Another app</title></html>')).toBe(false);
  });
});
