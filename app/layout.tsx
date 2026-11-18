import type { Metadata } from "next";
import "./globals.css";
import { Manrope } from "next/font/google";
import { SITE_URL, SITE_NAME, OG_IMAGE } from "@/lib/site";

const manrope = Manrope({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-manrope", display: "swap" });

const siteTitle = "51-sonli maktab | Muzrabot tumani, Surxondaryo viloyati";
const siteDescription = "Surxondaryo viloyati Muzrabot tumani 51-sonli umumiy o'rta ta'lim maktabining rasmiy axborot portali.";

// Canonical bu yerda berilmaydi: aks holda o'z canonical'i yo'q sahifalar bosh sahifaga ishora qilib qoladi.
export const metadata: Metadata = {
  ...(SITE_URL ? { metadataBase: new URL(`${SITE_URL}/`) } : {}),
  title: { default: siteTitle, template: "%s | 51-sonli maktab" },
  description: siteDescription,
  verification: { yandex: "a3c37a21a3aa3989"},
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    siteName: SITE_NAME,
    title: siteTitle,
    description: siteDescription,
    ...(SITE_URL ? { images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: siteTitle }] } : {}),
  },
  twitter: { card: "summary_large_image", title: siteTitle, description: siteDescription, ...(SITE_URL ? { images: [OG_IMAGE] } : {}) },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz" className={`scroll-smooth ${manrope.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink selection:bg-brand-600 selection:text-white">{children}</body>
    </html>
  );
}
