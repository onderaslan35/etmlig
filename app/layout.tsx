import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

// 🔴 KARARGAH KÜNYESİ (SEO VE TARAYICI BİLGİLERİ)
export const metadata: Metadata = {
  title: "ETM Ligi Merkez Portalı",
  description: "Elit Tahmin Skor (Tam İsabet) Merkezi Karargahı",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        
        {/* 🔴 ANA CEPHELER (SAYFALAR) BURADA YÜKLENİR */}
        {children}

        {/* 🔴 EKMEL DEVRİMİ: VERCEL GÖRÜNMEZ RADARI (GÜNLÜK HİT SAYACI) 🔴 */}
        <Analytics />
        
      </body>
    </html>
  );
}