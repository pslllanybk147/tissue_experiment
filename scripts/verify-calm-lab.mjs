import { spawn, spawnSync } from "node:child_process";

const baseUrl = process.env.UI_BASE_URL ?? "http://localhost:3100";
let server = null;
let output = "";

async function ready() {
  try {
    const response = await fetch(baseUrl, { signal: AbortSignal.timeout(1_500) });
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await ready()) return;
  const windows = process.platform === "win32";
  server = spawn(windows ? "npm run dev -- --port 3100" : "npm", windows ? [] : ["run", "dev", "--", "--port", "3100"], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
    shell: windows,
  });
  server.stdout.on("data", (chunk) => { output = `${output}${chunk}`.slice(-4_000); });
  server.stderr.on("data", (chunk) => { output = `${output}${chunk}`.slice(-4_000); });
  for (let attempt = 0; attempt < 90; attempt += 1) {
    if (await ready()) return;
    if (server.exitCode !== null) throw new Error(`dev server exited with ${server.exitCode}: ${output}`);
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(`dev server did not become ready: ${output}`);
}

function stopServer() {
  if (!server?.pid) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
  else server.kill("SIGTERM");
}

function run(script) {
  const result = spawnSync(process.execPath, [script], {
    cwd: process.cwd(),
    env: { ...process.env, UI_BASE_URL: baseUrl },
    stdio: "inherit",
    windowsHide: true,
  });
  if (result.status !== 0) process.exitCode = result.status ?? 1;
  return result.status === 0;
}

try {
  await ensureServer();
  if (run("scripts/verify-protocol-integrity.mjs")) run("scripts/verify-accessible-ui.mjs");
} finally {
  stopServer();
}

if (process.exitCode) throw new Error("Calm Lab browser verification failed");
console.log("Calm Lab full browser verification passed");
