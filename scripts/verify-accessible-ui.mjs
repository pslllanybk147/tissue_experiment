import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { selectViewports } from "./lib/ui-verification-helpers.mjs";

const baseUrl = process.env.UI_BASE_URL ?? "http://localhost:3100";
const executablePath = process.env.CHROME_PATH
  ?? (process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : undefined);
const viewports = selectViewports(process.env.UI_VIEWPORT);
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
  // Route labels include characters that Windows reserves in filenames.
  const safeRoute = route.replaceAll("/", "_").replaceAll(/[<>:"|?*]/g, "");
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => document.documentElement.setAttribute("data-theme", value), theme);
    const result = await page.evaluate(() => {
      const visible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0
          && style.visibility !== "hidden" && style.display !== "none";
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
      const contrastSelector = ".primary-button, .secondary-button, .accessible-action, .photo-action, .cl-button-primary, .cl-button-secondary, .cl-button-danger";
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
      const contrastControls = [...document.querySelectorAll(contrastSelector)]
        .filter(visible)
        .map((element) => {
          const style = getComputedStyle(element);
          return {
            text: (element.textContent ?? element.getAttribute("aria-label") ?? "").trim().slice(0, 60),
            foreground: luminance(style.color),
            background: luminance(style.backgroundColor),
          };
        });
      const textElements = [...document.querySelectorAll("h1,h2,h3,h4,p,li,label,button,a,dt,dd")]
        .filter(visible);
      const horizontalTextOverflow = textElements
        .filter((element) => element.scrollWidth > element.clientWidth + 1
          && getComputedStyle(element).overflowX !== "auto")
        .map((element) => (element.textContent ?? "").trim().slice(0, 80));
      const verticalClipping = textElements
        .filter((element) => {
          const style = getComputedStyle(element);
          const overflowY = style.overflowY;
          return element.scrollHeight > element.clientHeight + 1
            && ["hidden", "clip"].includes(overflowY);
        })
        .map((element) => (element.textContent ?? "").trim().slice(0, 80));
      return {
        bodyFont: Number.parseFloat(getComputedStyle(document.body).fontSize),
        bodyText: document.body.innerText.trim().length,
        horizontalOverflow: document.documentElement.scrollWidth
          - document.documentElement.clientWidth,
        hasOverlay: Boolean(document.querySelector(
          "[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay",
        )),
        controls,
        contrastControls,
        horizontalTextOverflow,
        verticalClipping,
        bodyFamily: getComputedStyle(document.body).fontFamily,
        mainCount: document.querySelectorAll("main").length,
        legacyHudCount: document.querySelectorAll(".pl-hero-grid, .pl-hero-ring, .pl-hero-scanline").length,
      };
    });

    const prefix = `${viewportName} ${route} ${theme}`;
    await page.screenshot({
      path: path.join(screenshotRoot, `${viewportName}-${safeRoute || "home"}-${theme}.png`),
      fullPage: true,
    });
    assert(result.bodyText > 0, `${prefix}: หน้าเว็บว่าง`);
    assert(!result.hasOverlay, `${prefix}: พบ framework error overlay`);
    assert(result.bodyFont === 18, `${prefix}: body font ต้องเป็น 18px แต่ได้ ${result.bodyFont}px`);
    assert(/sarabun/i.test(result.bodyFamily), `${prefix}: body ไม่ได้ใช้ Sarabun (${result.bodyFamily})`);
    assert(result.mainCount === 1, `${prefix}: expected one main landmark, got ${result.mainCount}`);
    assert(result.legacyHudCount === 0, `${prefix}: legacy HUD decoration remains`);
    assert(result.horizontalOverflow <= 1, `${prefix}: horizontal overflow ${result.horizontalOverflow}px`);
    assert(result.horizontalTextOverflow.length === 0, `${prefix}: horizontal text overflow ${result.horizontalTextOverflow.join(" | ")}`);
    assert(result.verticalClipping.length === 0, `${prefix}: vertically clipped text ${result.verticalClipping.join(" | ")}`);
    for (const control of result.controls) {
      assert(
        control.width >= 48 && control.height >= 48,
        `${prefix} “${control.text}”: expected 48x48 target, got ${control.width}x${control.height}`,
      );
    }
    for (const control of result.contrastControls) {
      if (control.foreground === null || control.background === null) continue;
      const contrast = (Math.max(control.foreground, control.background) + 0.05)
        / (Math.min(control.foreground, control.background) + 0.05);
      assert(contrast >= 4.5, `${prefix} “${control.text}”: contrast ${contrast.toFixed(2)} ต่ำกว่า 4.5:1`);
    }
  }
}

