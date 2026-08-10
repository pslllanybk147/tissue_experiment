import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeScript } from "@/components/guide/theme-script";
import "./calm-lab.css";
import "./globals.css";
import "./guide.css";

const torsilp = localFont({
  src: "../../public/fonts/torsilp/TorsilpThamnganMangThoe.ttf",
  variable: "--font-torsilp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plantlover Lab",
  description: "คู่มือเพาะเลี้ยงเนื้อเยื่อพืชแบบทีละขั้น พร้อมระดับหลักฐานของทุกคำแนะนำ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={torsilp.variable} suppressHydrationWarning>
      <body>
        <ThemeScript />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
