import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AdminManualDetailPage from "./page";

describe("AdminManualDetailPage", () => {
  it("uses the Botanical Atlas reading surface and global type system", async () => {
    const page = await AdminManualDetailPage({ params: Promise.resolve({ slug: "pink-princess" }) });
    const html = renderToStaticMarkup(page);

    expect(html).toContain('<main class="cl-atlas-reading cl-atlas-form-section cl-admin-manual-detail">');
    expect(html).not.toContain("font-family");
    expect(html).not.toContain("border-top:1px solid #ccc");
  });
});