async function verifyPublicGuide(page, viewportName) {
  // หน้าคู่มือสาธารณะอ่านได้โดยไม่ล็อกอิน จึงตรวจแยกจากเส้นทางที่ผ่าน enterDemo
  const routes = [
    "/",
    "/guide/pink-princess",
    "/guide/violin-variegated/step/8",
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
    if (route === "/guide/violin-variegated/step/8") {
      await verifyExecutionCardFoundation(page, viewportName, route);
      if (viewportName === "minimum-mobile") {
        await verifyCommonPrimitiveStress(page, viewportName, route);
      }
    }
  }
}

async function verifyExecutionCardFoundation(page, viewportName, route) {
  const heading = page.locator(".execution-instruction-heading h3").first();
  await heading.waitFor({ state: "visible" });
  const headingStyle = await heading.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
    };
  });
  assert(headingStyle.fontSize === "28px", `${viewportName} ${route}: execution h3 fontSize ${headingStyle.fontSize} ไม่ใช่ 28px`);
  assert(headingStyle.fontWeight === "600", `${viewportName} ${route}: execution h3 fontWeight ${headingStyle.fontWeight} ไม่ใช่ 600`);
  assert(headingStyle.lineHeight === "37.8px", `${viewportName} ${route}: execution h3 lineHeight ${headingStyle.lineHeight} ไม่ใช่ 37.8px`);

  const expectedThemes = {
    light: {
      canvas: "rgb(247, 243, 234)",
      text: "rgb(41, 45, 41)",
      action: "rgb(41, 62, 99)",
    },
    dark: {
      canvas: "rgb(28, 29, 26)",
      text: "rgb(247, 244, 237)",
      action: "rgb(155, 176, 217)",
    },
  };

  for (const [theme, expected] of Object.entries(expectedThemes)) {
    await page.evaluate((value) => document.documentElement.setAttribute("data-theme", value), theme);
    const computed = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const action = getComputedStyle(document.querySelector(".cl-button-primary"));
      return {
        canvas: body.backgroundColor,
        text: body.color,
        action: action.backgroundColor,
      };
    });
    assert(computed.canvas === expected.canvas, `${viewportName} ${route} ${theme}: canvas ${computed.canvas} ไม่ใช่ ${expected.canvas}`);
    assert(computed.text === expected.text, `${viewportName} ${route} ${theme}: text ${computed.text} ไม่ใช่ ${expected.text}`);
    assert(computed.action === expected.action, `${viewportName} ${route} ${theme}: action ${computed.action} ไม่ใช่ ${expected.action}`);
  }
}

