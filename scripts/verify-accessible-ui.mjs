import { chromium } from "playwright";

const baseUrl = process.env.UI_BASE_URL ?? "http://127.0.0.1:3100";
const executablePath = process.env.CHROME_PATH
  ?? (process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : undefined);
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 1024, height: 900 },
  { name: "desktop", width: 1440, height: 1000 },
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
  await Promise.all([
    page.waitForURL((url) => /^\/experiments\/(?!new$)[^/]+$/.test(url.pathname)),
    page.getByRole("button", { name: "สร้าง Lot และเปิดคู่มือ" }).click(),
  ]);
  await page.locator(".beginner-step-guide, .migration-state").first().waitFor({
    state: "visible",
  });
  await inspectPage(page, viewportName, "guided-runner");
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
