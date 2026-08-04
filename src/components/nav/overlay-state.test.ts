import { describe, expect, it } from "vitest";
import { initialOverlayState, overlayReducer } from "./overlay-state";

describe("overlayReducer", () => {
  it("เริ่มต้นปิดอยู่ที่หน้า picker", () => {
    expect(initialOverlayState).toEqual({ isOpen: false, screen: "picker" });
  });

  it("open เปิด overlay และตั้งจอเป็น picker เสมอ", () => {
    const state = overlayReducer({ isOpen: false, screen: "haiter" }, { type: "open" });
    expect(state).toEqual({ isOpen: true, screen: "picker" });
  });

  it("close ปิด overlay และรีเซ็ตจอกลับไป picker", () => {
    const state = overlayReducer({ isOpen: true, screen: "medium" }, { type: "close" });
    expect(state).toEqual({ isOpen: false, screen: "picker" });
  });

  it("select เปลี่ยนจอโดยไม่ปิด overlay", () => {
    const state = overlayReducer({ isOpen: true, screen: "picker" }, { type: "select", screen: "working-stock" });
    expect(state).toEqual({ isOpen: true, screen: "working-stock" });
  });

  it("back กลับไปหน้า picker โดยไม่ปิด overlay", () => {
    const state = overlayReducer({ isOpen: true, screen: "haiter" }, { type: "back" });
    expect(state).toEqual({ isOpen: true, screen: "picker" });
  });
});