async function verifyCommonPrimitiveStress(page, viewportName, route) {
  const result = await page.evaluate(() => {
    document.querySelector("[data-ui-stress-fixture]")?.remove();
    const fixture = document.createElement("section");
    fixture.dataset.uiStressFixture = "true";
    fixture.innerHTML = `
      <header class="cl-page-heading">
        <div>
          <h1>หัวข้อขั้นตอนที่ต้องตรวจสอบอย่างละเอียดก่อนยืนยันหัวข้อขั้นตอนที่ต้องตรวจสอบอย่างละเอียดก่อนยืนยัน</h1>
          <p>คำอธิบายสำหรับผู้เริ่มต้นที่ยาวเป็นสองเท่าเพื่อยืนยันว่าข้อความภาษาไทยตัดบรรทัดได้โดยไม่ซ้อนทับคำอธิบายสำหรับผู้เริ่มต้นที่ยาวเป็นสองเท่า</p>
        </div>
        <div class="cl-page-heading-action"><button class="cl-button-secondary">เปิดรายละเอียดการตรวจสอบทั้งหมดก่อนดำเนินการต่อ</button></div>
      </header>
      <div class="cl-field-group">
        <label class="cl-field-label" for="ui-stress-dose">ปริมาณที่ตวงจริงจากอุปกรณ์ซึ่งตรวจสอบความละเอียดแล้ว</label>
        <p class="cl-field-hint">กรอกค่าที่อ่านได้จริงและตรวจทานหน่วยก่อนบันทึก</p>
        <div class="cl-field-control">
          <input id="ui-stress-dose" value="1234567890.1234567890" />
          <span class="cl-field-unit">หน่วยความเข้มข้นโดยประมาณจากการคำนวณตามปริมาตรทั้งหมด หน่วยความเข้มข้นโดยประมาณจากการคำนวณตามปริมาตรทั้งหมด</span>
        </div>
      </div>
      <div class="cl-action-bar">
        <div class="cl-action-secondary"><button class="cl-button-danger">ลบบันทึกที่เลือกออกจากรอบการทดลองนี้</button></div>
        <div class="cl-action-primary">
          <button class="cl-button-secondary" disabled>ยังไปขั้นถัดไปไม่ได้จนกว่าจะกรอกข้อมูลครบ</button>
          <button class="cl-button-primary" aria-busy="true">กำลังบันทึกข้อมูลและตรวจสอบความถูกต้อง</button>
        </div>
      </div>`;
    document.querySelector("main")?.append(fixture);

    const rectanglesOverlap = (first, second) => first.left < second.right - 1
      && first.right > second.left + 1
      && first.top < second.bottom - 1
      && first.bottom > second.top + 1;
    const fieldControl = fixture.querySelector(".cl-field-control");
    const fieldInput = fixture.querySelector("input");
    const fieldUnit = fixture.querySelector(".cl-field-unit");
    const headingCopy = fixture.querySelector(".cl-page-heading > div:first-child");
    const headingAction = fixture.querySelector(".cl-page-heading-action");
    const actionSecondary = fixture.querySelector(".cl-action-secondary");
    const actionPrimary = fixture.querySelector(".cl-action-primary");
    const danger = fixture.querySelector(".cl-button-danger");
    const disabled = fixture.querySelector("button:disabled");
    const busy = fixture.querySelector('[aria-busy="true"]');
    const clippedText = [...fixture.querySelectorAll("h1,p,label,button,span")]
      .filter((element) => element.scrollWidth > element.clientWidth + 1)
      .map((element) => element.textContent?.trim().slice(0, 80));

    return {
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      fieldOverflow: fieldControl.scrollWidth - fieldControl.clientWidth,
      unitOverflow: fieldUnit.scrollWidth - fieldUnit.clientWidth,
      inputUnitOverlap: rectanglesOverlap(fieldInput.getBoundingClientRect(), fieldUnit.getBoundingClientRect()),
      headingOverlap: rectanglesOverlap(headingCopy.getBoundingClientRect(), headingAction.getBoundingClientRect()),
      actionOverlap: rectanglesOverlap(actionSecondary.getBoundingClientRect(), actionPrimary.getBoundingClientRect()),
      clippedText,
      primaryHeight: Math.round(busy.getBoundingClientRect().height),
      dangerBorder: getComputedStyle(danger).borderColor,
      disabledCursor: getComputedStyle(disabled).cursor,
      cursor: getComputedStyle(busy).cursor,
      hasDesignCaptions: /Primary|Keyboard focus|Destructive|Disabled/.test(fixture.textContent ?? ""),
    };
  });

  const prefix = `${viewportName} ${route} primitive stress`;
  assert(result.documentOverflow <= 1, `${prefix}: document overflow ${result.documentOverflow}px`);
  assert(result.fieldOverflow <= 1, `${prefix}: field control overflow ${result.fieldOverflow}px`);
  assert(result.unitOverflow <= 1, `${prefix}: field unit overflow ${result.unitOverflow}px`);
  assert(!result.inputUnitOverlap, `${prefix}: unit overlaps the input`);
  assert(!result.headingOverlap, `${prefix}: heading copy overlaps its action`);
  assert(!result.actionOverlap, `${prefix}: secondary and primary action groups overlap`);
  assert(result.clippedText.length === 0, `${prefix}: clipped text ${result.clippedText.join(" | ")}`);
  assert(result.primaryHeight >= 52, `${prefix}: important action height ${result.primaryHeight}px is below 52px`);
  assert(result.dangerBorder !== "rgba(0, 0, 0, 0)", `${prefix}: danger state has no visible boundary`);
  assert(result.disabledCursor === "not-allowed", `${prefix}: disabled cursor is ${result.disabledCursor}`);
  assert(result.cursor === "progress", `${prefix}: loading cursor is ${result.cursor}`);
  assert(!result.hasDesignCaptions, `${prefix}: exposed English design captions`);
  await page.screenshot({ path: path.join(screenshotRoot, `${viewportName}-primitive-stress.png`), fullPage: true });
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
