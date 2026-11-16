import type { Metadata } from "next";
import "./globals.css";
import { Manrope } from "next/font/google";
import { absoluteSiteUrl, SITE_URL } from "@/lib/site";

const manrope = Manrope({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-manrope", display: "swap" });

const siteTitle = "51-sonli maktab | Muzrabot tumani, Surxondaryo viloyati";
const siteDescription = "Surxondaryo viloyati Muzrabot tumani 51-sonli umumiy o'rta ta'lim maktabining rasmiy axborot portali.";

export const metadata: Metadata = {
  ...(SITE_URL ? { metadataBase: new URL(`${SITE_URL}/`) } : {}),
  title: { default: siteTitle, template: "%s | 51-sonli maktab" },
  description: siteDescription,
  alternates: { ...(absoluteSiteUrl() ? { canonical: absoluteSiteUrl() } : {}) },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    ...(absoluteSiteUrl() ? { url: absoluteSiteUrl() } : {}),
    siteName: siteTitle,
    title: siteTitle,
    description: siteDescription,
    ...(SITE_URL ? { images: ['/og-image.png'] } : {}),
  },
  twitter: { card: "summary_large_image", title: siteTitle, description: siteDescription, ...(SITE_URL ? { images: ['/og-image.svg'] } : {}) },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz" className={`scroll-smooth ${manrope.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink selection:bg-brand-600 selection:text-white">{children}</body>
    </html>
  );
}
