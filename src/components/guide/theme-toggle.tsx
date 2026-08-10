"use client";

import { useEffect, useState } from "react";
import {
  oppositeTheme,
  resolveInitialTheme,
  themeToggleLabel,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const applied = document.documentElement.dataset.theme;
      setTheme(resolveInitialTheme(applied ?? null, window.matchMedia("(prefers-color-scheme: dark)").matches));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggle() {
    if (!theme) return;
    const next = oppositeTheme(theme);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // The current page still changes when storage is unavailable.
    }
  }

  if (!theme) {
    return (
      <button type="button" className="pl-action-secondary pl-toggle" disabled>
        กำลังตรวจสอบธีม
      </button>
    );
  }

  const label = themeToggleLabel(theme);
  return (
    <button
      type="button"
      className="pl-action-secondary pl-toggle"
      aria-label={label}
      aria-pressed={theme === "dark"}
      onClick={toggle}
    >
      {label}
    </button>
  );
}
