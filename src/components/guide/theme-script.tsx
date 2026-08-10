import { THEME_STORAGE_KEY } from "@/lib/theme/theme";

// Inline by design: this must resolve the canvas before React hydration.
const script = `(function(){var s=null;try{s=localStorage.getItem("${THEME_STORAGE_KEY}");}catch(e){}var d=s==="dark"||s==="light"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=d;document.documentElement.style.colorScheme=d;})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
