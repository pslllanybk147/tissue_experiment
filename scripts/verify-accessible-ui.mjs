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
// เดิม routes นี้ชี้ /plants /experiments /protocols /knowledge /research /dataset-review
// ซึ่งเป็นโครงแอปรุ่นก่อนหน้า (wizard สร้าง Lot + Protocol editor) ที่ถูกแทนที่ไปหมดแล้ว
// ปัจจุบัน LabShell (src/components/lab/lab-shell.tsx) มีเมนู 5 ปลายทาง แต่ "ตรวจคู่มือ" (/admin/manual)
// พาไปหน้า internal review เปล่า ๆ ไม่มี nav ของ LabShell ต่อ (ตัวหน้าเองก็เขียนไว้ว่า
// "ไม่ใช่หน้าที่ผู้ใช้เห็น") จึงตัดออกจากลูปคลิกเมนูต่อกัน — ยังตรวจถึงอยู่ผ่าน verifyDirectRoutes ด้านล่าง
const routes = [
  { href: "/my", label: "เริ่มต้น" },
  { href: "/admin/knowledge", label: "คลังความรู้" },
  { href: "/admin/research", label: "ตรวจงานวิจัย" },
  { href: "/admin/dataset-review", label: "ตรวจรูปภาพ" },
];

const failures = [];
const screenshotRoot = path.resolve(process.env.UI_SCREENSHOT_DIR ?? "work/ui-audit");
fs.mkdirSync(screenshotRoot, { recursive: true });
function assert(condition, message) {
  if (!condition) failures.push(message);
}

// หน้าแอปที่ต้องล็อกอินย้ายจาก / ไป /my แล้ว รากของเว็บเป็นคู่มือสาธารณะ
const appUrl = `${baseUrl}/my`;

async function enterDemo(page) {
  await page.goto(appUrl, { waitUntil: "domcontentloaded" });
  const demo = page.getByRole("button", { name: "Continue in demo mode" });
  const shell = page.locator(".cl-app-shell:visible");
  await shell.or(demo).waitFor({ state: "visible" });
  if (!await shell.isVisible().catch(() => false)) await demo.click();
  await shell.waitFor({ state: "visible" });
}

async function returnToApp(page) {
  await page.goto(appUrl, { waitUntil: "domcontentloaded" });
  const shell = page.locator(".cl-app-shell:visible");
  const demo = page.getByRole("button", { name: "Continue in demo mode" });
  await shell.or(demo).waitFor({ state: "visible", timeout: 10_000 });
  if (!await shell.isVisible().catch(() => false)) {
    await demo.click();
  }
  await shell.waitFor({ state: "visible" });
}

async function ensureMainNav(page) {
  await page.locator("nav:visible").first().waitFor({ state: "visible" });
}

async function verifyCompactMenu(page, viewportName) {
  if ((await page.viewportSize())?.width >= 768) return;
  assert(await page.locator(".cl-mobile-nav:visible").count() === 1, `${viewportName}: mobile navigation ไม่แสดง`);
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
      bodyFamily: getComputedStyle(document.body).fontFamily,
      mainCount: document.querySelectorAll("main").length,
      legacyHudCount: document.querySelectorAll(".pl-hero-grid, .pl-hero-ring, .pl-hero-scanline").length,
    };
  });

  const prefix = `${viewportName} ${route}`;
  // เดิม route label เช่น "public:/find" ยังมี ":" ค้างอยู่ ทำให้ path บน Windows/NTFS
  // ตีความเป็น alternate data stream (file.png:foo) แล้วเขียนไม่ลง — ภาพเงียบ ๆ หายไปโดยไม่ error
  // ลบอักขระที่ห้ามใช้ในชื่อไฟล์ Windows ทั้งหมด (< > : " | ? *) ไม่ใช่แค่ ":"
  const safeRoute = route.replaceAll("/", "_").replaceAll(/[<>:"|?*]/g, "");
  await page.screenshot({
    path: path.join(screenshotRoot, `${viewportName}-${safeRoute || "home"}.png`),
    fullPage: true,
  });
  assert(result.bodyText > 0, `${prefix}: หน้าเว็บว่าง`);
  assert(!result.hasOverlay, `${prefix}: พบ framework error overlay`);
  assert(result.bodyFont >= 17, `${prefix}: body font ${result.bodyFont}px ต่ำกว่า 17px`);
  assert(/torsilp/i.test(result.bodyFamily), `${prefix}: body ไม่ได้ใช้ Torsilp (${result.bodyFamily})`);
  assert(result.mainCount === 1, `${prefix}: expected one main landmark, got ${result.mainCount}`);
  assert(result.legacyHudCount === 0, `${prefix}: legacy HUD decoration remains`);
  assert(result.horizontalOverflow <= 1, `${prefix}: horizontal overflow ${result.horizontalOverflow}px`);
  for (const control of result.controls) {
    assert(
      control.width >= 44 && control.height >= 44,
      `${prefix} “${control.text}”: expected 44x44 target, got ${control.width}x${control.height}`,
    );
  }
  await verifyButtonContrast(page, viewportName, route);
}

async function verifyButtonContrast(page, viewportName, route) {
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => document.documentElement.setAttribute("data-theme", value), theme);
    const controls = await page.evaluate(() => {
      const visible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
      };
      const channel = (value) => {
        const normalized = value / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      };
      const luminance = (color) => {
        const values = color.match(/\d+(?:\.\d+)?/g);
        if (!values || values.length < 3) return null;
        const [red, green, blue] = values.slice(0, 3).map(Number);
        return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
      };
      return [...document.querySelectorAll(".primary-button, .secondary-button, .accessible-action, .photo-action, .cl-button-primary, .cl-button-secondary, .cl-button-danger")]
        .filter(visible)
        .map((element) => {
          const style = getComputedStyle(element);
          const foreground = luminance(style.color);
          const background = luminance(style.backgroundColor);
          return { text: (element.textContent ?? "").trim().slice(0, 60), foreground, background };
        });
    });
    for (const control of controls) {
      if (control.foreground === null || control.background === null) continue;
      const contrast = (Math.max(control.foreground, control.background) + 0.05)
        / (Math.min(control.foreground, control.background) + 0.05);
      assert(
        contrast >= 4.5,
        `${viewportName} ${route} ${theme} “${control.text}”: contrast ${contrast.toFixed(2)} ต่ำกว่า 4.5:1`,
      );
    }
  }
}

