import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.UI_BASE_URL ?? "http://127.0.0.1:3100";
const executablePath = process.env.CHROME_PATH
  ?? (process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : undefined);
const viewports = [
  { name: "android-360", width: 360, height: 800 },
  { name: "iphone-se", width: 375, height: 667 },
  { name: "iphone-12", width: 390, height: 844 },
  { name: "android-412", width: 412, height: 915 },
  { name: "iphone-14-plus", width: 428, height: 926 },
  { name: "android-tablet", width: 600, height: 960 },
  { name: "ipad-mini", width: 744, height: 1133 },
  { name: "ipad-9", width: 768, height: 1024 },
  { name: "ipad-air", width: 820, height: 1180 },
  { name: "ipad-pro-11", width: 834, height: 1194 },
  { name: "ipad-pro-12", width: 1024, height: 1366 },
  { name: "tablet-landscape", width: 1280, height: 800 },
  { name: "desktop", width: 1440, height: 1000 },
  { name: "wide-desktop", width: 1920, height: 1080 },
];
const routes = [
  { href: "/", label: "เริ่มต้น" },
  { href: "/plants", label: "ต้นไม้ของฉัน" },
  { href: "/experiments", label: "การทดลอง" },
  { href: "/protocols", label: "คู่มือและ Protocol" },
  { href: "/knowledge", label: "คลังความรู้" },
  { href: "/research", label: "ตรวจงานวิจัย" },
  { href: "/dataset-review", label: "ตรวจรูปภาพ" },
];

const failures = [];
const screenshotRoot = path.resolve(process.env.UI_SCREENSHOT_DIR ?? "work/ui-audit");
fs.mkdirSync(screenshotRoot, { recursive: true });
function assert(condition, message) {
  if (!condition) failures.push(message);
}

async function enterDemo(page) {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  const demo = page.getByRole("button", { name: "Continue in demo mode" });
  await demo.waitFor({ state: "visible" });
  await demo.click();
  await page.locator("nav:visible").first().waitFor({ state: "visible" });
}

async function returnToApp(page) {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  const demo = page.getByRole("button", { name: "Continue in demo mode" });
  if (await demo.isVisible().catch(() => false)) await demo.click();
  await page.locator("nav:visible").first().waitFor({ state: "visible" });
}

async function inspectPage(page, viewportName, route) {
  const result = await page.evaluate(() => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0
        && style.visibility !== "hidden" && style.display !== "none";
    };
    const controls = [...document.querySelectorAll(
      "button, [role='button'], nav a, .primary-button, .quiet-button, .secondary-button, .text-button, summary",
    )].filter(visible).map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        text: (element.textContent ?? element.getAttribute("aria-label") ?? "").trim().slice(0, 60),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    });
    return {
      bodyFont: Number.parseFloat(getComputedStyle(document.body).fontSize),
      bodyText: document.body.innerText.trim().length,
      horizontalOverflow: document.documentElement.scrollWidth
        - document.documentElement.clientWidth,
      hasOverlay: Boolean(document.querySelector(
        "[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay",
      )),
      controls,
    };
  });

  const prefix = `${viewportName} ${route}`;
  await page.screenshot({
    path: path.join(screenshotRoot, `${viewportName}-${route.replaceAll("/", "_").replaceAll("[", "").replaceAll("]", "") || "home"}.png`),
    fullPage: true,
  });
  assert(result.bodyText > 0, `${prefix}: หน้าเว็บว่าง`);
  assert(!result.hasOverlay, `${prefix}: พบ framework error overlay`);
  assert(result.bodyFont >= 18, `${prefix}: body font ${result.bodyFont}px ต่ำกว่า 18px`);
  assert(result.horizontalOverflow <= 1, `${prefix}: horizontal overflow ${result.horizontalOverflow}px`);
  for (const control of result.controls) {
    assert(
      control.width >= 48 && control.height >= 48,
      `${prefix} “${control.text}”: expected 48x48 target, got ${control.width}x${control.height}`,
    );
  }
}

