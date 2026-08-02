import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Mono, IBM_Plex_Sans_Thai, Noto_Sans_Thai } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeScript } from "@/components/guide/theme-script";
import "./globals.css";
import "./guide.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const notoSansThai = Noto_Sans_Thai({ variable: "--font-thai", subsets: ["thai", "latin"] });
const plexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-plex",
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
});
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: "Plantlover Lab",
  description: "คู่มือเพาะเลี้ยงเนื้อเยื่อพืชแบบทีละขั้น พร้อมระดับหลักฐานของทุกคำแนะนำ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const fontVars = [geistSans, geistMono, notoSansThai, plexSansThai, plexMono]
    .map((font) => font.variable)
    .join(" ");
  return (
    <html lang="th" className={fontVars} suppressHydrationWarning>
      <body>
        <ThemeScript />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
