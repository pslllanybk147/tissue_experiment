import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeScript } from "@/components/guide/theme-script";
import "./calm-lab.css";
import "./globals.css";
import "./guide.css";

const sarabun = localFont({
  src: [
    { path: "../../public/fonts/sarabun/Sarabun-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/sarabun/Sarabun-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/sarabun/Sarabun-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/sarabun/Sarabun-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sarabun",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plantlover Lab",
  description: "คู่มือเพาะเลี้ยงเนื้อเยื่อพืชแบบทีละขั้น พร้อมระดับหลักฐานของทุกคำแนะนำ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={sarabun.variable} suppressHydrationWarning>
      <body>
        <ThemeScript />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