async function inspectProtocolTypography(page, viewportName, route) {
  const result = await page.evaluate(() => {
    const thaiSample = [...document.querySelectorAll(
      ".protocol-row small, .protocol-reading-step small, .guided-step-content small, .step-kicker, .evidence-label",
    )].find((element) => /[\u0E00-\u0E7F]/.test(element.textContent ?? ""));
    const content = document.querySelector(
      ".protocol-reading-step > div, .guided-step-content, .protocol-row > :first-child",
    );
    const heading = document.querySelector(".guided-step-heading");
    const contentRect = content?.getBoundingClientRect();
    return {
      thaiFont: thaiSample ? getComputedStyle(thaiSample).fontFamily : "",
      wordBreak: content ? getComputedStyle(content).wordBreak : "",
      overflowWrap: content ? getComputedStyle(content).overflowWrap : "",
      contentWidth: contentRect ? Math.round(contentRect.width) : 0,
      headingDirection: heading ? getComputedStyle(heading).flexDirection : "",
    };
  });
  const prefix = `${viewportName} ${route}`;
  if (result.thaiFont) {
    assert(!/mono/i.test(result.thaiFont), `${prefix}: ข้อความไทยยังใช้ฟอนต์ mono (${result.thaiFont})`);
  }
  assert(result.wordBreak !== "break-all", `${prefix}: ใช้ word-break: break-all`);
  if (viewportName === "mobile" && result.contentWidth) {
    assert(result.contentWidth >= 250, `${prefix}: พื้นที่ข้อความถูกบีบเหลือ ${result.contentWidth}px`);
  }
  if (viewportName === "mobile" && route === "guided-runner") {
    assert(result.headingDirection === "column", `${prefix}: heading ยังไม่เรียงแนวตั้ง`);
  }
}

async function verifyProtocolPages(page, viewportName) {
  await page.locator("nav:visible a[href='/protocols']").first().click();
  await page.waitForURL("**/protocols");
  await page.locator(".protocol-list").waitFor({ state: "visible" });
  await inspectPage(page, viewportName, "/protocols");
  await inspectProtocolTypography(page, viewportName, "/protocols");
  const firstProtocol = page.locator(".protocol-row").first();
  assert(await firstProtocol.isVisible(), `${viewportName}: ไม่พบ Protocol สำหรับตรวจ typography`);
  if (await firstProtocol.isVisible()) {
    await firstProtocol.click();
    await page.waitForURL("**/protocols/*");
    await page.locator(".protocol-detail-grid").waitFor({ state: "visible" });
    await inspectPage(page, viewportName, "/protocols/[id]");
    await inspectProtocolTypography(page, viewportName, "/protocols/[id]");
    const editLink = page.getByRole("link", { name: "แก้ไข" });
    if (await editLink.isVisible()) {
      await editLink.click();
      await page.waitForURL("**/edit");
      await page.locator(".protocol-editor").waitFor({ state: "visible" });
      await inspectPage(page, viewportName, "/protocols/[id]/edit");
      await inspectProtocolTypography(page, viewportName, "/protocols/[id]/edit");
    }
  }
}

