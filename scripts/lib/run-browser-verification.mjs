import { spawn, spawnSync } from "node:child_process";

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export function isPlantloverLabHtml(html) {
  return /<html\b[^>]*\blang=["']th["']/i.test(html) && /Plantlover Lab/i.test(html);
}

async function waitForExit(child, timeoutMs) {
  const exited = () => child.exitCode !== null || child.signalCode !== null;
  if (exited()) return true;
  const observed = await Promise.race([
    new Promise((resolve) => child.once("exit", () => resolve(true))),
    wait(timeoutMs).then(() => false),
  ]);
  return observed || exited();
}

export function createServerLifecycle({
  baseUrl,
  externalTarget = false,
  fetchImpl = fetch,
  spawnImpl = spawn,
  spawnSyncImpl = spawnSync,
  processRef = process,
} = {}) {
  let server = null;
  let output = "";
  let ownsServer = false;
  let serverDetached = false;
  let stopPromise = null;

  async function ready() {
    try {
      const response = await fetchImpl(new URL("/", baseUrl), { signal: AbortSignal.timeout(1_500) });
      if (!response.ok) return false;
      return externalTarget || isPlantloverLabHtml(await response.text());
    } catch {
      return false;
    }
  }

  async function ensureServer() {
    if (await ready()) return;
    if (externalTarget) throw new Error(`External UI target unavailable: ${baseUrl}`);
    const windows = processRef.platform === "win32";
    serverDetached = !windows;
    server = spawnImpl(
      windows ? "npm run dev -- --port 3100" : "npm",
      windows ? [] : ["run", "dev", "--", "--port", "3100"],
      {
        cwd: processRef.cwd(),
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
        shell: windows,
        detached: serverDetached,
      },
    );
    ownsServer = true;
    server.stdout?.on("data", (chunk) => { output = `${output}${chunk}`.slice(-4_000); });
    server.stderr?.on("data", (chunk) => { output = `${output}${chunk}`.slice(-4_000); });
    for (let attempt = 0; attempt < 90; attempt += 1) {
      if (await ready()) return;
      if (server.exitCode !== null || server.signalCode !== null) {
        throw new Error(`dev server terminated before readiness (exitCode=${server.exitCode}, signalCode=${server.signalCode}): ${output}`);
      }
      await wait(1_000);
    }
    throw new Error(`dev server did not become ready as Plantlover Lab: ${output}`);
  }

  async function stopOwnedServer() {
    if (!ownsServer || !server?.pid) return;
    if (stopPromise) return stopPromise;
    stopPromise = (async () => {
      ownsServer = false;
      if (processRef.platform === "win32") {
        spawnSyncImpl("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
          stdio: "ignore",
          windowsHide: true,
        });
        return;
      }
      if (server.exitCode !== null || server.signalCode !== null) return;
      const target = serverDetached ? -server.pid : server.pid;
      try { processRef.kill(target, "SIGTERM"); } catch {}
      if (!await waitForExit(server, 3_000)
        && server.exitCode === null && server.signalCode === null) {
        try { processRef.kill(target, "SIGKILL"); } catch {}
        await waitForExit(server, 1_000);
      }
    })();
    return stopPromise;
  }

  return { ensureServer, ownsServer: () => ownsServer, stopOwnedServer };
}

export function installProcessCleanupHandlers(cleanup, processRef = process) {
  let cleanupPromise = null;
  const cleanOnce = () => cleanupPromise ??= Promise.resolve().then(cleanup);
  const signalHandlers = new Map([
    ["SIGINT", () => { void cleanOnce().finally(() => processRef.exit(130)); }],
    ["SIGTERM", () => { void cleanOnce().finally(() => processRef.exit(143)); }],
  ]);
  const uncaught = (error) => {
    void cleanOnce().finally(() => {
      console.error(error);
      processRef.exit(1);
    });
  };
  const unhandled = (reason) => uncaught(reason);
  for (const [event, handler] of signalHandlers) processRef.once(event, handler);
  processRef.once("uncaughtException", uncaught);
  processRef.once("unhandledRejection", unhandled);
  return () => {
    for (const [event, handler] of signalHandlers) processRef.removeListener(event, handler);
    processRef.removeListener("uncaughtException", uncaught);
    processRef.removeListener("unhandledRejection", unhandled);
  };
}

export function runChildScript(script, { baseUrl }) {
  return spawnSync(process.execPath, [script], {
    cwd: process.cwd(),
    env: { ...process.env, UI_BASE_URL: baseUrl },
    stdio: "inherit",
    windowsHide: true,
  });
}

function childExitCode(result) {
  return Number.isInteger(result?.status) && result.status >= 0 ? result.status : 1;
}

export async function runBrowserVerification({
  scripts,
  label = "Browser",
  baseUrl = "http://localhost:3100",
  externalTarget = false,
  lifecycle = createServerLifecycle({ baseUrl, externalTarget }),
  childRunner = runChildScript,
  installHandlers = installProcessCleanupHandlers,
}) {
  let cleanupPromise = null;
  const cleanup = () => {
    if (!lifecycle.ownsServer()) return Promise.resolve();
    return cleanupPromise ??= lifecycle.stopOwnedServer();
  };
  const removeHandlers = installHandlers(cleanup);
  let exitCode = 0;
  try {
    await lifecycle.ensureServer();
    for (const script of scripts) {
      const result = await childRunner(script, { baseUrl });
      exitCode = childExitCode(result);
      if (exitCode !== 0) break;
    }
  } finally {
    try {
      await cleanup();
    } finally {
      removeHandlers();
    }
  }
  if (exitCode === 0) console.log(`${label} browser verification passed`);
  else console.error(`${label} browser verification failed (exit ${exitCode})`);
  return exitCode;
}
