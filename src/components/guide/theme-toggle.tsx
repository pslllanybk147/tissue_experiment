"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  const attribute = document.documentElement.getAttribute("data-theme");
  if (attribute === "dark" || attribute === "light") return attribute;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  function toggle() {
    const next: Theme = (theme ?? currentTheme()) === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("pl-theme", next);
    } catch {
      // โหมดส่วนตัวของเบราว์เซอร์ปิดการเก็บค่า ธีมยังสลับได้แต่จะไม่จำข้ามหน้า
    }
    setTheme(next);
  }

  const label = theme === "dark" ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด";

  return (
    <button
      type="button"
      className="pl-chip pl-toggle"
      aria-label={label}
      onClick={toggle}
      style={{ background: "var(--pl-card)", cursor: "pointer", color: "var(--pl-ink)" }}
    >
      {theme === "dark" ? "โหมดสว่าง" : "โหมดมืด"}
    </button>
  );
}
