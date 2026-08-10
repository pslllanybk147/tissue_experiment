import { spawn, spawnSync } from "node:child_process";
import { chromium } from "playwright";

const baseUrl = process.env.UI_BASE_URL ?? "http://localhost:3100";
const executablePath = process.env.CHROME_PATH
  ?? (process.platform === "win32" ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" : undefined);
const allCases = [
  { medium: "pressure-sterilization", surface: "haiter-chemical", rinse: "commercial-sterile" },
  { medium: "haiter-chemical", surface: "haiter-chemical", rinse: "low-dose-hypochlorite" },
  { medium: "nadcc-chemical", surface: "nadcc-soak", rinse: "commercial-sterile" },
];
const allViewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1000 },
];
const cases = process.env.PROTOCOL_CASE
  ? allCases.filter((item) => tupleLabel(item) === process.env.PROTOCOL_CASE)
  : allCases;
const viewports = process.env.PROTOCOL_VIEWPORT
  ? allViewports.filter((item) => item.name === process.env.PROTOCOL_VIEWPORT)
  : allViewports;

let server = null;
let serverOutput = "";
let currentConsoleErrors = [];
let active = { route: "startup", viewport: "none", theme: "none", tuple: "none", lastAction: "none" };

function tupleLabel(item) {
  return `${item.medium}/${item.surface}/${item.rinse}`;
}

function fail(message) {
  throw new Error(`${message}\ncontext=${JSON.stringify(active)}`);
}

async function serverReady() {
  try {
    const response = await fetch(baseUrl, { signal: AbortSignal.timeout(1_500) });
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await serverReady()) return;
  const windows = process.platform === "win32";
  server = spawn(windows ? "npm run dev -- --port 3100" : "npm", windows ? [] : ["run", "dev", "--", "--port", "3100"], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
    shell: windows,
  });
  server.stdout.on("data", (chunk) => { serverOutput = `${serverOutput}${chunk}`.slice(-4_000); });
  server.stderr.on("data", (chunk) => { serverOutput = `${serverOutput}${chunk}`.slice(-4_000); });
  for (let attempt = 0; attempt < 90; attempt += 1) {
    if (await serverReady()) return;
    if (server.exitCode !== null) fail(`dev server exited with ${server.exitCode}: ${serverOutput}`);
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  fail(`dev server did not become ready: ${serverOutput}`);
}

function stopServer() {
  if (!server?.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
  } else {
    server.kill("SIGTERM");
  }
}

async function navigate(page, route, action) {
  active.route = route;
  active.lastAction = action;
  await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 20_000 });
  await page.locator("main").first().waitFor({ state: "visible", timeout: 15_000 });
}

async function enterDemo(page) {
  await navigate(page, "/my", "open demo gate");
  const demo = page.getByRole("button", { name: "Continue in demo mode" });
  const shell = page.locator(".lab-route-shell");
  await shell.or(demo).waitFor({ state: "visible", timeout: 15_000 });
  if (!await shell.isVisible().catch(() => false)) await demo.click();
  await shell.waitFor({ state: "visible", timeout: 15_000 });
  active.lastAction = "entered demo mode";
}

