import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 🔴 KAYBOLAN ÜST MENÜYÜ (NAVBAR) GERİ ÇAĞIRIYORUZ 🔴
import Navbar from "@/components/Navbar"; 


const inter = Inter({ subsets: ["latin"] });

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
        
        {/* 🔴 SİTENİN TEPESİNDEKİ MENÜ BURADA DEVREYE GİRİYOR 🔴 */}
        <Navbar />
        
        {/* 🔴 ALT SAYFALAR (ARŞİV, TAHMİNLER VB.) BURADA YÜKLENİR 🔴 */}
        {children}

        {/* 🔴 VERCEL RADARI 🔴 */}
        <Analytics />
        <Analytics />
      </body>
    </html>
  );
}