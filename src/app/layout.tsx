import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

// Ping AR + LT (the Figma typeface) is proprietary; IBM Plex Sans Arabic is a
// close, freely available substitute. Swap to a local Ping AR + LT later via
// next/font/local without touching the rest of the app.
const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "استوديو التسويق | Salla Ads",
  description: "حوّل أي منتج إلى إعلان فيديو",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${arabic.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-card text-ink">
        {children}
      </body>
    </html>
  );
}
