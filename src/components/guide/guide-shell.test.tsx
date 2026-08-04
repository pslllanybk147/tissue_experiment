import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/components/auth/auth-provider";
import { GuideShell } from "./guide-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

function renderShell(children: React.ReactNode, action?: React.ReactNode) {
  return renderToStaticMarkup(
    <AuthProvider>
      <GuideShell action={action}>{children}</GuideShell>
    </AuthProvider>,
  );
}

describe("GuideShell", () => {
  it("แสดงชื่อระบบและลิงก์กลับหน้าแรก", () => {
    const html = renderShell(<p>เนื้อหา</p>);

    expect(html).toContain("Plantlover Lab");
    expect(html).toContain('href="/"');
    expect(html).toContain("เนื้อหา");
  });

  it("มีลิงก์ข้ามไปเนื้อหาหลักสำหรับคนใช้คีย์บอร์ด", () => {
    const html = renderShell(<p>เนื้อหา</p>);

    expect(html).toContain('href="#pl-main"');
    expect(html).toContain('id="pl-main"');
  });

  it("มีเมนูหลักและปุ่มเครื่องคำนวณ", () => {
    const html = renderShell(<p>เนื้อหา</p>);

    expect(html).toContain("pl-nav-desktop");
    expect(html).toContain("pl-nav-mobile");
    expect(html).toContain("เครื่องคำนวณ");
  });
});