async function verifyWizard(page, viewportName) {
  await page.locator("nav:visible a[href='/experiments']").first().click();
  await page.waitForURL("**/experiments");
  await page.getByRole("link", { name: "สร้าง Lot ใหม่" }).click();
  await page.waitForURL("**/experiments/new");
  await inspectPage(page, viewportName, "/experiments/new");

  const plant = page.getByLabel("ชื่อที่ผู้ขายแจ้งหรือชื่อที่คาดว่าเป็น");
  await plant.fill(`Pink Princess ${viewportName}`);
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: /Pink Princess · Nodal culture/ }).click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: /ไฮเตอร์ \/ NaOCl/ }).last().click();
  await page.getByLabel("ตัวเลขเปอร์เซ็นต์ที่พิมพ์อยู่บนฉลาก").fill("6");
  await page.getByLabel("ปริมาตรอาหารทั้งหมด (mL)").fill("100");
  const dilutionText = await page.locator(".calculation-result").innerText();
  assert(dilutionText.includes("ตวงไฮเตอร์จากขวด 1.00 mL"), `${viewportName} wizard: ไม่มีคำสั่งตวงสารตั้งต้น`);
  assert(dilutionText.includes("เติมน้ำปลอดเชื้อ 9.00 mL"), `${viewportName} wizard: ไม่มีคำสั่งเติมสารเจือจาง`);
  assert(!/C1V1|C2V2/.test(dilutionText), `${viewportName} wizard: แสดงสมการในคำสั่งหลัก`);

  await page.getByRole("button", { name: "ถัดไป" }).click();
  const checks = page.locator(".equipment-checklist input[type='checkbox']");
  for (let index = 0; index < await checks.count(); index += 1) {
    await checks.nth(index).check();
  }
  await page.getByRole("button", { name: "ถัดไป" }).click();
  const createLotButton = page.getByRole("button", { name: "สร้าง Lot และเปิดคู่มือ" }).last();
  await createLotButton.waitFor({ state: "visible" });
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")]
      .find((item) => item.textContent?.includes("สร้าง Lot และเปิดคู่มือ"));
    if (!button) throw new Error("ไม่พบปุ่มสร้าง Lot และเปิดคู่มือ");
    button.click();
  });
  await page.waitForURL((url) => /^\/experiments\/(?!new$)[^/]+$/.test(url.pathname));
  await page.locator(".beginner-step-guide, .migration-state").first().waitFor({
    state: "visible",
  });
  await inspectPage(page, viewportName, "guided-runner");
  await inspectProtocolTypography(page, viewportName, "guided-runner");
  assert(await page.locator(".beginner-step-guide").isVisible(), `${viewportName}: Guided Runner ไม่มีคู่มือมือใหม่`);
  assert(await page.getByText("ขั้นที่ 1 / 22").isVisible(), `${viewportName}: Guided Runner ไม่แสดง 22 ขั้น`);
  await page.getByRole("button", { name: /ให้ระบบหาปริมาตร Haiter ที่ต้องใช้/ }).click();
  await page.getByLabel("ปริมาตรต่ำสุดที่อุปกรณ์ตวงได้ (mL) *").fill("0.1");
  assert(
    await page.getByText("กรอกตัวเลข 3 ช่องนี้").isVisible(),
    `${viewportName}: ขั้นคำนวณ Haiter ไม่มีฟอร์มกรอกข้อมูล`,
  );
  assert(
    (await page.locator(".haiter-plan").innerText()).includes("เตรียมสารไฮเตอร์เจือจาง 10 เท่าก่อน"),
    `${viewportName}: Guided Runner ไม่แสดงคำสั่ง working dilution`,
  );
}

async function verifyDirectRoutes(page, viewportName) {
  const routes = [
    "/plants/new",
    "/experiments/new",
    "/protocols/new",
    "/knowledge/taxa/cultivar-pink-princess",
  ];
  for (const route of routes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
    await page.locator("main").first().waitFor({ state: "visible" });
    await inspectPage(page, viewportName, route);
    if (route.includes("knowledge/taxa")) await inspectProtocolTypography(page, viewportName, route);
  }

  await page.goto(`${baseUrl}/knowledge`, { waitUntil: "domcontentloaded" });
  const firstSource = page.locator("a[href^='/knowledge/sources/']").first();
  if (await firstSource.isVisible()) {
    await firstSource.click();
    await page.waitForURL("**/knowledge/sources/*");
    await page.locator("main").first().waitFor({ state: "visible" });
    await inspectPage(page, viewportName, "/knowledge/sources/[id]");
  }
}

async function verifyPlantDetail(page, viewportName) {
  await page.goto(`${baseUrl}/plants`, { waitUntil: "domcontentloaded" });
  const firstPlant = page.locator(".record-row").first();
  if (await firstPlant.isVisible()) {
    await firstPlant.click();
    await page.waitForURL("**/plants/*");
    await inspectPage(page, viewportName, "/plants/[id]");
  }
}

const browser = await chromium.launch({
  headless: true,
  ...(executablePath ? { executablePath } : { channel: "chrome" }),
});

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: "reduce",
    });
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    await enterDemo(page);
    await inspectPage(page, viewport.name, "/");
    await page.keyboard.press("Tab");
    const focusTag = await page.evaluate(() => document.activeElement?.tagName ?? "BODY");
    assert(focusTag !== "BODY", `${viewport.name}: keyboard focus ไม่เข้าสู่ interactive element`);

    for (const route of routes.slice(1)) {
      await page.locator(`nav:visible a[href='${route.href}']`).first().click();
      await page.waitForURL(`**${route.href}`);
      await inspectPage(page, viewport.name, route.href);
    }

    await verifyDirectRoutes(page, viewport.name);
    await verifyPlantDetail(page, viewport.name);
    await returnToApp(page);
    await verifyProtocolPages(page, viewport.name);
    await verifyWizard(page, viewport.name);
    assert(
      consoleErrors.length === 0,
      `${viewport.name}: console errors: ${consoleErrors.join(" | ")}`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`UI verification failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`UI verification passed for ${viewports.map((item) => item.width).join(", ")}px`);
