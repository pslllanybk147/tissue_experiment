import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.UI_BASE_URL ?? "http://localhost:3100";
const executablePath = process.env.CHROME_PATH
  ?? (process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : undefined);
const allViewports = [
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
const viewports = process.env.UI_VIEWPORT
  ? allViewports.filter((viewport) => viewport.name === process.env.UI_VIEWPORT)
  : allViewports;
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

function localDateTime(minutesAgo) {
  const date = new Date(Date.now() - minutesAgo * 60_000);
  const localTimestamp = date.getTime() - date.getTimezoneOffset() * 60_000;
  return new Date(localTimestamp).toISOString().slice(0, 16);
}

async function enterDemo(page) {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  const demo = page.getByRole("button", { name: "Continue in demo mode" });
  const shell = page.locator(".lab-route-shell:visible");
  await shell.or(demo).waitFor({ state: "visible" });
  if (!await shell.isVisible().catch(() => false)) await demo.click();
  await shell.waitFor({ state: "visible" });
}

async function returnToApp(page) {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  const shell = page.locator(".lab-route-shell:visible");
  const demo = page.getByRole("button", { name: "Continue in demo mode" });
  await shell.or(demo).waitFor({ state: "visible", timeout: 10_000 });
  if (!await shell.isVisible().catch(() => false)) {
    await demo.click();
  }
  await shell.waitFor({ state: "visible" });
}

async function ensureMainNav(page) {
  const toggle = page.locator(".lab-route-menu-toggle:visible");
  if (await toggle.count() && (await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  await page.locator("nav:visible").first().waitFor({ state: "visible" });
}

async function verifyCompactMenu(page, viewportName) {
  const toggle = page.locator(".lab-route-menu-toggle:visible");
  if (!await toggle.count()) return;
  assert(await toggle.getAttribute("aria-expanded") === "false", `${viewportName}: hamburger เริ่มต้นต้องปิด`);
  await toggle.click();
  assert(await toggle.getAttribute("aria-expanded") === "true", `${viewportName}: hamburger เปิดเมนูไม่ได้`);
  assert(await page.locator("#lab-route-mobile-nav:visible").count() === 1, `${viewportName}: เมนูที่เปิดไม่แสดง`);
  await toggle.click();
  assert(await toggle.getAttribute("aria-expanded") === "false", `${viewportName}: hamburger ปิดเมนูไม่ได้`);
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
    const viewportWidth = document.documentElement.clientWidth;
    const clippingTargets = [...document.querySelectorAll(
      ".beginner-guide-section, .beginner-materials li, .beginner-materials strong, "
      + ".beginner-materials span, .beginner-actions li, .guided-readiness-warning, "
      + ".guided-step-content h3, .guided-step-content p",
    )];
    const clipped = clippingTargets.flatMap((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (rect.width <= 0 || rect.height <= 0 || style.display === "none") return [];
      const rightOutsideViewport = rect.right > viewportWidth + 1;
      const leftOutsideViewport = rect.left < -1;
      const contentClipped = element.scrollWidth > element.clientWidth + 1;
      if (!rightOutsideViewport && !leftOutsideViewport && !contentClipped) return [];
      return [{
        text: (element.textContent ?? "").trim().slice(0, 80),
        clientWidth: Math.round(element.clientWidth),
        scrollWidth: Math.round(element.scrollWidth),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        viewportWidth,
      }];
    }).slice(0, 8);
    return {
      thaiFont: thaiSample ? getComputedStyle(thaiSample).fontFamily : "",
      wordBreak: content ? getComputedStyle(content).wordBreak : "",
      overflowWrap: content ? getComputedStyle(content).overflowWrap : "",
      contentWidth: contentRect ? Math.round(contentRect.width) : 0,
      headingDirection: heading ? getComputedStyle(heading).flexDirection : "",
      clipped,
    };
  });
  const prefix = `${viewportName} ${route}`;
  if (result.thaiFont) {
    assert(!/mono/i.test(result.thaiFont), `${prefix}: ข้อความไทยยังใช้ฟอนต์ mono (${result.thaiFont})`);
  }
  assert(result.wordBreak !== "break-all", `${prefix}: ใช้ word-break: break-all`);
  assert(
    result.clipped.length === 0,
    `${prefix}: พบข้อความหรือกรอบถูกตัด ${JSON.stringify(result.clipped)}`,
  );
  if (viewportName === "mobile" && result.contentWidth) {
    assert(result.contentWidth >= 250, `${prefix}: พื้นที่ข้อความถูกบีบเหลือ ${result.contentWidth}px`);
  }
  if (viewportName === "mobile" && route === "guided-runner") {
    assert(result.headingDirection === "column", `${prefix}: heading ยังไม่เรียงแนวตั้ง`);
  }
}

async function verifyProtocolPages(page, viewportName) {
  await ensureMainNav(page);
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
  await ensureMainNav(page);
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
  assert(
    await page.getByText("เตรียมอาหารทั้งหมด 110 mL").isVisible(),
    `${viewportName} wizard: ไม่คำนวณอาหารจาก explant/กระปุก/Blank/สำรอง`,
  );
  const dilutionText = await page.locator(".calculation-result").innerText();
  assert(dilutionText.includes("ตวงไฮเตอร์จากขวด 1.00 mL"), `${viewportName} wizard: ไม่มีคำสั่งตวงสารตั้งต้น`);
  assert(dilutionText.includes("เติมน้ำปลอดเชื้อ 9.00 mL"), `${viewportName} wizard: ไม่มีคำสั่งเติมสารเจือจาง`);
  assert(!/C1V1|C2V2/.test(dilutionText), `${viewportName} wizard: แสดงสมการในคำสั่งหลัก`);

  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByLabel("วิธีนำสารลงบนพื้นผิว").selectOption("spray-to-wipe");
  await page.getByLabel("Contact time บนฉลาก (นาที)").fill("1");
  await page.getByLabel("อุปกรณ์อื่นที่มีจริง (คั่นด้วย comma หรือขึ้นบรรทัดใหม่)").fill("ขวดสเปรย์ 500 mL");
  const checks = page.locator(".equipment-checklist input[type='checkbox']");
  for (let index = 0; index < await checks.count(); index += 1) {
    await checks.nth(index).check();
  }
  await page.getByRole("button", { name: "ถัดไป" }).click();
  const createLotButton = page.getByRole("button", { name: "สร้าง Lot และเปิดคู่มือ" }).last();
  await createLotButton.waitFor({ state: "visible" });
  await createLotButton.evaluate((button) => button.click());
  await page.waitForURL((url) => /^\/experiments\/(?!new$)[^/]+$/.test(url.pathname));
  await page.locator(".linear-protocol-v2, .migration-state").first().waitFor({
    state: "visible",
  });
  await inspectPage(page, viewportName, "guided-runner");
  await inspectProtocolTypography(page, viewportName, "guided-runner");
  assert(await page.locator(".linear-protocol-v2").isVisible(), `${viewportName}: ไม่เปิด Protocol v2 สำหรับ Lot ใหม่`);
  assert(
    await page.locator(".step-kicker").filter({ hasText: "ขั้นที่ 1 จาก 14" }).isVisible(),
    `${viewportName}: Protocol v2 ไม่แสดง 14 ขั้น`,
  );
  const initialGuideText = await page.locator(".linear-protocol-v2").innerText();
  assert(
    !/ผู้มีประสบการณ์|ผู้เชี่ยวชาญ|ที่ปรึกษา/.test(initialGuideText),
    `${viewportName}: คู่มือยังผลักภาระไปให้บุคคลภายนอก`,
  );
  assert(!/C1V1|C2V2|ตามคำแนะนำ|ตาม Protocol|ตามวิธีของห้อง/.test(initialGuideText), `${viewportName}: คู่มือ v2 ยังมีศัพท์หรือคำสั่งคลุมเครือ`);
  assert(await page.getByRole("button", { name: "ฉันพบปัญหา" }).isVisible(), `${viewportName}: ไม่มีทางหยุดเมื่อพบปัญหา`);
  assert(await page.getByRole("button", { name: "ฉันทำขั้นนี้ไว้แล้ว" }).isVisible(), `${viewportName}: ไม่มีทางบันทึกงานที่ทำไปแล้ว`);
  assert(await page.getByRole("button", { name: "ทำขั้นนี้เสร็จแล้ว" }).isVisible(), `${viewportName}: ไม่มีปุ่มจบขั้น`);
  assert(await page.locator("input[type='file']").count() === 0, `${viewportName}: Protocol v2 ยังบังคับบันทึกรูป`);
  assert(await page.getByRole("radio").count() === 0, `${viewportName}: Protocol v2 ยังใช้ผลลัพธ์แบบ radio รุ่นเก่า`);

  const stepsToggle = page.getByRole("button", { name: "ดูทุกขั้น" });
  assert(await stepsToggle.getAttribute("aria-expanded") === "false", `${viewportName}: รายการ 14 ขั้นต้องย่อไว้ก่อน`);
  await stepsToggle.click();
  assert(await page.locator("#linear-step-list li").count() === 14, `${viewportName}: รายการขั้นไม่ครบ 14 ขั้น`);
  assert(
    await page.locator("#linear-step-list button:disabled").count() === 13,
    `${viewportName}: ขั้นถัดไปต้องล็อกจนกว่าขั้นปัจจุบันเสร็จ`,
  );
  await page.getByRole("button", { name: "ซ่อนรายการขั้น" }).click();

  await page.getByRole("button", { name: "ฉันพบปัญหา" }).click();
  assert(await page.getByRole("region", { name: "บันทึกปัญหา" }).isVisible(), `${viewportName}: ปุ่มพบปัญหาไม่เปิดแบบบันทึก`);
  await page.getByLabel("เขียนสิ่งที่เห็นจริง *").fill("ตรวจ UI เท่านั้น");
  await page.getByRole("button", { name: "บันทึกปัญหาและหยุดขั้นนี้" }).click();
  await page.getByText("บันทึกปัญหาแล้ว ขั้นถัดไปยังล็อกอยู่").waitFor({ state: "visible" });

  const readiness = page.locator(".linear-checks input[type='checkbox']");
  for (let index = 0; index < await readiness.count(); index += 1) {
    await readiness.nth(index).check();
  }
  await page.getByRole("button", { name: "ฉันทำขั้นนี้ไว้แล้ว" }).click();
  const retrospective = page.getByRole("region", { name: "บันทึกขั้นที่ทำไปแล้ว" });
  await retrospective.waitFor({ state: "visible" });
  assert(await retrospective.locator("input[type='file']").count() === 0, `${viewportName}: บันทึกย้อนหลังยังขอรูป`);
  await page.getByLabel("วันที่และเวลาที่เริ่มทำจริง *").fill(localDateTime(20));
  await page.getByLabel("วันที่และเวลาที่ทำเสร็จจริง *").fill(localDateTime(10));
  await page.getByLabel("บันทึกสั้น ๆ ว่าทำอะไรและเห็นผลอย่างไร *").fill("ทำขั้นนี้จริงก่อนเปิดคู่มือและตรวจผลแล้ว");
  await page.getByRole("button", { name: "บันทึกตามเวลาจริง" }).click();
  await page.getByText("บันทึกย้อนหลังแล้ว ขั้นนี้ผ่านตามวันที่และเวลาจริง").waitFor({ state: "visible" });
  const next = page.getByRole("button", { name: "ไปขั้นถัดไป" });
  await next.click();
  await page.waitForTimeout(250);
  const recordTop = await page.locator(".linear-protocol-v2").evaluate(
    (element) => Math.round(element.getBoundingClientRect().top),
  );
  assert(
    recordTop >= 0 && recordTop <= 180,
    `${viewportName}: ไปขั้นถัดไปแล้วไม่เลื่อนกลับหัวขั้นตอน (top ${recordTop}px)`,
  );
  assert(
    await page.locator(".step-kicker").filter({ hasText: "ขั้นที่ 2 จาก 14" }).isVisible(),
    `${viewportName}: จบขั้นแรกแล้วไม่เปิดขั้น 2`,
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".linear-protocol-v2").waitFor({ state: "visible" });
  assert(
    await page.locator(".step-kicker").filter({ hasText: "ขั้นที่ 1 จาก 14" }).isVisible(),
    `${viewportName}: รีเฟรชแล้ว Protocol v2 โหลดไม่ได้`,
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
    await verifyCompactMenu(page, viewport.name);
    await page.keyboard.press("Tab");
    const focusTag = await page.evaluate(() => document.activeElement?.tagName ?? "BODY");
    assert(focusTag !== "BODY", `${viewport.name}: keyboard focus ไม่เข้าสู่ interactive element`);

    for (const route of routes.slice(1)) {
      await ensureMainNav(page);
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
