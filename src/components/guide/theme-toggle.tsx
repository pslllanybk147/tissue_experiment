"use client";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  const attribute = document.documentElement.getAttribute("data-theme");
  if (attribute === "dark" || attribute === "light") return attribute;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// ป้ายบนปุ่มสลับด้วย CSS ไม่ใช่ state เพราะธีมปัจจุบันเป็นสถานะของ DOM
// การอ่านมาเก็บใน state จะทำให้ค่าที่ render บนเซิร์ฟเวอร์ไม่ตรงกับบนเบราว์เซอร์
export function ThemeToggle() {
  function toggle() {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("pl-theme", next);
    } catch {
      // โหมดส่วนตัวของเบราว์เซอร์ปิดการเก็บค่า ธีมยังสลับได้แต่จะไม่จำข้ามหน้า
    }
  }

  return (
    <button
      type="button"
      className="pl-action-secondary pl-toggle"
      aria-label="สลับระหว่างโหมดสว่างและโหมดมืด"
      onClick={toggle}
      style={{ cursor: "pointer" }}
    >
      <span className="pl-when-light">โหมดมืด</span>
      <span className="pl-when-dark">โหมดสว่าง</span>
    </button>
  );
}
