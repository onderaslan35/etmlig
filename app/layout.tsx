import { OnlinePresenceTracker } from '@/components/OnlineVisitorsRadar';
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import PortalAuthGate from "@/components/PortalAuthGate";

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
        <OnlinePresenceTracker />

        <PortalAuthGate>
          {/* SİTENİN TEPESİNDEKİ MENÜ */}
          <Navbar />

          {/* ALT SAYFALAR */}
          {children}
        </PortalAuthGate>

        {/* VERCEL ANALİTİK */}
        <Analytics />
      </body>
    </html>
  );
}