import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://elitmlig-umber.vercel.app"),
  title: "ELİT TAHMİN LİGİ | Canlı Puan Durumu & Fikstür",
  description: "DFO, Master ve TFF Organizasyonları canlı skor takibi, haftalık tahminler ve anlık puan durumu simülasyonu.",
  keywords: ["Elit Tahmin Ligi", "DFO Puan Durumu", "Master Lig", "Futbol Tahmin", "Tahminmatik"],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "🏆 ELİT TAHMİN LİGİ - CANLI SKOR & PUAN DURUMU",
    description: "Haftalık müsabaka tahminleri, canlı skormatik ve güncel Master/TFF puan durumlarını inceleyin!",
    url: "https://elitmlig-umber.vercel.app",
    siteName: "Elit Tahmin Ligi",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Elit Tahmin Ligi Banner",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "🏆 ELİT TAHMİN LİGİ",
    description: "Canlı puan durumu ve futbol tahmin platformu.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-slate-950 text-slate-100 font-sans antialiased">
        {/* ÜST MENÜ NAVBAR */}
        <Navbar />
        {children}
      </body>
    </html>
  );
}