async function createRound(page, item) {
  if (item.medium === "pressure-sterilization") {
    active.lastAction = "seed pressure-cooker browser fixture";
    await page.evaluate(() => {
      const key = "philodendron-lab:demo:demo-owner:equipment:v1";
      const current = JSON.parse(localStorage.getItem(key) ?? "null") ?? {
        schemaVersion: 2,
        owned: ["pressure-cooker", "bleach", "nadcc-tablet"],
        scaleMinimumMg: 10,
        pipetteMinimumMl: 0.1,
        msLabelRateGPerL: 4.43,
        naaStockMgPerMl: 1,
        baStockMgPerMl: 1,
        bapStockMgPerMl: 1,
        ibaStockMgPerMl: 1,
        msRateGPerL: 4.43,
        chemicals: {
          nadcc: { form: "effervescent-tablet", availableChlorinePercent: 60, tabletMassG: 5.4, nadccMassGPerTablet: 2.97, tabletCount: 15, labelText: "NaDCC 60%", batchOrLot: "N-fixture" },
          bleach: { productName: "Haiter", percentWw: 6, batchOrLot: "H-fixture" },
          alcohol: { percent: 70 },
        },
        water: { sourcePpm: 15, sterile: false, sterilizationMethod: null },
        rinseWater: { lowDoseHypochlorite: null, nadcc: null },
        instruments: { balanceResolutionG: 0.01, foodScaleResolutionG: 0.1, syringeResolutionMl: 0.1, phMeter: true },
        containers: { cultureJar50Ml: 12, glassJar250Ml: 2 },
        workspace: { sab: true, plasticRoom: false, openFlameFuelAvailable: false },
        medium: { msRateGPerL: 4.43, whiteSugarFoodGrade: true, phUpDown: true, naaMgPerMl: 1, baMgPerMl: 1, bapMgPerMl: 1, ibaMgPerMl: 1, agarBrand: "fixture", sterilizationMethod: null },
        phone: { model: "fixture", available: true },
        inventory: [],
      };
      current.owned = [...new Set([...(current.owned ?? []), "pressure-cooker", "bleach", "nadcc-tablet"] )];
      localStorage.setItem(key, JSON.stringify(current));
    });
  }
  active.lastAction = "return home by client link";
  await page.locator("a[href='/']:visible").first().click();
  await page.waitForURL((url) => url.pathname === "/", { timeout: 15_000 });
  active.route = "/";
  active.lastAction = "open guide by client link";
  await page.locator("a[href='/guide/pink-princess']").first().click();
  await page.waitForURL("**/guide/pink-princess", { timeout: 15_000 });
  active.route = "/guide/pink-princess";
  active.lastAction = "click start-round client link";
  await page.getByRole("link", { name: "เริ่มรอบเพาะของฉัน" }).click();
  await page.waitForURL("**/my/rounds/new?slug=pink-princess", { timeout: 15_000 });
  active.route = new URL(page.url()).pathname;
  await page.getByText("ตั้งค่ารอบก่อนเริ่ม").waitFor({ state: "visible" });

  const selections = [
    ["อาหารและกระปุก", item.medium],
    ["ฟอกผิวชิ้นพืช", item.surface],
    ["น้ำล้างหลังฟอก", item.rinse],
  ];
  for (const [group, method] of selections) {
    active.lastAction = `select ${method}`;
    const choice = page.getByRole("group", { name: group }).locator(`button[data-method='${method}']:not([disabled])`);
    if (!await choice.count()) fail(`method choice ${method} is unavailable`);
    await choice.evaluate((element) => element.click());
    await choice.waitFor({ state: "visible" });
    if (await choice.getAttribute("aria-pressed") !== "true") fail(`${method} did not become selected`);
  }
  active.lastAction = "confirm round setup";
  await page.getByRole("button", { name: "ยืนยันและเข้า protocol" }).evaluate((element) => element.click());
  await page.waitForURL((url) => /^\/my\/rounds\/(?!new$)[^/]+$/.test(url.pathname), { timeout: 15_000 });
  active.route = new URL(page.url()).pathname;
  await page.getByText(/ผ่านแล้ว 0 จาก/).waitFor({ state: "visible" });
  return active.route.split("/").at(-1);
}

async function openStep(page, roundId, stepNumber, action) {
  const route = `/my/rounds/${roundId}`;
  if (new URL(page.url()).pathname !== route) {
    active.lastAction = "return to round overview by client link";
    await page.locator(`a[href='${route}']:visible`).first().click();
    await page.waitForURL(`**${route}`, { timeout: 15_000 });
    active.route = route;
  }
  active.lastAction = action;
  await page.locator(`a[href='/my/rounds/${roundId}/step/${stepNumber}']`).click();
  await page.waitForURL(`**/my/rounds/${roundId}/step/${stepNumber}`, { timeout: 15_000 });
  active.route = new URL(page.url()).pathname;
  await page.getByText(/ขั้นที่ .* จาก/).waitFor({ state: "visible" });
}

async function assertMethodSurface(page, item, step) {
  const body = await page.locator("body").innerText();
  if (step === "prep") {
    if (item.medium === "pressure-sterilization") {
      if (body.includes("ยืนยันการเตรียมสาร")) fail("pressure medium unexpectedly renders a chemical editor");
    } else if (item.medium === "haiter-chemical") {
      if (!body.includes("haiter-medium-v1")) fail("Haiter medium protocol is missing");
      if (body.includes("NaDCC (เม็ดคลอรีน)")) fail("NaDCC calculator leaked into Haiter medium");
    } else {
      if (!body.includes("nadcc-medium-v1")) fail("NaDCC medium protocol is missing");
      if (body.includes("ไฮเตอร์ / สารฟอกฆ่าเชื้อ")) fail("Haiter calculator leaked into NaDCC medium");
    }
    return;
  }
  if (item.surface === "nadcc-soak") {
    if (!body.includes("24 ถึง 48 ชั่วโมง")) fail("NaDCC soak duration is missing");
    if (/Haiter|ไฮเตอร์|NaOCl|NaClO/.test(body)) fail("Haiter instructions leaked into NaDCC soak");
  } else {
    if (!body.includes("haiter-surface-v1")) fail("Haiter surface protocol is missing");
    if (body.includes("24 ถึง 48 ชั่วโมง")) fail("NaDCC soak instructions leaked into Haiter surface");
  }
  for (const rinse of ["R1", "R2", "R3"]) if (!body.includes(rinse)) fail(`${rinse} is missing`);
  if (/R4|final rinse/i.test(body)) fail("forbidden R4/final rinse instruction is present");
}

