import { runBrowserVerification } from "./lib/run-browser-verification.mjs";

const exitCode = await runBrowserVerification({
  scripts: ["scripts/verify-protocol-integrity.mjs", "scripts/verify-accessible-ui.mjs"],
  label: "Botanical Atlas",
  baseUrl: process.env.UI_BASE_URL ?? "http://localhost:3100",
  externalTarget: Boolean(process.env.UI_BASE_URL),
});
process.exitCode = exitCode;