async function verifyPublicGuide(page, viewportName) {
  // หน้าคู่มือสาธารณะอ่านได้โดยไม่ล็อกอิน จึงตรวจแยกจากเส้นทางที่ผ่าน enterDemo
  const routes = [
    "/",
    "/guide/pink-princess",
    "/guide/pink-princess/step/7",
    "/find",
    "/start",
    "/substances",
    "/problem",
    "/search",
  ];
  for (const route of routes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
    await page.locator("main").first().waitFor({ state: "visible" });
    await inspectPage(page, viewportName, `public:${route}`);
  }
}

// เดิมชี้ /plants/new /experiments/new /protocols/new /knowledge/taxa/... ซึ่งเป็นเส้นทาง
// ของ wizard สร้าง Lot รุ่นก่อนหน้าที่ถูกลบออกจากแอปไปแล้ว (ดู src/app ปัจจุบัน: ไม่มีเส้นทางเหล่านี้เหลืออยู่)
// แทนที่ด้วยเส้นทางตรงจริงของแอปปัจจุบันที่เข้าถึงได้หลัง enterDemo แล้ว
async function verifyDirectRoutes(page, viewportName) {
  const routes = [
    "/my/equipment",
    "/my/rounds",
    "/admin/pin",
    "/admin/manual/pink-princess",
  ];
  for (const route of routes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
    await page.locator("main").first().waitFor({ state: "visible" });
    await inspectPage(page, viewportName, route);
    if (route === "/my/equipment") await verifyEquipmentActionContrast(page, viewportName);
  }
}

async function verifyEquipmentActionContrast(page, viewportName) {
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => document.documentElement.setAttribute("data-theme", value), theme);
    for (const label of ["เติมค่าจากรายการที่แจ้งไว้", "บันทึกของที่มี"]) {
      const button = page.getByRole("button", { name: label });
      await button.hover();
      await button.focus();
      const contrast = await button.evaluate((element) => {
        const channel = (value) => {
          const normalized = value / 255;
          return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
        };
        const luminance = (color) => {
          const [red, green, blue] = color.match(/\d+(?:\.\d+)?/g).slice(0, 3).map(Number);
          return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
        };
        const style = getComputedStyle(element);
        const foreground = luminance(style.color);
        const background = luminance(style.backgroundColor);
        return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
      });
      assert(
        contrast >= 4.5,
        `${viewportName} /my/equipment ${theme} “${label}”: contrast ${contrast.toFixed(2)} ต่ำกว่า 4.5:1`,
      );
    }
  }
}

