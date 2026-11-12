import type { Metadata } from "next";
import "./globals.css";
import { Manrope } from "next/font/google";

const manrope = Manrope({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: "51-sonli maktab | Muzrabot tumani, Surxondaryo viloyati",
  description: "Surxondaryo viloyati Muzrabot tumani 51-sonli umumiy o'rta ta'lim maktabining rasmiy axborot portali.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz" className={`scroll-smooth ${manrope.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink selection:bg-brand-600 selection:text-white">{children}</body>
    </html>
  );
}
