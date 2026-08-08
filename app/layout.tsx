import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DFO Tahmin Ligi",
  description: "DFO ve Master Futbol Tahmin Ligi Puan Durumu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-slate-950 min-h-screen text-slate-100`}>
        <Navbar />
        <main className="pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}