// สคริปต์เดิม (ก่อน Task 5) ตรึง reducedMotion ของทุกหน้าไว้ที่ "reduce" เสมอ (ดู browser.newPage
// ด้านล่าง) HeroJar จึงไม่มีวันโหลด 3D ระหว่างตรวจตามปกติอยู่แล้ว — ฟังก์ชันนี้ตรวจแค่ว่า fallback
// (poster + สลับธีม) ใช้งานได้จริงเสมอ ไม่ได้ตรวจกรณี 3D โหลดสำเร็จภายใต้ motion ปกติ
async function verifyThemeAndHero(page, viewportName) {
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });

  // 1) poster ต้องมีเสมอ (fallback ของ 3D)
  assert(await page.locator(".pl-hero-poster").count() === 1, `${viewportName}: หน้าแรกไม่มี hero poster`);

  // 2) สลับธีมแล้ว data-theme ต้องเปลี่ยน และตัวหนังสือหลักต้องยังอ่านได้ (สีต่างจากพื้น)
  // ปุ่มจริงอยู่ที่ src/components/guide/theme-toggle.tsx: aria-label ภาษาไทย + คลาส .pl-toggle
  const themeButton = page.locator(".pl-toggle");
  assert(await themeButton.count() === 1, `${viewportName}: ไม่พบปุ่มสลับธีม`);
  const before = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  await themeButton.click();
  const after = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  // before อาจเป็น null ตอนเริ่ม (ยังไม่เคยเลือกธีม ใช้ค่าระบบ) — null !== "dark"/"light" ก็ถือว่าต่างแล้ว
  assert(before !== after, `${viewportName}: กดปุ่มธีมแล้ว data-theme ไม่เปลี่ยน`);
  for (const theme of ["dark", "light"]) {
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
    const readable = await page.evaluate(() => {
      const s = getComputedStyle(document.body.querySelector(".pl-root") ?? document.body);
      return s.color !== s.backgroundColor;
    });
    assert(readable, `${viewportName}: โหมด ${theme} สีตัวหนังสือกลืนพื้นหลัง`);
    await page.screenshot({ path: path.join(screenshotRoot, `${viewportName}-home-${theme}.png`), fullPage: true });
  }

  // 3) reduced motion → ห้ามมี canvas 3D, poster ต้องมองเห็น
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });
  assert(await page.locator(".pl-hero canvas").count() === 0, `${viewportName}: reduced motion แล้วยังโหลด 3D`);
  assert(await page.locator(".pl-hero-poster").isVisible(), `${viewportName}: reduced motion แล้ว poster หาย`);
  // คงค่า reducedMotion เป็น "reduce" ต่อ (ไม่ตั้งเป็น null ตามต้นแบบ) เพราะทั้งสคริปต์ตรึงบริบทไว้ที่
  // reduce เสมอ (browser.newPage ด้านล่าง) การปล่อยเป็น null จะทำให้พฤติกรรมของหน้าที่เหลือในรอบ
  // viewport นี้ไม่สอดคล้องกับสมมติฐานเดิมของสคริปต์
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
      if (message.type() !== "error") return;
      const text = message.text();
      // Chrome (ไม่ใช่แอป) ฉีด style="caret-color: transparent" ลง input[type=search] เองบางจังหวะ
      // ทำให้ React แจ้ง hydration mismatch เป็น false positive — grep ทั้ง repo ไม่มี caret-color
      // เลยสักที่ ยืนยันว่าไม่ใช่โค้ดแอป จึงไม่นับเป็นบั๊กที่ต้องเก็บ (เฉพาะกรณีนี้เท่านั้น)
      if (/hydrat/i.test(text) && /caret-color/i.test(text)) return;
      consoleErrors.push(text);
    });
    let lastCompletedAction = "browser page created";
    try {
      // หน้าแรกสาธารณะ (hero + ธีม + fallback 3D) ตรวจก่อนเข้าโหมดสาธิต เพราะไม่ต้องล็อกอิน
      await verifyThemeAndHero(page, viewport.name);
      lastCompletedAction = "verified public hero and themes";

      await enterDemo(page);
      lastCompletedAction = "entered demo mode";
      await inspectPage(page, viewport.name, "/my");
      lastCompletedAction = "inspected /my";
      await verifyCompactMenu(page, viewport.name);
      await page.keyboard.press("Tab");
      const focusTag = await page.evaluate(() => document.activeElement?.tagName ?? "BODY");
      assert(focusTag !== "BODY", `${viewport.name}: keyboard focus ไม่เข้าสู่ interactive element`);

      for (const route of routes.slice(1)) {
        await ensureMainNav(page);
        await page.locator(`nav:visible a[href='${route.href}']`).first().click();
        await page.waitForURL(`**${route.href}`);
        await inspectPage(page, viewport.name, route.href);
        lastCompletedAction = `inspected ${route.href}`;
      }

      await verifyDirectRoutes(page, viewport.name);
      lastCompletedAction = "verified direct routes";
      await returnToApp(page);
      await verifyPublicGuide(page, viewport.name);
      lastCompletedAction = "verified public guide routes";
      assert(
        consoleErrors.length === 0,
        `${viewport.name}: console errors: ${consoleErrors.join(" | ")}`,
      );
    } catch (error) {
      const route = new URL(page.url()).pathname;
      failures.push(`${viewport.name} ${route}: ${error instanceof Error ? error.message : error}; last completed action: ${lastCompletedAction}`);
    }
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