async function confirmAndReloadPreparation(page, item, marker) {
  const editor = page.getByRole("heading", { name: "ยืนยันการเตรียมสาร" });
  if (!await editor.count()) return;
  const editorSection = editor.locator("xpath=ancestor::section[1]");
  const target = item.surface === "nadcc-soak" || item.medium === "nadcc-chemical" ? "300" : "10000";
  const values = {
    product: `Product-${marker}`,
    batch: `Batch-${marker}`,
    volume: "1000",
    dose: "1.25",
    ppm: "299",
    prepared: "2026-08-10T09:30",
  };
  await page.getByLabel("ผลิตภัณฑ์", { exact: true }).fill(values.product);
  await page.getByLabel("Batch / lot", { exact: true }).fill(values.batch);
  await page.getByLabel("เป้าหมาย (ppm)", { exact: true }).fill(target);
  await page.getByLabel("ปริมาตรสุดท้าย (mL)", { exact: true }).fill(values.volume);
  await page.getByLabel("วันเวลาที่เตรียม", { exact: true }).fill(values.prepared);
  await editorSection.locator("select").first().selectOption("verified");
  await editorSection.getByText(/ค่าคำนวณล่าสุด:/).waitFor({ state: "visible", timeout: 15_000 });
  await page.getByLabel(/ปริมาณที่ใช้จริง/).fill(values.dose);
  await page.getByLabel("ความเข้มข้นที่ตรวจได้จริง (ppm)", { exact: true }).fill(values.ppm);
  active.lastAction = "confirm preparation values";
  await page.getByRole("button", { name: "บันทึก preparation snapshot" }).click();
  const feedback = editorSection.locator("[role='status']");
  await feedback.waitFor({ state: "visible", timeout: 15_000 });
  const feedbackText = await feedback.innerText();
  if (feedbackText !== "บันทึก preparation snapshot แล้ว") fail(`preparation confirmation failed: ${feedbackText}`);
  active.lastAction = "reload persisted preparation";
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "ยืนยันการเตรียมสาร" }).waitFor({ state: "visible" });
  const checks = [
    ["ผลิตภัณฑ์", values.product], ["Batch / lot", values.batch], ["ปริมาตรสุดท้าย (mL)", values.volume],
    ["ปริมาณที่ใช้จริง", values.dose], ["ความเข้มข้นที่ตรวจได้จริง (ppm)", values.ppm], ["วันเวลาที่เตรียม", values.prepared],
  ];
  for (const [label, expected] of checks) {
    const field = page.getByLabel(label === "ปริมาณที่ใช้จริง" ? /ปริมาณที่ใช้จริง/ : label, { exact: label !== "ปริมาณที่ใช้จริง" });
    if (await field.inputValue() !== expected) fail(`${label} did not persist after reload`);
  }
}

async function runCase(page, item) {
  active.tuple = tupleLabel(item);
  const roundId = await createRound(page, item);
  await openStep(page, roundId, 4, "open prep-media step");
  await assertMethodSurface(page, item, "prep");
  if (item.medium !== "pressure-sterilization") await confirmAndReloadPreparation(page, item, `medium-${item.medium}`);
  await openStep(page, roundId, 8, "open sterilize step");
  await assertMethodSurface(page, item, "sterilize");
  await confirmAndReloadPreparation(page, item, `surface-${item.surface}`);
}

await ensureServer();
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : { channel: "chrome" }) });
let currentPage = null;
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    currentPage = page;
    active.viewport = viewport.name;
    const consoleErrors = [];
    currentConsoleErrors = consoleErrors;
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    await enterDemo(page);
    for (const theme of ["light", "dark"]) {
      active.theme = theme;
      await page.evaluate((value) => document.documentElement.setAttribute("data-theme", value), theme);
      for (const item of cases) await runCase(page, item);
    }
    active.lastAction = "keyboard focus check";
    await page.keyboard.press("Tab");
    if (await page.evaluate(() => document.activeElement?.tagName === "BODY")) fail("keyboard focus stayed on BODY");
    if (consoleErrors.length) fail(`console errors: ${consoleErrors.join(" | ")}`);
    await page.close();
  }
  console.log(`Protocol integrity verification passed (${cases.length} tuples × ${viewports.length} viewports × 2 themes)`);
} catch (error) {
  const route = currentPage ? new URL(currentPage.url()).pathname : active.route;
  const body = currentPage ? (await currentPage.locator("body").innerText().catch(() => "")).slice(0, 1_000) : "";
  console.error(`${error instanceof Error ? error.message : error}\ncontext=${JSON.stringify({ ...active, route })}\nconsole=${currentConsoleErrors.join(" | ")}\nbody=${body}\nserver=${serverOutput}`);
  process.exitCode = 1;
} finally {
  await browser.close();
  stopServer();
}
